import { Router } from 'express';
import { SearchService } from '../services/searchService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const searchService = new SearchService();

router.get('/', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const results = await searchService.search(query, req.user!.id, null);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/extract', authRateLimiter, authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const entities = await searchService.extractEntities(text);
    res.json(entities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
