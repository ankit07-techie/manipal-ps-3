import { Router, Request, Response } from 'express';
import { storage } from '../storage/storageAdapter.js';

export const preferenceRouter = Router();

// GET /api/preferences — List all consumer preference records
preferenceRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const preferences = await storage.listPreferences();
    res.status(200).json({ preferences });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PATCH /api/preferences/:id — Update a preference value or status
preferenceRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { current_value, status, status_explanation } = req.body;

    const updated = await storage.updatePreference(id, {
      current_value,
      status,
      status_explanation,
    });

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(404).json({ error: 'Update Failed', message: err.message });
  }
});

// POST /api/preferences — Add a new preference record
preferenceRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_name, preference_key, title, description, current_value, default_value, status, status_explanation } = req.body;

    if (!service_name || !preference_key || !title) {
      res.status(400).json({ error: 'Bad Request', message: 'service_name, preference_key, and title are required.' });
      return;
    }

    const created = await storage.createPreference({
      service_name,
      preference_key,
      title,
      description: description || '',
      current_value: current_value !== undefined ? current_value : false,
      default_value: default_value !== undefined ? default_value : true,
      status: status || 'local_record',
      is_demo: true,
      status_explanation: status_explanation || 'Locally recorded preference.',
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Creation Failed', message: err.message });
  }
});
