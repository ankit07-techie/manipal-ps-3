import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractTextFromBuffer } from '../services/pdfExtractor.js';
import { analyzePolicyText } from '../services/aiAnalyzer.js';
import { storage } from '../storage/storageAdapter.js';
import { analysisRateLimiter } from '../middleware/security.js';

export const analyzeRouter = Router();

// Configure multer for in-memory file uploads with 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/analyze — Accepts JSON { text, source_label } or file upload
analyzeRouter.post('/', analysisRateLimiter, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    let rawText = '';
    let sourceLabel = req.body.source_label || 'Pasted Privacy Policy';

    if (req.file) {
      sourceLabel = req.body.source_label || req.file.originalname;
      const extracted = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
      rawText = extracted.rawText;
    } else if (req.body.text && typeof req.body.text === 'string') {
      rawText = req.body.text.trim();
    } else {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide either a "text" string in JSON body or upload a "file" (PDF or plain text).',
      });
      return;
    }

    if (rawText.length < 50) {
      res.status(400).json({
        error: 'Text Too Short',
        message: 'The submitted policy text is too short (minimum 50 characters required for analysis).',
      });
      return;
    }

    // Run AI / Semantic Analyzer with Quote Verification
    const analysis = await analyzePolicyText(rawText, sourceLabel);
    await storage.saveAnalysis(analysis);

    res.status(200).json(analysis);
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({
      error: 'Analysis Failed',
      message: err.message || 'An internal error occurred while processing the document.',
    });
  }
});

// GET /api/analyze/:id — Retrieve previously performed analysis
analyzeRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const analysis = await storage.getAnalysis(id);
    if (!analysis) {
      res.status(404).json({ error: 'Not Found', message: `Analysis ID ${id} not found.` });
      return;
    }
    res.status(200).json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});
