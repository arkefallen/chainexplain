const { db } = require('../config/firebase');

const jobsCollection = db.collection('jobs');

const createJob = async (jobData) => {
  const { id } = jobData;
  await jobsCollection.doc(id).set({
    ...jobData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
};

const getJob = async (jobId) => {
  const doc = await jobsCollection.doc(jobId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data();
};

const updateJobStatus = async (jobId, status, progress, extraData = {}) => {
  await jobsCollection.doc(jobId).update({
    status,
    progress,
    updatedAt: new Date(),
    ...extraData
  });
};

const updateJobChunks = async (jobId, chunksData, progress, processedChunks) => {
    await jobsCollection.doc(jobId).update({
        chunks: chunksData,
        progress,
        processedChunks,
        updatedAt: new Date()
    });
};

const acquireJobLock = async (jobId) => {
  const jobRef = jobsCollection.doc(jobId);
  try {
    return await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(jobRef);
      if (!doc.exists) {
        return false;
      }
      
      const jobData = doc.data();
      if (jobData.status !== 'PENDING') {
        return false; // Already locked or completed!
      }
      
      transaction.update(jobRef, {
        status: 'PROCESSING',
        progress: 5,
        updatedAt: new Date()
      });
      return true;
    });
  } catch (error) {
    console.error(`Error acquiring lock for job ${jobId}: ${error.message}`);
    return false;
  }
};

const completeJob = async (jobId, summaryId, summaryEn, projectName, metadata) => {
  await jobsCollection.doc(jobId).update({
    status: 'COMPLETED',
    progress: 100,
    summaryId,
    summaryEn,
    project_name: projectName,
    metadata,
    updatedAt: new Date(),
    completedAt: new Date()
  });
};

const failJob = async (jobId, errorMsg) => {
  await jobsCollection.doc(jobId).update({
    status: 'FAILED',
    error: errorMsg,
    updatedAt: new Date(),
    completedAt: new Date()
  });
};

module.exports = {
  createJob,
  getJob,
  updateJobStatus,
  updateJobChunks,
  acquireJobLock,
  completeJob,
  failJob,
};
