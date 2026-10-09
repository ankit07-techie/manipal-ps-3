import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { analyzeRouter } from './routes/analyzeRoutes.js';
import { preferenceRouter } from './routes/preferenceRoutes.js';
import { redressalRouter } from './routes/redressalRoutes.js';
import { legalRouter } from './routes/legalRoutes.js';
import { securityHeaders, normalizeAllowedOrigins } from './middleware/security.js';

export const app = express();

// Security Headers (nosniff, frameguard, xssProtection)
app.use(securityHeaders);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? normalizeAllowedOrigins(process.env.ALLOWED_ORIGINS)
    : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Test-Rate-Limit'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    app: 'PrivacyLens Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ai_configured: Boolean(config.geminiApiKey),
    storage_mode: config.storageMode,
  });
});

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/preferences', preferenceRouter);
app.use('/api/redressal', redressalRouter);
app.use('/api/legal', legalRouter);

// Root Welcome Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to PrivacyLens API — Evidence-backed privacy policy analysis and redressal engine.',
    docs: '/api/health',
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`PrivacyLens backend server listening on http://localhost:${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
  });
}
