require('../../env');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const config = {
      projectId: process.env.GCP_PROJECT_ID || 'utopian-pen-495514-a8'
    };

    // Di Cloud Run, GOOGLE_APPLICATION_CREDENTIALS tidak perlu di-set.
    // Firebase Admin SDK otomatis pakai Application Default Credentials (ADC)
    // dari service account yang di-attach ke Cloud Run service.
    // Hanya set credential secara eksplisit jika env var tersedia (local dev).
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      config.credential = admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }

    admin.initializeApp(config);
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const db = admin.firestore();

module.exports = { admin, db };
