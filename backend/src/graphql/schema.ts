import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Document {
    id: ID!
    fileName: String!
    processingStatus: String!
    extractedText: String
    ocrConfidence: Float
    entities: [MedicalEntity!]
    createdAt: String!
  }

  type MedicalEntity {
    id: ID!
    entityType: String!
    entityValue: String!
    confidence: Float
  }

  type SearchResult {
    documentId: ID!
    fileName: String!
    relevanceScore: Float!
    snippet: String!
    entities: [MedicalEntity!]
    createdAt: String!
  }

  type Visitor {
    id: ID!
    email: String!
    registrationDate: String!
    activityCount: Int!
  }

  type Query {
    document(id: ID!): Document
    documents(limit: Int, offset: Int): [Document!]!
    search(query: String!): [SearchResult!]!
    visitors: [Visitor!]!
  }

  type Mutation {
    registerVisitor(email: String!): Visitor!
  }
`);
