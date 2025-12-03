import { CleanupService } from '../services/CleanupService';
import { ZIPExporter } from '../exporter/ZIPExporter';
import fs from 'fs-extra';
import path from 'path';

describe('CleanupService', () => {
  let cleanupService: CleanupService;
  let zipExporter: ZIPExporter;
  let testTempDir: string;

  beforeEach(() => {
    // Use fake timers for most tests
    jest.useFakeTimers();
    
    // Create a test-specific temp directory
    testTempDir = path.join(__dirname, '../../test-temp-cleanup');
    zipExporter = new ZIPExporter(testTempDir);
    cleanupService = new CleanupService(zipExporter, 24);

    // Spy on console methods to verify logging
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(async () => {
    // Stop the service if running
    if (cleanupService.isActive()) {
      cleanupService.stop();
    }

    // Clean up test temp directory
    if (await fs.pathExists(testTempDir)) {
      await fs.remove(testTempDir);
    }

    // Restore console methods
    jest.restoreAllMocks();
    
    // Clear all timers and use real timers
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create a CleanupService with default interval', () => {
      const service = new CleanupService(zipExporter);
      expect(service.getIntervalHours()).toBe(24);
      expect(service.isActive()).toBe(false);
    });

    it('should create a CleanupService with custom interval', () => {
      const service = new CleanupService(zipExporter, 12);
      expect(service.getIntervalHours()).toBe(12);
      expect(service.isActive()).toBe(false);
    });
  });

  describe('start', () => {
    it('should start the cleanup service', () => {
      cleanupService.start();
      
      expect(cleanupService.isActive()).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Starting cleanup service')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup service started successfully')
      );
    });

    it('should run cleanup immediately on start', async () => {
      // Spy on the cleanupOldFiles method
      const cleanupSpy = jest.spyOn(zipExporter, 'cleanupOldFiles').mockResolvedValue();

      cleanupService.start();

      // Run only pending timers (not the interval)
      await jest.runOnlyPendingTimersAsync();

      expect(cleanupSpy).toHaveBeenCalledWith(24);
    });

    it('should schedule periodic cleanup', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      cleanupService.start();

      // Verify that setInterval was called
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        24 * 60 * 60 * 1000 // 24 hours in milliseconds
      );
    });

    it('should not start if already running', () => {
      cleanupService.start();
      
      // Clear previous console.log calls
      (console.log as jest.Mock).mockClear();
      
      // Try to start again
      cleanupService.start();
      
      expect(console.log).toHaveBeenCalledWith(
        'Cleanup service is already running'
      );
    });

    it('should use custom interval hours', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const customService = new CleanupService(zipExporter, 12);
      customService.start();

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        12 * 60 * 60 * 1000 // 12 hours in milliseconds
      );

      customService.stop();
    });
  });

  describe('stop', () => {
    it('should stop the cleanup service', () => {
      cleanupService.start();
      expect(cleanupService.isActive()).toBe(true);

      cleanupService.stop();
      
      expect(cleanupService.isActive()).toBe(false);
      expect(console.log).toHaveBeenCalledWith('Cleanup service stopped');
    });

    it('should clear the interval when stopped', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      cleanupService.start();
      cleanupService.stop();

      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it('should not stop if not running', () => {
      cleanupService.stop();
      
      expect(console.log).toHaveBeenCalledWith(
        'Cleanup service is not running'
      );
    });
  });

  describe('scheduled cleanup execution', () => {
    it('should execute cleanup at scheduled intervals', async () => {
      const cleanupSpy = jest.spyOn(zipExporter, 'cleanupOldFiles').mockResolvedValue();

      cleanupService.start();

      // Wait for initial cleanup
      await jest.runOnlyPendingTimersAsync();

      // Get initial call count
      const initialCalls = cleanupSpy.mock.calls.length;
      expect(initialCalls).toBeGreaterThanOrEqual(1);

      // Clear the spy to count only scheduled cleanups
      cleanupSpy.mockClear();

      // Fast-forward time by 24 hours
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      // Wait for the scheduled cleanup to execute
      await jest.runOnlyPendingTimersAsync();

      // Should have been called at least once more
      expect(cleanupSpy).toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalledWith(24);
    });

    it('should execute cleanup multiple times at intervals', async () => {
      const cleanupSpy = jest.spyOn(zipExporter, 'cleanupOldFiles').mockResolvedValue();

      cleanupService.start();

      // Wait for initial cleanup
      await jest.runOnlyPendingTimersAsync();

      // Clear the spy
      cleanupSpy.mockClear();

      // Fast-forward time by 48 hours (2 intervals)
      jest.advanceTimersByTime(48 * 60 * 60 * 1000);

      // Wait for scheduled cleanups to execute
      await jest.runOnlyPendingTimersAsync();

      // Should have been called at least twice
      expect(cleanupSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('error handling', () => {
    it('should handle cleanup errors gracefully', async () => {
      // Mock cleanupOldFiles to throw an error
      const error = new Error('Cleanup failed');
      jest.spyOn(zipExporter, 'cleanupOldFiles').mockRejectedValue(error);

      cleanupService.start();

      // Wait for the cleanup to execute and handle the error
      await jest.runOnlyPendingTimersAsync();

      // Service should still be running despite the error
      expect(cleanupService.isActive()).toBe(true);

      // Error should be logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup failed:'),
        error
      );
    });

    it('should log error details when cleanup fails', async () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      jest.spyOn(zipExporter, 'cleanupOldFiles').mockRejectedValue(error);

      cleanupService.start();

      // Wait for the cleanup to execute
      await jest.runOnlyPendingTimersAsync();

      // Check that error details were logged
      const errorCalls = (console.error as jest.Mock).mock.calls;
      
      // Find calls that contain error message and stack
      const hasErrorMessage = errorCalls.some(call => 
        call.join(' ').includes('Error message:') && call.join(' ').includes('Test error')
      );
      const hasErrorStack = errorCalls.some(call => 
        call.join(' ').includes('Error stack:') && call.join(' ').includes('Error stack trace')
      );

      expect(hasErrorMessage).toBe(true);
      expect(hasErrorStack).toBe(true);
    });

    it('should continue scheduling after an error', async () => {
      const cleanupSpy = jest.spyOn(zipExporter, 'cleanupOldFiles');
      
      // First call fails, second succeeds
      cleanupSpy
        .mockRejectedValueOnce(new Error('First cleanup failed'))
        .mockResolvedValue();

      cleanupService.start();

      // Wait for initial cleanup (which fails)
      await jest.runOnlyPendingTimersAsync();

      // Get initial call count
      const initialCalls = cleanupSpy.mock.calls.length;
      expect(initialCalls).toBeGreaterThanOrEqual(1);

      // Clear the spy
      cleanupSpy.mockClear();

      // Fast-forward to next interval
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      // Wait for next cleanup
      await jest.runOnlyPendingTimersAsync();

      // Second cleanup should have been called
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    it('should log when cleanup starts', async () => {
      jest.spyOn(zipExporter, 'cleanupOldFiles').mockResolvedValue();
      
      cleanupService.start();

      // Wait for cleanup to execute
      await jest.runOnlyPendingTimersAsync();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/Running scheduled cleanup/)
      );
    });

    it('should log when cleanup completes successfully', async () => {
      jest.spyOn(zipExporter, 'cleanupOldFiles').mockResolvedValue();

      cleanupService.start();

      // Wait for cleanup to execute
      await jest.runOnlyPendingTimersAsync();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/Cleanup completed successfully/)
      );
    });

    it('should include timestamps in log messages', async () => {
      jest.spyOn(zipExporter, 'cleanupOldFiles').mockResolvedValue();
      
      cleanupService.start();

      // Wait for cleanup to execute
      await jest.runOnlyPendingTimersAsync();

      // Check that log messages include ISO timestamp format
      const logCalls = (console.log as jest.Mock).mock.calls;
      const cleanupLogCalls = logCalls.filter(call => 
        call[0].includes('Running scheduled cleanup') || 
        call[0].includes('Cleanup completed successfully')
      );

      expect(cleanupLogCalls.length).toBeGreaterThan(0);
      
      cleanupLogCalls.forEach(call => {
        // Should contain ISO timestamp format [YYYY-MM-DDTHH:mm:ss.sssZ]
        expect(call[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      });
    });
  });

  describe('integration with ZIPExporter', () => {
    it('should actually clean up old ZIP files', async () => {
      // Use real timers for this integration test
      jest.useRealTimers();

      // Create test ZIP files
      await fs.ensureDir(testTempDir);
      
      const oldZipPath = path.join(testTempDir, 'old-file.zip');
      const newZipPath = path.join(testTempDir, 'new-file.zip');
      
      await fs.writeFile(oldZipPath, 'old content');
      await fs.writeFile(newZipPath, 'new content');

      // Make the old file appear to be 25 hours old
      const oldTime = Date.now() - (25 * 60 * 60 * 1000);
      await fs.utimes(oldZipPath, new Date(oldTime), new Date(oldTime));

      // Create a new cleanup service and run cleanup
      const service = new CleanupService(zipExporter, 24);
      service.start();

      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Old file should be removed, new file should remain
      expect(await fs.pathExists(oldZipPath)).toBe(false);
      expect(await fs.pathExists(newZipPath)).toBe(true);

      service.stop();

      // Switch back to fake timers for other tests
      jest.useFakeTimers();
    });
  });

  describe('getIntervalHours', () => {
    it('should return the configured interval', () => {
      expect(cleanupService.getIntervalHours()).toBe(24);
    });

    it('should return custom interval', () => {
      const customService = new CleanupService(zipExporter, 12);
      expect(customService.getIntervalHours()).toBe(12);
    });
  });

  describe('isActive', () => {
    it('should return false when not started', () => {
      expect(cleanupService.isActive()).toBe(false);
    });

    it('should return true when started', () => {
      cleanupService.start();
      expect(cleanupService.isActive()).toBe(true);
    });

    it('should return false after stopped', () => {
      cleanupService.start();
      cleanupService.stop();
      expect(cleanupService.isActive()).toBe(false);
    });
  });
});
