// Validation middleware for upload endpoint (manual validation — no external library needed)

const validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  // File size and type are handled by multer, but we can double check
  if (req.file.mimetype !== 'application/pdf') {
     return res.status(400).json({
        success: false,
        error: 'Only PDF files are allowed'
     });
  }

  if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 10MB limit'
     });
  }

  next();
};

module.exports = {
  validateUpload
};
