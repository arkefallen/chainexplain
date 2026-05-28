require('../../env');
const path = require('path');
const fs = require('fs');
const logger = require('../../shared/utils/logger');

const AI_API_URL = process.env.AI_API_URL;
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;

// Fail-fast: crash immediately on startup if required AI config is missing.
// This prevents the cryptic 'Failed to parse URL from undefined' loop.
const REQUIRED_ENV = { AI_API_URL, AI_API_KEY, AI_MODEL };
const missingEnv = Object.entries(REQUIRED_ENV).filter(([, v]) => !v).map(([k]) => k);
if (missingEnv.length > 0) {
  throw new Error(`[aiSummarizer] Missing required environment variables: ${missingEnv.join(', ')}. Check your .env file and docker-compose.yml.`);
}

const MAX_RETRIES = 3;

/**
 * System prompt loaded once at module initialization from the .txt file.
 * This avoids repeated disk I/O on every summarization call.
 */
const loadedSystemPrompt = fs.readFileSync(
  path.join(__dirname, 'prompts', 'summarizer.system.txt'),
  'utf8'
);

/**
 * Summarize a text chunk using AI completions.
 * @param {string} chunkText 
 * @returns {Promise<object>}
 */
const summarizeChunk = async (chunkText) => {
  // Load system prompt from file — read once at module scope, cached in memory
  const systemPrompt = loadedSystemPrompt;
  const userPrompt = chunkText;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(
        `Sending chunk to AI API (model: ${AI_MODEL}, ` +
        `length: ${chunkText.length} chars, attempt: ${attempt}/${MAX_RETRIES})...`
      );

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid API response structure: missing choices content');
      }

      // Strip markdown JSON fences if the model wraps the response in ```json ... ```
      content = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

      const parsedResult = JSON.parse(content);

      // AI-layer validation: even on HTTP 200, the model may signal a content/safety failure
      // (e.g. out_of_scope, injection, unreadable_content). Throw so it propagates as an exception.
      if (parsedResult.error === true) {
        const category = parsedResult.error_category || 'validation_error';
        const message = parsedResult.message || 'AI validation failed with no message.';
        throw new Error(`${category} - ${message}`);
      }

      if (!parsedResult.summary_id || !parsedResult.summary_en) {
        throw new Error('Parsed response does not contain summary_id or summary_en');
      }

      logger.info('Successfully received and parsed bilingual summary from AI');
      return parsedResult;

    } catch (error) {
      logger.error(`Attempt ${attempt}/${MAX_RETRIES} failed`, { error: error.message });

      if (attempt < MAX_RETRIES) {
        const waitMs = attempt * 5000; // Exponential backoff: 5s, 10s
        logger.warn(`Waiting ${waitMs / 1000}s before retrying...`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      // All attempts failed
      throw new Error(`Failed to generate AI summary: ${error.message}`);
    }
  }
};

/**
 * Merge individual chunk summaries.
 */
const mergeSummaries = (chunksResults) => {
  // 1. Extract project_name and project_vision (take first non-empty from the chunks)
  let projectName = '';
  let projectVisionId = '';
  let projectVisionEn = '';

  for (const chunk of chunksResults) {
    if (!projectName && chunk.project_name && chunk.project_name.trim()) {
      projectName = chunk.project_name.trim();
    }
    if (!projectVisionId && chunk.summary_id?.project_vision && chunk.summary_id.project_vision.trim()) {
      projectVisionId = chunk.summary_id.project_vision.trim();
    }
    if (!projectVisionEn && chunk.summary_en?.project_vision && chunk.summary_en.project_vision.trim()) {
      projectVisionEn = chunk.summary_en.project_vision.trim();
    }
    if (projectName && projectVisionId && projectVisionEn) break;
  }

  projectName = projectName || 'Unknown Project';
  projectVisionId = projectVisionId || 'Tidak secara eksplisit dinyatakan dalam dokumen.';
  projectVisionEn = projectVisionEn || 'Not explicitly stated in the document.';

  // 2. Combine overall summaries
  const overallSummaryId = chunksResults
    .map(c => c.summary_id?.overall_summary)
    .filter(Boolean)
    .join('\n\n');

  const overallSummaryEn = chunksResults
    .map(c => c.summary_en?.overall_summary)
    .filter(Boolean)
    .join('\n\n');

  // 3. Flatten chapters
  const chaptersId = [];
  const chaptersEn = [];

  chunksResults.forEach(c => {
    if (c.summary_id?.chapters && Array.isArray(c.summary_id.chapters)) {
      chaptersId.push(...c.summary_id.chapters);
    }
    if (c.summary_en?.chapters && Array.isArray(c.summary_en.chapters)) {
      chaptersEn.push(...c.summary_en.chapters);
    }
  });

  return {
    projectName,
    summaryId: {
      project_vision: projectVisionId,
      overall_summary: overallSummaryId,
      chapters: chaptersId
    },
    summaryEn: {
      project_vision: projectVisionEn,
      overall_summary: overallSummaryEn,
      chapters: chaptersEn
    }
  };
};

module.exports = { summarizeChunk, mergeSummaries };
