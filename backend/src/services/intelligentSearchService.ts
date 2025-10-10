import { pool } from '../config/database';
import { geminiService, SearchQuery } from './gemini.service';
import { logger } from '../utils/logger';

interface SearchFilters {
  conditions?: string[];
  ageRange?: { min?: number; max?: number };
  dateRange?: { start?: string; end?: string };
  medications?: string[];
  locations?: string[];
  gender?: string;
  allergies?: string[];
  urgencyLevel?: string;
}

interface SearchResult {
  documentId: string;
  patientName?: string;
  patientId?: string;
  relevanceScore: number;
  matchedConditions: string[];
  matchedMedications: string[];
  snippet: string;
  highlights: string[];
  metadata: any;
  createdAt: Date;
}

interface PaginatedResults {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  executionTime: number;
  query: string;
  filters: SearchFilters;
}

export class IntelligentSearchService {
  /**
   * Main search method with NLP processing
   */
  async search(
    query: string,
    userId: string | null,
    options: {
      page?: number;
      pageSize?: number;
      saveQuery?: boolean;
    } = {}
  ): Promise<PaginatedResults> {
    const startTime = Date.now();
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const offset = (page - 1) * pageSize;

    try {
      // Parse natural language query using Gemini
      logger.info(`Parsing search query: ${query}`);
      const parsedQuery = await geminiService.parseSearchQuery(query);

      // Build and execute search
      const filters = this.buildFilters(parsedQuery);
      const { results, total } = await this.executeSearch(
        query,
        filters,
        userId,
        pageSize,
        offset
      );

      const executionTime = Date.now() - startTime;

      // Save search query if requested
      if (options.saveQuery !== false) {
        await this.saveSearchQuery(userId, query, parsedQuery, results.length, executionTime);
      }

      return {
        results,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        executionTime,
        query,
        filters,
      };
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Build structured filters from parsed query
   */
  private buildFilters(parsedQuery: SearchQuery): SearchFilters {
    return {
      conditions: parsedQuery.conditions?.filter(c => c) || [],
      ageRange: parsedQuery.ageRange,
      dateRange: parsedQuery.dateRange,
      medications: parsedQuery.medications?.filter(m => m) || [],
      locations: parsedQuery.locations?.filter(l => l) || [],
      urgencyLevel: parsedQuery.urgencyLevel,
    };
  }

  /**
   * Execute database search with filters
   */
  private async executeSearch(
    query: string,
    filters: SearchFilters,
    userId: string | null,
    limit: number,
    offset: number
  ): Promise<{ results: SearchResult[]; total: number }> {
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Build dynamic SQL query
    let sql = `
      WITH ranked_documents AS (
        SELECT DISTINCT
          d.id,
          d.file_name,
          d.extracted_text,
          d.extracted_data,
          d.created_at,
          pi.patient_name,
          pi.patient_id,
          pi.date_of_birth,
          pi.gender,
          ts_rank(
            to_tsvector('english', COALESCE(d.extracted_text, '')),
            plainto_tsquery('english', $${paramIndex})
          ) as text_rank,
          json_agg(DISTINCT jsonb_build_object(
            'type', me.entity_type,
            'value', me.entity_value,
            'confidence', me.confidence
          )) FILTER (WHERE me.id IS NOT NULL) as entities
        FROM documents d
        LEFT JOIN patient_info pi ON d.id = pi.document_id
        LEFT JOIN medical_entities me ON d.id = me.document_id
        WHERE 1=1
    `;
    queryParams.push(query);
    paramIndex++;

    // User filter
    if (userId) {
      sql += ` AND d.user_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    // Text search filter
    sql += ` AND to_tsvector('english', COALESCE(d.extracted_text, '')) @@ plainto_tsquery('english', $${paramIndex - 1})`;

    // Condition filters
    if (filters.conditions && filters.conditions.length > 0) {
      const conditionPattern = filters.conditions.map(c => `%${c}%`).join('|');
      sql += ` AND (
        d.extracted_text ~* $${paramIndex}
        OR EXISTS (
          SELECT 1 FROM medical_entities me2
          WHERE me2.document_id = d.id
          AND me2.entity_type IN ('diagnosis', 'condition')
          AND me2.entity_value ~* $${paramIndex}
        )
      )`;
      queryParams.push(conditionPattern);
      paramIndex++;
    }

    // Age range filter
    if (filters.ageRange && (filters.ageRange.min || filters.ageRange.max)) {
      sql += ` AND pi.date_of_birth IS NOT NULL`;
      if (filters.ageRange.min) {
        sql += ` AND EXTRACT(YEAR FROM AGE(pi.date_of_birth)) >= $${paramIndex}`;
        queryParams.push(filters.ageRange.min);
        paramIndex++;
      }
      if (filters.ageRange.max) {
        sql += ` AND EXTRACT(YEAR FROM AGE(pi.date_of_birth)) <= $${paramIndex}`;
        queryParams.push(filters.ageRange.max);
        paramIndex++;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        sql += ` AND d.created_at >= $${paramIndex}`;
        queryParams.push(filters.dateRange.start);
        paramIndex++;
      }
      if (filters.dateRange.end) {
        sql += ` AND d.created_at <= $${paramIndex}`;
        queryParams.push(filters.dateRange.end);
        paramIndex++;
      }
    }

    // Medication filters
    if (filters.medications && filters.medications.length > 0) {
      const medPattern = filters.medications.map(m => `%${m}%`).join('|');
      sql += ` AND EXISTS (
        SELECT 1 FROM medical_entities me3
        WHERE me3.document_id = d.id
        AND me3.entity_type = 'medication'
        AND me3.entity_value ~* $${paramIndex}
      )`;
      queryParams.push(medPattern);
      paramIndex++;
    }

    // Location filters
    if (filters.locations && filters.locations.length > 0) {
      const locPattern = filters.locations.map(l => `%${l}%`).join('|');
      sql += ` AND d.extracted_text ~* $${paramIndex}`;
      queryParams.push(locPattern);
      paramIndex++;
    }

    sql += `
        GROUP BY d.id, pi.patient_name, pi.patient_id, pi.date_of_birth, pi.gender
      ),
      scored_results AS (
        SELECT
          *,
          (text_rank * 10 + 
           CASE WHEN patient_name IS NOT NULL THEN 2 ELSE 0 END +
           CASE WHEN patient_id IS NOT NULL THEN 1 ELSE 0 END
          ) as final_score
        FROM ranked_documents
      )
      SELECT * FROM scored_results
      ORDER BY final_score DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    // Execute search
    const result = await pool.query(sql, queryParams);

    // Get total count
    const countSql = sql.split('LIMIT')[0].replace('SELECT * FROM scored_results', 'SELECT COUNT(*) as total FROM scored_results');
    const countResult = await pool.query(countSql, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Process results
    const results = result.rows.map((row: any) => this.processSearchResult(row, query, filters));

    return { results, total };
  }

  /**
   * Process individual search result
   */
  private processSearchResult(row: any, query: string, filters: SearchFilters): SearchResult {
    const matchedConditions = this.extractMatchedConditions(row.entities, filters.conditions);
    const matchedMedications = this.extractMatchedMedications(row.entities, filters.medications);
    const snippet = this.extractSnippet(row.extracted_text, query);
    const highlights = this.extractHighlights(row.extracted_text, query, filters);

    return {
      documentId: row.id,
      patientName: row.patient_name,
      patientId: row.patient_id,
      relevanceScore: parseFloat(row.final_score || row.text_rank),
      matchedConditions,
      matchedMedications,
      snippet,
      highlights,
      metadata: {
        fileName: row.file_name,
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        entities: row.entities,
        extractedData: row.extracted_data,
      },
      createdAt: row.created_at,
    };
  }

  /**
   * Extract matched conditions from entities
   */
  private extractMatchedConditions(entities: any[], conditions?: string[]): string[] {
    if (!entities || !conditions) return [];
    
    return entities
      .filter(e => e.type === 'diagnosis' || e.type === 'condition')
      .map(e => e.value)
      .filter(value => 
        conditions.some(c => 
          value.toLowerCase().includes(c.toLowerCase()) ||
          c.toLowerCase().includes(value.toLowerCase())
        )
      );
  }

  /**
   * Extract matched medications from entities
   */
  private extractMatchedMedications(entities: any[], medications?: string[]): string[] {
    if (!entities || !medications) return [];
    
    return entities
      .filter(e => e.type === 'medication')
      .map(e => e.value)
      .filter(value => 
        medications.some(m => 
          value.toLowerCase().includes(m.toLowerCase()) ||
          m.toLowerCase().includes(value.toLowerCase())
        )
      );
  }

  /**
   * Extract relevant snippet from text
   */
  private extractSnippet(text: string, query: string, length: number = 300): string {
    if (!text) return '';

    const queryTerms = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    
    let bestPosition = 0;
    let maxScore = 0;

    for (let i = 0; i < text.length - length; i += 50) {
      const snippet = textLower.substring(i, i + length);
      const score = queryTerms.reduce((acc, term) => {
        return acc + (snippet.includes(term) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestPosition = i;
      }
    }

    const snippet = text.substring(bestPosition, bestPosition + length);
    return bestPosition > 0 ? '...' + snippet + '...' : snippet + '...';
  }

  /**
   * Extract highlights from text
   */
  private extractHighlights(text: string, query: string, filters: SearchFilters): string[] {
    if (!text) return [];

    const highlights: string[] = [];
    const terms = [
      ...query.split(/\s+/),
      ...(filters.conditions || []),
      ...(filters.medications || []),
    ];

    terms.forEach(term => {
      const regex = new RegExp(`(.{0,50}${term}.{0,50})`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        highlights.push(...matches.slice(0, 2));
      }
    });

    return [...new Set(highlights)].slice(0, 5);
  }

  /**
   * Save search query to database
   */
  private async saveSearchQuery(
    userId: string | null,
    query: string,
    parsedQuery: SearchQuery,
    resultCount: number,
    executionTime: number
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO search_queries 
         (user_id, query_text, query_type, results, result_count, execution_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          query,
          'intelligent_nlp',
          JSON.stringify(parsedQuery),
          resultCount,
          executionTime,
        ]
      );
    } catch (error) {
      logger.error('Error saving search query:', error);
    }
  }

  /**
   * Get search suggestions based on history
   */
  async getSearchSuggestions(userId: string, limit: number = 10): Promise<string[]> {
    const result = await pool.query(
      `SELECT DISTINCT query_text, COUNT(*) as frequency
       FROM search_queries
       WHERE user_id = $1
       GROUP BY query_text
       ORDER BY frequency DESC, MAX(created_at) DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row: any) => row.query_text);
  }

  /**
   * Find similar patients based on conditions
   */
  async findSimilarPatients(
    documentId: string,
    userId: string | null,
    limit: number = 10
  ): Promise<SearchResult[]> {
    // Get conditions from the reference document
    const refDoc = await pool.query(
      `SELECT me.entity_value
       FROM medical_entities me
       WHERE me.document_id = $1 AND me.entity_type IN ('diagnosis', 'condition')`,
      [documentId]
    );

    if (refDoc.rows.length === 0) {
      return [];
    }

    const conditions = refDoc.rows.map((r: any) => r.entity_value);
    const query = conditions.join(' ');

    const filters: SearchFilters = { conditions };
    const { results } = await this.executeSearch(query, filters, userId, limit, 0);

    return results.filter(r => r.documentId !== documentId);
  }

  /**
   * Bulk search operation
   */
  async bulkSearch(
    queries: string[],
    userId: string | null
  ): Promise<Map<string, PaginatedResults>> {
    const results = new Map<string, PaginatedResults>();

    for (const query of queries) {
      try {
        const result = await this.search(query, userId, { saveQuery: false });
        results.set(query, result);
      } catch (error) {
        logger.error(`Bulk search error for query "${query}":`, error);
      }
    }

    return results;
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(userId: string): Promise<any> {
    const result = await pool.query(
      `SELECT
         COUNT(*) as total_searches,
         AVG(result_count) as avg_results,
         AVG(execution_time) as avg_execution_time,
         json_agg(DISTINCT query_text) FILTER (WHERE query_text IS NOT NULL) as recent_queries
       FROM (
         SELECT * FROM search_queries
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 100
       ) recent`,
      [userId]
    );

    return result.rows[0];
  }
}

export const intelligentSearchService = new IntelligentSearchService();
