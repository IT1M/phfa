import express from 'express';
import { geminiService } from '../services/gemini.service';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Extract medical entities from text
router.post('/extract-entities', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const entities = await geminiService.extractMedicalEntities(text);
    res.json({ success: true, data: entities });
  } catch (error) {
    logger.error('Error in extract-entities endpoint:', error);
    res.status(500).json({ error: 'Failed to extract medical entities' });
  }
});

// Parse natural language search query
router.post('/parse-query', authenticate, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const parsedQuery = await geminiService.parseSearchQuery(query);
    res.json({ success: true, data: parsedQuery });
  } catch (error) {
    logger.error('Error in parse-query endpoint:', error);
    res.status(500).json({ error: 'Failed to parse search query' });
  }
});

// Summarize medical document
router.post('/summarize', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const summary = await geminiService.summarizeDocument(text);
    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Error in summarize endpoint:', error);
    res.status(500).json({ error: 'Failed to summarize document' });
  }
});

// Translate medical text
router.post('/translate', authenticate, async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Text and targetLang are required' });
    }

    if (!['ar', 'en'].includes(targetLang)) {
      return res.status(400).json({ error: 'targetLang must be "ar" or "en"' });
    }

    const translation = await geminiService.translateMedicalText(text, targetLang);
    res.json({ success: true, data: { translation, targetLang } });
  } catch (error) {
    logger.error('Error in translate endpoint:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// Normalize medical terms
router.post('/normalize-terms', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const terms = await geminiService.normalizeMedicalTerms(text);
    res.json({ success: true, data: terms });
  } catch (error) {
    logger.error('Error in normalize-terms endpoint:', error);
    res.status(500).json({ error: 'Failed to normalize medical terms' });
  }
});

// Extract ICD-10 codes
router.post('/icd10-codes', authenticate, async (req, res) => {
  try {
    const { diagnoses } = req.body;

    if (!diagnoses || !Array.isArray(diagnoses)) {
      return res.status(400).json({ error: 'Diagnoses array is required' });
    }

    const codes = await geminiService.extractICD10Codes(diagnoses);
    res.json({ success: true, data: codes });
  } catch (error) {
    logger.error('Error in icd10-codes endpoint:', error);
    res.status(500).json({ error: 'Failed to extract ICD-10 codes' });
  }
});

export default router;
