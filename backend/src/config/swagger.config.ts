/**
 * Swagger/OpenAPI Configuration
 */

import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export function setupSwagger(app: Express): void {
  try {
    const swaggerPath = path.join(__dirname, '../../docs/api-integration-spec.yaml');
    const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');
    const swaggerDocument = yaml.parse(swaggerFile);

    // Swagger UI options
    const options = {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Healthcare Integration API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        syntaxHighlight: {
          activate: true,
          theme: 'monokai'
        }
      }
    };

    // Serve Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

    // Serve raw OpenAPI spec
    app.get('/api-docs.json', (req, res) => {
      res.json(swaggerDocument);
    });

    app.get('/api-docs.yaml', (req, res) => {
      res.type('text/yaml').send(swaggerFile);
    });

    console.log('✓ Swagger documentation available at /api-docs');
  } catch (error) {
    console.error('Failed to setup Swagger:', error);
  }
}
