const { pubSubClient, topicId } = require('../shared/config/pubsub');
const logger = require('../shared/utils/logger');
const jobModel = require('../shared/models/job.model');
const { processJob } = require('./index');

const subscriptionName = process.env.PUBSUB_SUBSCRIPTION_ID || 'chainexplain-jobs-sub';
const maxRetries = 3;

const listenForMessages = async () => {
  try {
    const topic = pubSubClient.topic(topicId);
    
    // Ensure topic exists (essential for emulator)
    const [topicExists] = await topic.exists();
    if (!topicExists) {
      await pubSubClient.createTopic(topicId);
      logger.info(`Created topic ${topicId}`);
    }

    const subscription = topic.subscription(subscriptionName);
    
    // Ensure subscription exists (essential for emulator)
    const [subExists] = await subscription.exists();
    if (!subExists) {
      await topic.createSubscription(subscriptionName, { ackDeadlineSeconds: 300 });
      logger.info(`Created subscription ${subscriptionName} with ackDeadlineSeconds: 300`);
    }

    const messageHandler = async (message) => {
      logger.info(`Received message ${message.id}:`);
      const data = JSON.parse(message.data.toString());
      const { jobId, attempt = 1 } = data;

      try {
        logger.info(`Processing job ${jobId}, attempt ${attempt}`);
        await processJob(jobId);
        message.ack();
        logger.info(`Message ${message.id} for job ${jobId} acknowledged.`);
      } catch (error) {
        logger.error(`Error processing job ${jobId}`, { error: error.message });

        // Non-retryable errors: config problems or AI content validation failures.
        // Retrying these will ALWAYS fail — it wastes API credits and causes deadlock loops.
        const isNonRetryable = (
          error.message.includes('Missing required environment variables') || // Startup config missing
          error.message.includes('out_of_scope') ||         // AI: document not crypto/web3 related
          error.message.includes('injection') ||             // AI: prompt injection detected
          error.message.includes('unreadable_content') ||   // AI: PDF is empty or unreadable
          error.message.includes('validation_error')        // AI: generic validation failure
        );

        if (isNonRetryable) {
          logger.warn(`Job ${jobId} failed with non-retryable error. Failing immediately without retry: ${error.message}`);
          await jobModel.failJob(jobId, error.message);
          message.ack(); // Ack to permanently remove from queue
          return;
        }

        if (attempt < maxRetries) {
          logger.info(`Retrying job ${jobId}. Attempt ${attempt + 1}/${maxRetries}`);
          message.ack(); // Ack and republish with incremented attempt count
          await pubSubClient.topic(topicId).publishMessage({ 
            data: Buffer.from(JSON.stringify({ jobId, attempt: attempt + 1 })) 
          });
        } else {
          logger.error(`Max retries reached for job ${jobId}. Failing job.`);
          await jobModel.failJob(jobId, error.message);
          message.ack(); // Ack to remove from queue since it failed completely
        }
      }
    };

    subscription.on('message', messageHandler);

    subscription.on('error', (error) => {
      logger.error('Received error from Pub/Sub subscription', { error: error.message });
    });

    logger.info(`Listening for messages on ${subscriptionName}`);
  } catch (error) {
    logger.error('Failed to initialize subscriber', { error: error.message });
  }
};

module.exports = { listenForMessages };
