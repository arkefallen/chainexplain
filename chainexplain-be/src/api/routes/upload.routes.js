const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middleware/multer');
const { validateUpload } = require('../validators/upload.validator');

router.post('/upload', upload.single('file'), validateUpload, uploadController.uploadPdf);
router.get('/jobs/:jobId', uploadController.getJobStatus);
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

module.exports = router;
