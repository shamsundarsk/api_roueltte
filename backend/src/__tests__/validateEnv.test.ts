import { validateEnv, getEnvConfig } from '../utils/validateEnv';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should validate with all required environment variables', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.TEMP_DIR = '/tmp/mashup-maker';
      process.env.MAX_ZIP_SIZE_MB = '50';
      process.env.CLEANUP_INTERVAL_HOURS = '24';

      expect(() => validateEnv()).not.toThrow();
    });

    it('should use default values when optional variables are missing', () => {
      delete process.env.PORT;
      delete process.env.NODE_ENV;
      delete process.env.TEMP_DIR;
      delete process.env.MAX_ZIP_SIZE_MB;
      delete process.env.CLEANUP_INTERVAL_HOURS;

      const config = validateEnv();
      expect(config.PORT).toBe(3000);
      expect(config.NODE_ENV).toBe('development');
      expect(config.TEMP_DIR).toBe('/tmp/mashup-maker');
      expect(config.MAX_ZIP_SIZE_MB).toBe(50);
      expect(config.CLEANUP_INTERVAL_HOURS).toBe(24);
    });

    it('should throw error for invalid PORT', () => {
      process.env.PORT = 'invalid';
      expect(() => validateEnv()).toThrow('PORT must be a valid port number');
    });

    it('should throw error for PORT out of range', () => {
      process.env.PORT = '99999';
      expect(() => validateEnv()).toThrow('PORT must be a valid port number');
    });

    it('should throw error for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'invalid';
      expect(() => validateEnv()).toThrow('NODE_ENV must be one of');
    });

    it('should throw error for invalid MAX_ZIP_SIZE_MB', () => {
      process.env.MAX_ZIP_SIZE_MB = 'invalid';
      expect(() => validateEnv()).toThrow('MAX_ZIP_SIZE_MB must be a positive number');
    });

    it('should throw error for negative MAX_ZIP_SIZE_MB', () => {
      process.env.MAX_ZIP_SIZE_MB = '-1';
      expect(() => validateEnv()).toThrow('MAX_ZIP_SIZE_MB must be a positive number');
    });

    it('should throw error for invalid CLEANUP_INTERVAL_HOURS', () => {
      process.env.CLEANUP_INTERVAL_HOURS = 'invalid';
      expect(() => validateEnv()).toThrow('CLEANUP_INTERVAL_HOURS must be a positive number');
    });

    it('should accept valid NODE_ENV values', () => {
      const validEnvs = ['development', 'production', 'test'];
      
      validEnvs.forEach((env) => {
        process.env.NODE_ENV = env;
        expect(() => validateEnv()).not.toThrow();
      });
    });
  });

  describe('getEnvConfig', () => {
    it('should return current environment configuration', () => {
      process.env.PORT = '4000';
      process.env.NODE_ENV = 'production';
      process.env.TEMP_DIR = '/custom/temp';
      process.env.MAX_ZIP_SIZE_MB = '100';
      process.env.CLEANUP_INTERVAL_HOURS = '48';

      const config = getEnvConfig();
      expect(config.PORT).toBe(4000);
      expect(config.NODE_ENV).toBe('production');
      expect(config.TEMP_DIR).toBe('/custom/temp');
      expect(config.MAX_ZIP_SIZE_MB).toBe(100);
      expect(config.CLEANUP_INTERVAL_HOURS).toBe(48);
    });
  });
});
