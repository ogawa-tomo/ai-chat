import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📍 API endpoint: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`\n✓ Ready to accept requests\n`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n\n⏳ Received shutdown signal, closing gracefully...');

      server.close(async () => {
        console.log('✓ HTTP server closed');

        await disconnectDatabase();
        console.log('✓ Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('✗ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
