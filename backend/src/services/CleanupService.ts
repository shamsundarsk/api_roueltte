import { ZIPExporter } from '../exporter/ZIPExporter';

/**
 * CleanupService class responsible for scheduling and executing periodic cleanup of old ZIP files
 */
export class CleanupService {
  private zipExporter: ZIPExporter;
  private intervalHours: number;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  /**
   * Create a new CleanupService instance
   * @param zipExporter - The ZIPExporter instance to use for cleanup
   * @param intervalHours - How often to run cleanup (in hours)
   */
  constructor(zipExporter: ZIPExporter, intervalHours: number = 24) {
    this.zipExporter = zipExporter;
    this.intervalHours = intervalHours;
  }

  /**
   * Start the cleanup scheduler
   * Runs cleanup immediately and then schedules it to run at the specified interval
   */
  start(): void {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting cleanup service (interval: ${this.intervalHours} hours)`);

    // Run cleanup immediately on start
    this.runCleanup();

    // Schedule periodic cleanup
    const intervalMs = this.intervalHours * 60 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, intervalMs);

    console.log(`Cleanup service started successfully`);
  }

  /**
   * Stop the cleanup scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Cleanup service is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Cleanup service stopped');
  }

  /**
   * Execute the cleanup operation
   * Handles errors gracefully and logs the operation
   */
  private async runCleanup(): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Running scheduled cleanup...`);

    try {
      await this.zipExporter.cleanupOldFiles(this.intervalHours);
      console.log(`[${timestamp}] Cleanup completed successfully`);
    } catch (error) {
      // Log error but don't throw - cleanup failures shouldn't crash the service
      console.error(`[${timestamp}] Cleanup failed:`, error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
    }
  }

  /**
   * Check if the cleanup service is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get the configured cleanup interval in hours
   */
  getIntervalHours(): number {
    return this.intervalHours;
  }
}
