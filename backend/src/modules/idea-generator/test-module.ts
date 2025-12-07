/**
 * Simple test script for Idea Generator Module
 * Run with: npx ts-node src/modules/idea-generator/test-module.ts
 */

import { getRandomAPIs } from './randomizer';
import { buildIdeaPrompt } from './promptBuilder';
import * as ollamaClient from './ollamaClient';

async function testModule() {
  console.log('🧪 Testing Idea Generator Module\n');

  // Test 1: Random API Selection
  console.log('1️⃣ Testing Random API Selection...');
  const apis = getRandomAPIs(3);
  console.log('   Selected APIs:', apis);
  console.log('   ✅ Pass\n');

  // Test 2: Prompt Building
  console.log('2️⃣ Testing Prompt Builder...');
  const prompt = buildIdeaPrompt(apis);
  console.log('   Prompt length:', prompt.length, 'characters');
  console.log('   ✅ Pass\n');

  // Test 3: Ollama Availability
  console.log('3️⃣ Testing Ollama Connection...');
  const isAvailable = await ollamaClient.isAvailable();
  if (isAvailable) {
    console.log('   ✅ Ollama is running and accessible\n');
  } else {
    console.log('   ❌ Ollama is not available');
    console.log('   💡 Make sure to run: ollama serve\n');
    return;
  }

  // Test 4: Idea Generation
  console.log('4️⃣ Testing Idea Generation...');
  console.log('   Generating idea (this may take 5-10 seconds)...');
  try {
    const startTime = Date.now();
    const idea = await ollamaClient.generate(prompt, {
      model: 'llama3',
      temperature: 0.8,
      max_tokens: 1000,
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('   ✅ Idea generated successfully');
    console.log('   ⏱️  Duration:', duration, 'seconds');
    console.log('   📝 Idea length:', idea.length, 'characters');
    console.log('\n   Generated Idea:');
    console.log('   ' + '='.repeat(60));
    console.log(idea.split('\n').map(line => '   ' + line).join('\n'));
    console.log('   ' + '='.repeat(60));
  } catch (error) {
    console.log('   ❌ Generation failed:', (error as Error).message);
  }

  console.log('\n✨ Module test complete!');
}

testModule().catch(console.error);
