import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mashupRoutes from './routes/mashup.routes';
import registryRoutes from './routes/registry.routes';
import chatbotRoutes from './routes/chatbot.routes';
import { router as ideaGeneratorRouter } from './modules/idea-generator';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validateEnv, getEnvConfig } from './utils/validateEnv';
import { ZIPExporter } from './exporter/ZIPExporter';
import { CleanupService } from './services/CleanupService';

dotenv.config();

// Validate environment variables on startup
try {
  validateEnv();
  console.log('✓ Environment variables validated successfully');
} catch (error) {
  console.error('✗ Environment validation failed:');
  console.error((error as Error).message);
  process.exit(1);
}

const app: Application = express();
const config = getEnvConfig();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/mashup', mashupRoutes);
app.use('/api/registry', registryRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', ideaGeneratorRouter);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize cleanup service
let cleanupService: CleanupService | null = null;

// Start server
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`Temp directory: ${config.TEMP_DIR}`);
    console.log(`Max ZIP size: ${config.MAX_ZIP_SIZE_MB}MB`);
    console.log(`Cleanup interval: ${config.CLEANUP_INTERVAL_HOURS} hours`);

    // Start cleanup service
    const zipExporter = new ZIPExporter(config.TEMP_DIR);
    cleanupService = new CleanupService(zipExporter, config.CLEANUP_INTERVAL_HOURS);
    cleanupService.start();
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    
    // Stop cleanup service
    if (cleanupService) {
      cleanupService.stop();
    }

    // Close server
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
