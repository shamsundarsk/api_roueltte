/**
 * Quick test script to verify all endpoints are working
 * Run with: node test-endpoints.js
 */

const baseUrl = 'http://localhost:3000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✓ ${method} ${endpoint} - Status: ${response.status}`);
    return { success: true, data };
  } catch (error) {
    console.log(`✗ ${method} ${endpoint} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing API Roulette Backend Endpoints\n');
  
  // Test health endpoint
  await testEndpoint('/health');
  
  // Test registry endpoints
  await testEndpoint('/api/registry/categories');
  await testEndpoint('/api/registry/apis');
  
  // Test mashup endpoints
  await testEndpoint('/api/mashup/generate', 'POST');
  
  // Test chatbot endpoints
  await testEndpoint('/api/chatbot/status');
  await testEndpoint('/api/chatbot/quick-help/setup');
  
  // Test idea generator endpoints
  await testEndpoint('/api/idea/health');
  await testEndpoint('/api/idea');
  
  console.log('\n✨ Endpoint testing complete!');
}

runTests().catch(console.error);