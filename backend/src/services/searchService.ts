import { pool } from '../config/database';
import natural from 'natural';
import compromise from 'compromise';

export class SearchService {
  private tokenizer = new natural.WordTokenizer();
  private tfidf = new natural.TfIdf();

  async search(
    query: string,
    userId: string | null,
    visitorId: string | null
  ) {
    const startTime = Date.now();

    const processedQuery = this.processQuery(query);

    const results = await this.performSearch(processedQuery, userId);

    const executionTime = Date.now() - startTime;

    await pool.query(
      `INSERT INTO search_queries (user_id, visitor_id, query_text, results, result_count, execution_time)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, visitorId, query, JSON.stringify(results), results.length, executionTime]
    );

    return {
      query,
      results,
      count: results.length,
      executionTime,
    };
  }

  private processQuery(query: string): string {
    const doc = compromise(query);
    
    const medicalTerms = doc.match('#Noun').out('array');
    const conditions = doc.match('(diabetes|hypertension|cancer|infection)').out('array');
    
    return [...medicalTerms, ...conditions].join(' ');
  }

  private async performSearch(query: string, userId: string | null) {
    const result = await pool.query(
      `SELECT 
         d.id,
         d.file_name,
         d.extracted_text,
         d.created_at,
         ts_rank(to_tsvector('english', d.extracted_text), plainto_tsquery('english', $1)) as rank,
         json_agg(json_build_object(
           'type', me.entity_type,
           'value', me.entity_value
         )) as entities
       FROM documents d
       LEFT JOIN medical_entities me ON d.id = me.document_id
       WHERE (d.user_id = $2 OR $2 IS NULL)
         AND to_tsvector('english', d.extracted_text) @@ plainto_tsquery('english', $1)
       GROUP BY d.id
       ORDER BY rank DESC
       LIMIT 20`,
      [query, userId]
    );

    return result.rows.map(row => ({
      documentId: row.id,
      fileName: row.file_name,
      relevanceScore: parseFloat(row.rank),
      snippet: this.extractSnippet(row.extracted_text, query),
      entities: row.entities.filter((e: any) => e.type !== null),
      createdAt: row.created_at,
    }));
  }

  private extractSnippet(text: string, query: string, length = 200): string {
    const queryTerms = this.tokenizer.tokenize(query.toLowerCase());
    const textLower = text.toLowerCase();
    
    let bestPosition = 0;
    let maxMatches = 0;

    for (let i = 0; i < text.length - length; i += 50) {
      const snippet = textLower.substring(i, i + length);
      const matches = queryTerms.filter(term => snippet.includes(term)).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestPosition = i;
      }
    }

    return '...' + text.substring(bestPosition, bestPosition + length) + '...';
  }

  async extractEntities(text: string) {
    const doc = compromise(text);

    const entities = {
      people: doc.people().out('array'),
      places: doc.places().out('array'),
      organizations: doc.organizations().out('array'),
      dates: doc.dates().out('array'),
      medications: this.extractMedications(text),
      diagnoses: this.extractDiagnoses(text),
    };

    return entities;
  }

  private extractMedications(text: string): string[] {
    const medicationPatterns = [
      /\b(aspirin|ibuprofen|paracetamol|metformin|insulin|amoxicillin)\b/gi,
    ];

    const medications: string[] = [];
    medicationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) medications.push(...matches);
    });

    return [...new Set(medications)];
  }

  private extractDiagnoses(text: string): string[] {
    const diagnosisPatterns = [
      /\b(diabetes|hypertension|cancer|infection|pneumonia|asthma)\b/gi,
    ];

    const diagnoses: string[] = [];
    diagnosisPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) diagnoses.push(...matches);
    });

    return [...new Set(diagnoses)];
  }
}
