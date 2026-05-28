require('../../env');
const { PubSub } = require('@google-cloud/pubsub');

// Avoid credentials error when connecting to the emulator
const options = {
  projectId: process.env.GCP_PROJECT_ID || 'utopian-pen-495514-a8',
};

if (!process.env.PUBSUB_EMULATOR_HOST) {
  options.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const pubSubClient = new PubSub(options);

const topicId = process.env.PUBSUB_TOPIC_ID || 'chainexplain-jobs';

const ensureTopicExists = async () => {
  try {
    const [exists] = await pubSubClient.topic(topicId).exists();
    if (!exists) {
      await pubSubClient.createTopic(topicId);
      console.log(`Topic ${topicId} created.`);
    }
  } catch (error) {
    console.error(`Failed to ensure topic exists: ${error.message}`);
  }
};

const publishMessage = async (data) => {
  const dataBuffer = Buffer.from(JSON.stringify(data));
  try {
    await ensureTopicExists();
    const messageId = await pubSubClient.topic(topicId).publishMessage({ data: dataBuffer });
    return messageId;
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    throw error;
  }
};

module.exports = {
  pubSubClient,
  publishMessage,
  ensureTopicExists,
  topicId
};

