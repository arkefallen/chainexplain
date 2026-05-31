require('../env');
const express = require('express');
const logger = require('../shared/utils/logger');
const { processJob } = require('./index');
const jobModel = require('../shared/models/job.model');

const app = express();
app.use(express.json());

const maxRetries = 3;

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'worker-ok' });
});

// Pub/Sub Push endpoint
// Pub/Sub sends a POST with { message: { data: base64string, messageId, ... }, subscription }
app.post('/pubsub/push', async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || !message.data) {
      logger.warn('Invalid Pub/Sub message received');
      return res.status(400).send('Bad Request: missing message data');
    }

    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
    const { jobId, attempt = 1 } = data;

    logger.info(`Received push message for job ${jobId}, attempt ${attempt}`);

    try {
      await processJob(jobId);
      logger.info(`Job ${jobId} completed successfully.`);
      res.status(200).send('OK'); // Ack the message
    } catch (error) {
      logger.error(`Error processing job ${jobId}`, { error: error.message });

      // Non-retryable errors: config problems or AI content validation failures.
      // Retrying these will ALWAYS fail — it wastes API credits and causes deadlock loops.
      const isNonRetryable = (
        error.message.includes('Missing required environment variables') ||
        error.message.includes('out_of_scope') ||
        error.message.includes('injection') ||
        error.message.includes('unreadable_content') ||
        error.message.includes('validation_error')
      );

      if (isNonRetryable) {
        logger.warn(`Job ${jobId} failed with non-retryable error: ${error.message}`);
        await jobModel.failJob(jobId, error.message);
        res.status(200).send('OK'); // Ack — don't retry
        return;
      }

      if (attempt >= maxRetries) {
        logger.error(`Max retries reached for job ${jobId}. Failing job.`);
        await jobModel.failJob(jobId, error.message);
        res.status(200).send('OK'); // Ack — stop retrying
        return;
      }

      // Return 500 so Pub/Sub will automatically retry delivery
      logger.info(`Returning 500 to trigger Pub/Sub retry for job ${jobId}`);
      res.status(500).send('Processing failed, will retry');
    }
  } catch (error) {
    logger.error('Failed to parse Pub/Sub message', { error: error.message });
    res.status(400).send('Bad Request');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Worker Push Server listening on port ${PORT}`);
});
