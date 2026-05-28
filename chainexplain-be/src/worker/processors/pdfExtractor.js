// pdf-parse v2 exports a class (PDFParse), NOT a callable function like v1.
// Usage: instantiate with { data: buffer }, then call .getText() to extract text.
const { PDFParse } = require('pdf-parse');
const { getFileStream } = require('../../shared/config/storage');
const logger = require('../../shared/utils/logger');

const extractText = async (fileUrl) => {
  logger.info(`Extracting text from ${fileUrl}`);

  try {
    // 1. Stream the file from MinIO/GCS into an in-memory Buffer
    const stream = await getFileStream(fileUrl);
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    // 2. Instantiate PDFParse with the raw PDF buffer as 'data'
    //    pdf-parse v2 accepts LoadParameters; 'data' is the binary PDF content.
    const parser = new PDFParse({ data: buffer });

    // 3. Extract text — getText() returns a TextResult with:
    //    .text  → the full concatenated text of the document
    //    .total → total number of pages
    const result = await parser.getText();

    // 4. Clean up the internal PDF.js worker to avoid memory leaks
    await parser.destroy();

    logger.info(`Successfully extracted ${result.text.length} characters from ${result.total} pages`);

    return {
      text: result.text,
      pageCount: result.total
    };
  } catch (error) {
    logger.error(`Failed to extract text from ${fileUrl}`, { error: error.message });
    throw new Error(`PDF Extraction failed: ${error.message}`);
  }
};

module.exports = { extractText };

