require('../env');
const logger = require('../shared/utils/logger');
const jobModel = require('../shared/models/job.model');
const { extractText } = require('./processors/pdfExtractor');
const { chunkText } = require('./processors/textChunker');
const { summarizeChunk, mergeSummaries } = require('./processors/aiSummarizer');

const processJob = async (jobId) => {
  try {
    // 1. Acquire Atomic Lock
    const lockAcquired = await jobModel.acquireJobLock(jobId);
    if (!lockAcquired) {
      logger.warn(`[Lock Guard] Job ${jobId} is already being processed or completed by another worker. Aborting gracefully.`);
      return; // Stop execution immediately to prevent duplication and save API credits
    }

    const job = await jobModel.getJob(jobId);
    if (!job) throw new Error('Job not found');
    
    // 2. Extraction
    await jobModel.updateJobStatus(jobId, 'EXTRACTING', 10);
    const { text, pageCount } = await extractText(job.fileUrl);
    
    // 3. Chunking
    await jobModel.updateJobStatus(jobId, 'CHUNKING', 20);
    const chunks = chunkText(text);
    await jobModel.updateJobStatus(jobId, 'CHUNKING', 30, { totalChunks: chunks.length });
    
    // 4. Summarizing
    await jobModel.updateJobStatus(jobId, 'SUMMARIZING', 40);
    const chunkResults = [];
    
    for (let i = 0; i < chunks.length; i++) {
      logger.info(`Summarizing chunk ${i + 1}/${chunks.length} for job ${jobId}`);
      try {
          const result = await summarizeChunk(chunks[i]);
          chunkResults.push({
            index: i,
            ...result
          });
          
          const progress = 40 + Math.floor(((i + 1) / chunks.length) * 50); // 40-90% progress
          await jobModel.updateJobChunks(jobId, chunkResults, progress, i + 1);
          
          // Rate limit buffer — 2s between chunks to avoid overwhelming the AI API
          await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
          logger.error(`Failed on chunk ${i}`, { error: e.message });
          // Could implement a specific chunk retry here
          throw e; // Fail the job and let pubsub retry
      }
    }
    
    // 5. Merge and Complete
    const { summaryId, summaryEn, projectName } = mergeSummaries(chunkResults);
    const metadata = {
        pageCount,
        extractedTextLength: text.length,
        modelUsed: 'deepseek-ai/DeepSeek-V4-Flash',
        tokenUsage: { input: 0, output: 0 } // Mock
    };
    
    await jobModel.completeJob(jobId, summaryId, summaryEn, projectName, metadata);
    logger.info(`Job ${jobId} completed successfully.`);
    
  } catch (error) {
    logger.error(`Job ${jobId} failed: ${error.message}`, { stack: error.stack });
    throw error; // Rethrow so subscriber knows it failed
  }
};

module.exports = { processJob };

// Only start listening if run directly
if (require.main === module) {
  const { listenForMessages } = require('./subscriber');
  logger.info('Starting Worker Service...');
  listenForMessages();
}
