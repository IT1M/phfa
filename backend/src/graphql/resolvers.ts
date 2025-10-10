import { DocumentService } from '../services/documentService';
import { SearchService } from '../services/searchService';
import { VisitorService } from '../services/visitorService';
import { pool } from '../config/database';

const documentService = new DocumentService();
const searchService = new SearchService();
const visitorService = new VisitorService();

export const root = {
  document: async ({ id }: { id: string }, context: any) => {
    return documentService.getDocument(id, context.userId);
  },

  documents: async ({ limit, offset }: { limit?: number; offset?: number }, context: any) => {
    return documentService.listDocuments(context.userId, limit, offset);
  },

  search: async ({ query }: { query: string }, context: any) => {
    const result = await searchService.search(query, context.userId, null);
    return result.results;
  },

  visitors: async (_: any, context: any) => {
    if (context.userRole !== 'admin') {
      throw new Error('Unauthorized');
    }
    const result = await pool.query('SELECT * FROM visitors ORDER BY registration_date DESC');
    return result.rows;
  },

  registerVisitor: async ({ email }: { email: string }) => {
    return visitorService.registerVisitor(email);
  },
};
