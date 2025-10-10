import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { schema } from './graphql/schema';
import { root } from './graphql/resolvers';
import { logger } from './utils/logger';
import { auditLog } from './middleware/audit';
import { ScheduledExportService } from './services/scheduledExportService';
import { BackupService } from './services/backupService';
import { MonitoringService } from './services/monitoringService';
import { exportConfig } from './config/export.config';
import authRoutes from './routes/auth';
import visitorRoutes from './routes/visitors';
import documentRoutes from './routes/documents';
import searchRoutes from './routes/search';
import intelligentSearchRoutes from './routes/intelligentSearch';
import geminiRoutes from './routes/gemini';
import documentProcessorRoutes from './routes/document-processor';
import backupRoutes from './routes/backups';
import monitoringRoutes from './routes/monitoring';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(auditLog);

app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/intelligent-search', intelligentSearchRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/document-processor', documentProcessorRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/admin', adminRoutes);

app.use('/graphql', graphqlHTTP((req: any) => ({
  schema,
  rootValue: root,
  context: {
    userId: req.user?.id,
    userRole: req.user?.role,
  },
  graphiql: process.env.NODE_ENV === 'development',
})));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);

  // Initialize scheduled export service
  if (exportConfig.schedule.enabled) {
    const scheduledExportService = new ScheduledExportService();
    scheduledExportService.scheduleDailyExport(
      exportConfig.schedule.hour,
      exportConfig.schedule.minute
    );
    logger.info(`📅 Scheduled exports enabled at ${exportConfig.schedule.hour}:${exportConfig.schedule.minute} (Saudi Arabia time)`);
  }

  // Initialize automated backup service
  if (process.env.ENABLE_AUTOMATED_BACKUPS === 'true') {
    const backupService = new BackupService();
    backupService.scheduleAutomatedBackups();
    logger.info(`💾 Automated backups enabled`);
  }

  // Initialize monitoring service
  const monitoringService = new MonitoringService();
  
  // Collect metrics every 5 minutes
  setInterval(async () => {
    try {
      await monitoringService.collectMetrics();
    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }, 5 * 60 * 1000);

  // Check health every 10 minutes
  setInterval(async () => {
    try {
      const health = await monitoringService.checkHealth();
      if (health.status !== 'healthy') {
        logger.warn(`System health: ${health.status}`, health.checks);
      }
    } catch (error) {
      logger.error('Error checking health:', error);
    }
  }, 10 * 60 * 1000);

  logger.info(`📈 Monitoring service initialized`);

  // Initial health check
  try {
    const health = await monitoringService.checkHealth();
    console.log(`💚 System health: ${health.status}`);
  } catch (error) {
    logger.error('Initial health check failed:', error);
  }
});
