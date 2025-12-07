# AI Idea Generator Module

## Overview
Self-contained AI idea generation module powered by Ollama (local LLM). Generates hackathon project ideas by combining random APIs.

## Features
- ✅ **Offline-capable**: Runs entirely on local LLM
- ✅ **Zero API keys**: No cloud dependencies
- ✅ **Isolated module**: Doesn't affect other business logic
- ✅ **Fast responses**: 3-8s depending on model
- ✅ **Error-resilient**: Graceful fallback if Ollama unavailable

## Prerequisites

### 1. Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### 2. Pull a Model
```bash
# Recommended: Llama 3 (8B) - balanced speed/quality
ollama pull llama3

# Alternative: Llama 3 (3B) - faster, lighter
ollama pull llama3:3b

# Alternative: Phi-3 - Microsoft's efficient model
ollama pull phi3
```

### 3. Start Ollama Server
```bash
ollama serve
```

## Configuration

Add to your `.env` file:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

## API Endpoints

### Generate Idea
```http
GET /api/idea
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apis": ["GitHub API", "Spotify API", "OpenWeatherMap API"],
    "idea": "**Project Name:** CodeTunes Weather\n\n**One-Line Pitch:**...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Could not reach local LLM. Please ensure Ollama is running.",
  "hint": "Run: ollama serve"
}
```

### Health Check
```http
GET /api/idea/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "module": "idea-generator",
    "status": "operational",
    "ollama": {
      "available": true,
      "url": "http://localhost:11434",
      "model": "llama3"
    }
  }
}
```

## Module Architecture

```
/modules/idea-generator/
├── index.ts              # Main export
├── router.ts             # Express routes
├── controller.ts         # Request handlers
├── apiList.ts            # Static API list
├── randomizer.ts         # Random API selector
├── promptBuilder.ts      # LLM prompt builder
├── ollamaClient.ts       # Ollama API wrapper
└── README.md             # This file
```

## Usage in Main App

The module is already integrated in `server.ts`:

```typescript
import { router as ideaGeneratorRouter } from './modules/idea-generator';
app.use('/api', ideaGeneratorRouter);
```

## Performance

| Model | Size | Response Time | Quality |
|-------|------|---------------|---------|
| llama3 | 8B | 5-8s | Excellent |
| llama3:3b | 3B | 2-3s | Good |
| phi3 | 3.8B | 3-5s | Very Good |

## Testing

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test health endpoint
curl http://localhost:3000/api/idea/health

# Generate an idea
curl http://localhost:3000/api/idea
```

## Troubleshooting

### "Could not reach local LLM"
- Ensure Ollama is running: `ollama serve`
- Check Ollama is accessible: `curl http://localhost:11434/api/tags`
- Verify OLLAMA_URL in .env matches your Ollama instance

### Slow responses
- Use a smaller model: `ollama pull llama3:3b`
- Update .env: `OLLAMA_MODEL=llama3:3b`

### Model not found
- Pull the model: `ollama pull llama3`
- List available models: `ollama list`

## Future Enhancements
- [ ] Add "Generate Blueprint" endpoint
- [ ] Add "Generate Tech Stack" endpoint
- [ ] Support user-selected APIs
- [ ] Add MCP tool wrapper
- [ ] Local vector DB for idea storage
- [ ] Streaming responses for real-time feedback

## License
Part of API Roulette project
