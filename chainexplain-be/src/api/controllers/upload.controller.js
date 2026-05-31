const crypto = require('crypto');
const { uploadFile } = require('../../shared/config/storage');
const { publishMessage } = require('../../shared/config/pubsub');
const jobModel = require('../../shared/models/job.model');
const logger = require('../../shared/utils/logger');
const fs = require('fs');

const uploadPdf = async (req, res, next) => {
  try {
    const file = req.file;
    const jobId = crypto.randomUUID();
    const destination = `uploads/${jobId}/${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    logger.info(`Starting upload pipeline for file: '${file.originalname}' (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    logger.info(`[Step 1/3] Uploading file to Storage. Destination: ${destination}...`);

    // Upload to Storage
    const fileUrl = await uploadFile(file.path, destination);
    logger.info(`[Step 1/3] File successfully uploaded. URL: ${fileUrl}`);

    // Create job in Firestore
    logger.info(`[Step 2/3] Initializing Firestore job entry for ID: ${jobId} with status: PENDING...`);
    const jobData = {
      id: jobId,
      fileName: file.originalname,
      fileUrl: fileUrl,
      fileSize: file.size,
      status: 'PENDING',
      progress: 0,
      totalChunks: 0,
      processedChunks: 0,
      project_name: null,
      summaryId: null,
      summaryEn: null,
      chunks: [],
      error: null,
      metadata: {
        pageCount: 0,
        extractedTextLength: 0,
        modelUsed: process.env.AI_MODEL,
        tokenUsage: { input: 0, output: 0 }
      }
    };

    await jobModel.createJob(jobData);
    logger.info(`[Step 2/3] Firestore job entry initialized successfully.`);

    // Publish to Pub/Sub
    logger.info(`[Step 3/3] Publishing job trigger notification to Pub/Sub topic...`);
    await publishMessage({ jobId });
    logger.info(`[Step 3/3] Pub/Sub notification sent successfully.`);

    logger.info(`=== [SUCCESS] Pipeline initiated for Job: ${jobId} ===`);

    // Clean up local temp file
    fs.unlink(file.path, (err) => {
        if (err) logger.warn(`Failed to delete temp file ${file.path}`, { error: err.message });
    });

    res.status(201).json({
      success: true,
      data: {
        jobId: jobId,
        status: 'PENDING',
        fileName: file.originalname
      }
    });

  } catch (error) {
    logger.error('Upload failed', { error: error.message, stack: error.stack });
    next(error);
  }
};

const getJobStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const job = await jobModel.getJob(jobId);

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: job.id,
                status: job.status,
                progress: job.progress,
                summaryId: job.summaryId,
                summaryEn: job.summaryEn,
                project_name: job.project_name || null,
                fileName: job.fileName,
                createdAt: job.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  uploadPdf,
  getJobStatus
};
