require('./env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./api/routes/upload.routes');
const errorHandler = require('./api/middleware/errorHandler');
const logger = require('./shared/utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://utopian-pen-495514-a8.web.app',        // Production frontend (Firebase Hosting)
    'https://utopian-pen-495514-a8.firebaseapp.com', // Production frontend (Firebase Hosting - Backup)
    'http://localhost:5173',                // Local development (Vite dev)
    'http://localhost:5000',                // Local development (Firebase serve default)
    'http://localhost:5001',                // Local development (Firebase serve fallback)
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
}));

// Rate Limiting — Upload: max 5 req/min per IP (strict, file upload is expensive)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/upload', limiter);

// Rate Limiting — Polling: max 60 req/min per IP (= 1 req/sec, covers 2s polling with headroom)
const pollLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    standardHeaders: true,   // Return RateLimit-* headers so FE can detect it
    legacyHeaders: false,
    message: { success: false, error: 'Too many status requests. Please slow down.' }
});
app.use('/api/jobs', pollLimiter);

// Routes
app.use('/api', routes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`API Service running on port ${PORT}`);
});

module.exports = app;
