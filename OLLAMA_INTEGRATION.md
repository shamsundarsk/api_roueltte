`# Ollama AI Idea Generator Integration Guide

## What's New?
Added a local AI-powered idea generator module that runs entirely offline using Ollama. No API keys required!

## Quick Start

### 1. Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Download from https://ollama.ai/download
```

### 2. Pull a Model
```bash
# Recommended for best quality (8GB RAM required)
ollama pull llama3

# OR for faster responses (4GB RAM required)
ollama pull llama3:3b
```

### 3. Start Ollama
```bash
ollama serve
```

### 4. Configure Backend
Add to `backend/.env`:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 5. Test It
```bash
# Start backend
cd backend
npm run dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/idea
```

## API Endpoints

### Generate Idea
```
GET /api/idea
```
Returns a creative hackathon project idea combining 3 random APIs.

### Health Check
```
GET /api/idea/health
```
Check if the module and Ollama are operational.

## Module Structure
```
backend/src/modules/idea-generator/
├── index.ts              # Main export
├── router.ts             # Express routes
├── controller.ts         # Request handlers
├── apiList.ts            # 30+ curated APIs
├── randomizer.ts         # Random selection logic
├── promptBuilder.ts      # LLM prompt engineering
├── ollamaClient.ts       # Ollama API wrapper
└── README.md             # Detailed documentation
```

## Key Features
✅ **100% Offline** - No cloud APIs, no API keys
✅ **Fast** - 3-8 seconds response time
✅ **Isolated** - Doesn't affect existing code
✅ **Error-Safe** - Graceful fallback if Ollama unavailable
✅ **Modular** - Easy to extend and maintain

## Integration Points
The module is automatically integrated in `backend/src/server.ts`:
```typescript
import { router as ideaGeneratorRouter } from './modules/idea-generator';
app.use('/api', ideaGeneratorRouter);
```

## Frontend Integration (Next Steps)
Add a button in your UI to call the endpoint:
```typescript
const generateAIIdea = async () => {
  const response = await fetch('/api/idea');
  const data = await response.json();
  console.log(data.data.idea);
};
```

## Performance Tips
- **llama3** (8B): Best quality, 5-8s response
- **llama3:3b** (3B): Faster, 2-3s response
- **phi3** (3.8B): Balanced, 3-5s response

## Troubleshooting

### Ollama not connecting?
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Model not found?
```bash
# List installed models
ollama list

# Pull the model
ollama pull llama3
```

### Slow responses?
Switch to a smaller model in `.env`:
```env
OLLAMA_MODEL=llama3:3b
```

## What's Next?
This module is designed for easy expansion:
- Add custom API selection
- Generate project blueprints
- Create tech stack recommendations
- Store and retrieve past ideas
- Add streaming responses

## Documentation
Full module documentation: `backend/src/modules/idea-generator/README.md`

## Support
- Ollama Docs: https://ollama.ai/docs
- Model Library: https://ollama.ai/library
- GitHub Issues: Report bugs in your project repo
