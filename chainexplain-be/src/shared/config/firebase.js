require('../../env');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const config = {
      projectId: process.env.GCP_PROJECT_ID || 'utopian-pen-495514-a8'
    };

    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      config.credential = admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }

    admin.initializeApp(config);
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const db = admin.firestore();

module.exports = { admin, db };
