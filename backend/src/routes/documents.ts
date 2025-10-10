import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { DocumentService } from '../services/documentService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const documentService = new DocumentService();

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.post('/upload', authRateLimiter, authenticate, upload.single('document'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await documentService.uploadDocument(
      req.user!.id,
      null,
      req.file
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const document = await documentService.getDocument(req.params.id, req.user!.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const documents = await documentService.listDocuments(req.user!.id, limit, offset);
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
