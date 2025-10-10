import { Router } from 'express';
import { intelligentSearchService } from '../services/intelligentSearchService';
import { geminiService } from '../services/gemini.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/intelligent-search
 * Main intelligent search endpoint with NLP
 */
router.post('/', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { query, page, pageSize, saveQuery } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string' 
      });
    }

    logger.info(`Intelligent search request: "${query}" by user ${req.user!.id}`);

    const results = await intelligentSearchService.search(
      query,
      req.user!.id,
      { page, pageSize, saveQuery }
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    logger.error('Intelligent search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/intelligent-search/suggestions
 * Get search suggestions based on history
 */
router.get('/suggestions', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const suggestions = await intelligentSearchService.getSearchSuggestions(
      req.user!.id,
      limit
    );

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    logger.error('Get suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      message: error.message 
    });
  }
});

/**
 * POST /api/intelligent-search/similar-patients
 * Find similar patients based on a reference document
 */
router.post('/similar-patients', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { documentId, limit } = req.body;

    if (!documentId) {
      return res.status(400).json({ 
        error: 'Document ID is required' 
      });
    }

    const similarPatients = await intelligentSearchService.findSimilarPatients(
      documentId,
      req.user!.id,
      limit
    );

    res.json({
      success: true,
      data: similarPatients,
    });
  } catch (error: any) {
    logger.error('Find similar patients error:', error);
    res.status(500).json({ 
      error: 'Failed to find similar patients',
      message: error.message 
    });
  }
});

/**
 * POST /api/intelligent-search/bulk
 * Perform bulk search operations
 */
router.post('/bulk', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { queries } = req.body;

    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({ 
        error: 'Queries array is required' 
      });
    }

    if (queries.length > 10) {
      return res.status(400).json({ 
        error: 'Maximum 10 queries allowed per bulk search' 
      });
    }

    const results = await intelligentSearchService.bulkSearch(
      queries,
      req.user!.id
    );

    // Convert Map to object for JSON response
    const resultsObj: any = {};
    results.forEach((value, key) => {
      resultsObj[key] = value;
    });

    res.json({
      success: true,
      data: resultsObj,
    });
  } catch (error: any) {
    logger.error('Bulk search error:', error);
    res.status(500).json({ 
      error: 'Bulk search failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/intelligent-search/analytics
 * Get search analytics for the user
 */
router.get('/analytics', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const analytics = await intelligentSearchService.getSearchAnalytics(req.user!.id);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics',
      message: error.message 
    });
  }
});

/**
 * POST /api/intelligent-search/parse-query
 * Parse a natural language query without executing search
 */
router.post('/parse-query', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string' 
      });
    }

    const parsedQuery = await geminiService.parseSearchQuery(query);

    res.json({
      success: true,
      data: parsedQuery,
    });
  } catch (error: any) {
    logger.error('Parse query error:', error);
    res.status(500).json({ 
      error: 'Failed to parse query',
      message: error.message 
    });
  }
});

/**
 * POST /api/intelligent-search/translate
 * Translate medical text between Arabic and English
 */
router.post('/translate', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ 
        error: 'Text and target language are required' 
      });
    }

    if (!['ar', 'en'].includes(targetLang)) {
      return res.status(400).json({ 
        error: 'Target language must be "ar" or "en"' 
      });
    }

    const translation = await geminiService.translateMedicalText(text, targetLang);

    res.json({
      success: true,
      data: {
        original: text,
        translated: translation,
        targetLang,
      },
    });
  } catch (error: any) {
    logger.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/intelligent-search/normalize-terms
 * Normalize medical terms in text
 */
router.post('/normalize-terms', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ 
        error: 'Text is required' 
      });
    }

    const normalizedTerms = await geminiService.normalizeMedicalTerms(text);

    res.json({
      success: true,
      data: normalizedTerms,
    });
  } catch (error: any) {
    logger.error('Normalize terms error:', error);
    res.status(500).json({ 
      error: 'Failed to normalize terms',
      message: error.message 
    });
  }
});

/**
 * POST /api/intelligent-search/extract-icd10
 * Extract ICD-10 codes from diagnoses
 */
router.post('/extract-icd10', authRateLimiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { diagnoses } = req.body;

    if (!Array.isArray(diagnoses) || diagnoses.length === 0) {
      return res.status(400).json({ 
        error: 'Diagnoses array is required' 
      });
    }

    const icd10Codes = await geminiService.extractICD10Codes(diagnoses);

    res.json({
      success: true,
      data: icd10Codes,
    });
  } catch (error: any) {
    logger.error('Extract ICD-10 error:', error);
    res.status(500).json({ 
      error: 'Failed to extract ICD-10 codes',
      message: error.message 
    });
  }
});

export default router;
