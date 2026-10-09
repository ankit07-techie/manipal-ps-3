import { Router, Request, Response } from 'express';
import { generateRedressalDraft } from '../services/draftGenerator.js';
import { storage } from '../storage/storageAdapter.js';
import { RedressalDraftRequest } from '../types.js';

export const redressalRouter = Router();

// POST /api/redressal/draft — Generate an evidence-linked grievance / inquiry draft
redressalRouter.post('/draft', async (req: Request, res: Response): Promise<void> => {
  try {
    const draftRequest: RedressalDraftRequest = req.body;

    if (!draftRequest.concern_type) {
      res.status(400).json({ error: 'Bad Request', message: 'concern_type is required.' });
      return;
    }

    // Retrieve clauses from stored analyses if analysis_id or clause IDs are referenced
    let availableClauses: any[] = [];
    const allAnalyses = await storage.listAnalyses();
    for (const a of allAnalyses) {
      availableClauses.push(...a.clauses);
    }

    const draft = generateRedressalDraft(draftRequest, availableClauses);
    res.status(200).json(draft);
  } catch (err: any) {
    console.error('Draft generation error:', err);
    res.status(500).json({ error: 'Draft Generation Failed', message: err.message });
  }
});

// GET /api/requests — List all tracked requests
redressalRouter.get('/requests', async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await storage.listRequests();
    res.status(200).json({ requests });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/requests — Create a tracked request from a draft
redressalRouter.post('/requests', async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_name, recipient_email, concern_type, subject, body_content, status, draft_id } = req.body;

    if (!service_name || !subject || !body_content) {
      res.status(400).json({ error: 'Bad Request', message: 'service_name, subject, and body_content are required.' });
      return;
    }

    const created = await storage.createRequest({
      draft_id,
      service_name,
      recipient_email: recipient_email || 'grievance@company.example',
      concern_type: concern_type || 'grievance_inquiry',
      status: status || 'draft',
      subject,
      body_content,
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Request Creation Failed', message: err.message });
  }
});

// GET /api/requests/:id — Get details of a single tracked request
redressalRouter.get('/requests/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const request = await storage.getRequest(id);
    if (!request) {
      res.status(404).json({ error: 'Not Found', message: `Request ${id} not found.` });
      return;
    }
    res.status(200).json(request);
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/requests/:id/events — Add a timeline event or update status
redressalRouter.post('/requests/:id/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { event_type, description, notes, statusChange } = req.body;

    if (!event_type || !description) {
      res.status(400).json({ error: 'Bad Request', message: 'event_type and description are required.' });
      return;
    }

    const updated = await storage.addRequestEvent(id, {
      event_type,
      description,
      notes,
      statusChange,
    });

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(404).json({ error: 'Event Addition Failed', message: err.message });
  }
});

// DELETE /api/requests/:id — Delete a tracked request (Privacy / Retention control)
redressalRouter.delete('/requests/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await storage.deleteRequest(id);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: `Request ${id} not found.` });
      return;
    }
    res.status(200).json({ success: true, message: `Request ${id} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});
