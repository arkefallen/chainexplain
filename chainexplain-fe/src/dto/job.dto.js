import { JOB_STATUS } from '../constants/jobStatus';

/**
 * Formats a structured summary object's top-level fields (project_vision + overall_summary)
 * into a markdown string for the main SummaryCard panel.
 * Chapters are intentionally excluded here — they go to ChunkAccordion via extractChapters().
 * If the input is already a string, it returns it as is.
 * 
 * @param {string|Object} summary - Summary data from backend
 * @returns {string} Markdown formatted summary (no chapters)
 */
export function formatSummaryToMarkdown(summary) {
  if (!summary) return '';
  if (typeof summary === 'string') return summary;

  let markdown = '';

  // 1. Project Vision
  if (summary.project_vision && summary.project_vision.trim()) {
    markdown += `**Visi Proyek**: ${summary.project_vision.trim()}\n\n`;
  }

  // 2. Overall Summary only — chapters are handled separately by ChunkAccordion
  if (summary.overall_summary && summary.overall_summary.trim()) {
    markdown += `${summary.overall_summary.trim()}\n\n`;
  }

  return markdown.trim();
}

/**
 * Extracts the chapters array from a structured summary object.
 * Returns an empty array if the input is already a string or chapters are absent.
 * 
 * @param {string|Object} summary - Summary data from backend
 * @returns {Array<{title: string, points: string[]}>} Chapters array
 */
export function extractChapters(summary) {
  if (!summary || typeof summary === 'string') return [];
  if (!Array.isArray(summary.chapters)) return [];
  return summary.chapters;
}


/**
 * Data Transfer Object (DTO) maps and normalizes raw API/Firestore shapes
 * into consistent, clean frontend models.
 */
export const jobDto = {
  /**
   * Maps response from POST /api/upload
   * Expected BE: { success: true, data: { jobId, status, fileName } }
   * 
   * @param {Object} apiResponse - Raw backend response
   * @returns {Object} Normalized upload result
   */
  mapUploadResponse(apiResponse) {
    const data = apiResponse?.data || apiResponse || {};
    return {
      jobId: data.jobId || data.id || '',
      status: data.status || JOB_STATUS.PENDING,
      fileName: data.fileName || '',
    };
  },

  /**
   * Maps response from GET /api/jobs/:jobId
   * Expected BE: { success: true, data: { id, status, progress, summaryId, summaryEn, project_name, fileName, createdAt } }
   * 
   * @param {Object} apiResponse - Raw backend response
   * @returns {Object} Normalized job status
   */
  mapJobStatusResponse(apiResponse) {
    const data = apiResponse?.data || apiResponse || {};
    
    const rawSummaryId = data.summaryId;
    const rawSummaryEn = data.summaryEn;

    // Normalize structured summary objects to markdown strings for backward compatibility
    const summaryId = formatSummaryToMarkdown(rawSummaryId);
    const summaryEn = formatSummaryToMarkdown(rawSummaryEn);

    const chaptersId = extractChapters(rawSummaryId);
    const chaptersEn = extractChapters(rawSummaryEn);

    // Map chunks array if available — each chunk gets both the summary text AND its chapter array
    const chunks = Array.isArray(data.chunks) 
      ? data.chunks.map((chunk, index) => ({
          index: chunk.index ?? index + 1,
          summaryId: formatSummaryToMarkdown(chunk.summaryId),
          summaryEn: formatSummaryToMarkdown(chunk.summaryEn),
          chaptersId: extractChapters(chunk.summaryId),
          chaptersEn: extractChapters(chunk.summaryEn),
        }))
      : [];

    return {
      id: data.id || data.jobId || '',
      status: data.status || JOB_STATUS.PENDING,
      progress: typeof data.progress === 'number' ? data.progress : 0,
      summaryId,
      summaryEn,
      chaptersId,
      chaptersEn,
      projectName: data.project_name || data.projectName || '',
      fileName: data.fileName || '',
      createdAt: data.createdAt || null,
      chunks,
      error: data.error || null,
    };
  },

  /**
   * Maps raw data from Firestore Document Snapshot
   * 
   * @param {Object} docData - Raw document data from Firestore
   * @returns {Object} Normalized Firestore job data
   */
  mapFirestoreSnapshot(docData) {
    if (!docData) return null;

    const rawSummaryId = docData.summaryId;
    const rawSummaryEn = docData.summaryEn;

    const summaryId = formatSummaryToMarkdown(rawSummaryId);
    const summaryEn = formatSummaryToMarkdown(rawSummaryEn);

    const chaptersId = extractChapters(rawSummaryId);
    const chaptersEn = extractChapters(rawSummaryEn);

    const chunks = Array.isArray(docData.chunks)
      ? docData.chunks.map((chunk, index) => ({
          index: chunk.index ?? index + 1,
          summaryId: formatSummaryToMarkdown(chunk.summaryId),
          summaryEn: formatSummaryToMarkdown(chunk.summaryEn),
          chaptersId: extractChapters(chunk.summaryId),
          chaptersEn: extractChapters(chunk.summaryEn),
        }))
      : [];

    return {
      status: docData.status || JOB_STATUS.PENDING,
      progress: typeof docData.progress === 'number' ? docData.progress : 0,
      summaryId,
      summaryEn,
      chaptersId,
      chaptersEn,
      projectName: docData.project_name || docData.projectName || '',
      chunks,
      error: docData.error || null,
    };
  }
};
