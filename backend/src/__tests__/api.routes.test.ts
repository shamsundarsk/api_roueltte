import request from 'supertest';
import app from '../server';

/**
 * Integration tests for REST API endpoints
 * Tests the mashup and registry routes
 */

describe('API Routes Integration Tests', () => {
  describe('Health Check', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/mashup/generate', () => {
    it('should generate a mashup successfully', async () => {
      const response = await request(app)
        .post('/api/mashup/generate')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('idea');
      expect(response.body.data).toHaveProperty('uiLayout');
      expect(response.body.data).toHaveProperty('codePreview');
      expect(response.body.data).toHaveProperty('downloadUrl');
      expect(response.body.data).toHaveProperty('timestamp');
    }, 10000);

    it('should accept generation options', async () => {
      const response = await request(app)
        .post('/api/mashup/generate')
        .send({
          options: {
            corsOnly: true,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('idea');
    }, 10000);

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/mashup/generate')
        .send({
          options: {
            invalidField: 'test',
          },
        });

      // Should still succeed because unknown fields are stripped
      expect(response.status).toBe(200);
    }, 10000);
  });

  describe('GET /api/mashup/download/:filename', () => {
    it('should return 404 for non-existent file', async () => {
      const response = await request(app).get(
        '/api/mashup/download/non-existent-file.zip'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'FILE_NOT_FOUND');
    });

    it('should reject path traversal attempts', async () => {
      const response = await request(app).get(
        '/api/mashup/download/..%2F..%2F..%2Fetc%2Fpasswd'
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_FILENAME');
    });

    it('should download a valid ZIP file', async () => {
      // First generate a mashup
      const generateResponse = await request(app)
        .post('/api/mashup/generate')
        .send({});

      expect(generateResponse.status).toBe(200);
      const downloadUrl = generateResponse.body.data.downloadUrl;
      
      // Extract filename from URL (downloadUrl is like "/api/mashup/download/filename.zip")
      const filename = downloadUrl.split('/').pop();

      // Download the file - downloadUrl already includes the full path
      const downloadResponse = await request(app).get(downloadUrl);

      expect(downloadResponse.status).toBe(200);
      expect(downloadResponse.headers['content-type']).toBe('application/zip');
      expect(downloadResponse.headers['content-disposition']).toContain(
        'attachment'
      );
      expect(downloadResponse.headers['content-disposition']).toContain(filename);
    }, 15000);
  });

  describe('GET /api/registry/apis', () => {
    it('should return all APIs', async () => {
      const response = await request(app).get('/api/registry/apis');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('apis');
      expect(response.body.data).toHaveProperty('count');
      expect(Array.isArray(response.body.data.apis)).toBe(true);
      expect(response.body.data.count).toBeGreaterThan(0);
    });

    it('should filter APIs by category', async () => {
      const response = await request(app)
        .get('/api/registry/apis')
        .query({ category: 'weather' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data.apis)).toBe(true);
      
      // All returned APIs should be in the weather category
      response.body.data.apis.forEach((api: any) => {
        expect(api.category.toLowerCase()).toBe('weather');
      });
    });

    it('should filter APIs by authType', async () => {
      const response = await request(app)
        .get('/api/registry/apis')
        .query({ authType: 'none' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data.apis)).toBe(true);
      
      // All returned APIs should have authType 'none'
      response.body.data.apis.forEach((api: any) => {
        expect(api.authType).toBe('none');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/registry/apis')
        .query({ category: 'non-existent-category' });

      expect(response.status).toBe(200);
      expect(response.body.data.apis).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('POST /api/registry/apis', () => {
    const validAPI = {
      id: 'test-api-' + Date.now(),
      name: 'Test API',
      description: 'A test API for integration testing',
      category: 'testing',
      baseUrl: 'https://api.test.com',
      sampleEndpoint: '/v1/data',
      authType: 'none' as const,
      corsCompatible: true,
      documentationUrl: 'https://docs.test.com',
    };

    it('should add a new API successfully', async () => {
      const response = await request(app)
        .post('/api/registry/apis')
        .send(validAPI);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', validAPI.id);
      expect(response.body.data).toHaveProperty('message', 'API added successfully');
    });

    it('should reject duplicate API IDs', async () => {
      const duplicateAPI = { ...validAPI, id: 'test-api-duplicate' };
      
      // Add first time
      await request(app).post('/api/registry/apis').send(duplicateAPI);
      
      // Try to add again
      const response = await request(app)
        .post('/api/registry/apis')
        .send(duplicateAPI);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'DUPLICATE_API');
    });

    it('should validate required fields', async () => {
      const invalidAPI = {
        id: 'invalid-api',
        name: 'Invalid API',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/registry/apis')
        .send(invalidAPI);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should validate authType enum', async () => {
      const invalidAPI = {
        ...validAPI,
        id: 'invalid-auth-' + Date.now(),
        authType: 'invalid-auth-type',
      };

      const response = await request(app)
        .post('/api/registry/apis')
        .send(invalidAPI);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should validate URL format', async () => {
      const invalidAPI = {
        ...validAPI,
        id: 'invalid-url-' + Date.now(),
        baseUrl: 'not-a-valid-url',
      };

      const response = await request(app)
        .post('/api/registry/apis')
        .send(invalidAPI);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });
});
