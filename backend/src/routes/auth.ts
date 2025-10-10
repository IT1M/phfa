import { Router } from 'express';
import { AuthService } from '../services/authService';
import { guestRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const authService = new AuthService();

router.post('/register', guestRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', guestRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
