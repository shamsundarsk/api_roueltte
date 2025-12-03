# Mashup Maker API Documentation

Complete API reference for the Mashup Maker backend service.

## Base URL

```
http://localhost:3000/api
```

For production deployments, replace with your production URL.

## Authentication

Currently, the API does not require authentication. This may be added in future versions.

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting in production environments.

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional error details
  }
}
```

## Endpoints

### 1. Generate Mashup

Generate a new mashup by randomly selecting three APIs and creating a complete app concept with code scaffolding.

**Endpoint:** `POST /api/mashup/generate`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

All fields are optional. If no options are provided, the system will select three random APIs from any category.

```json
{
  "options": {
    "excludeCategories": ["weather", "finance"],  // Optional: categories to exclude
    "excludeAPIIds": ["api-id-1", "api-id-2"],   // Optional: specific APIs to exclude (for regeneration)
    "corsOnly": true,                             // Optional: only select CORS-compatible APIs
    "requireAuth": false                          // Optional: filter by authentication requirement
  }
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `options` | object | No | Selection criteria for API selection |
| `options.excludeCategories` | string[] | No | Array of category names to exclude |
| `options.excludeAPIIds` | string[] | No | Array of API IDs to exclude (used for regeneration) |
| `options.corsOnly` | boolean | No | If true, only select CORS-compatible APIs |
| `options.requireAuth` | boolean | No | If true, only select APIs requiring authentication; if false, only select APIs without authentication |

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "mashup_1701360000000_abc123",
    "idea": {
      "appName": "Weather Music Navigator",
      "description": "An innovative application that combines real-time weather data with personalized music recommendations and interactive mapping. Users can discover how weather influences their music preferences while exploring weather patterns across different locations. The app creates a unique audio-visual experience by synchronizing atmospheric conditions with curated playlists.",
      "features": [
        "Real-time weather data integration with current conditions and forecasts",
        "Dynamic music playlist generation based on weather mood and temperature",
        "Interactive map showing weather patterns and music trends by location",
        "Personalized recommendations combining weather preferences and music taste",
        "Social sharing of weather-music combinations"
      ],
      "rationale": "These APIs work together because weather significantly influences human mood and emotions, music has the power to enhance or complement those moods, and maps provide geographical context that makes the experience more immersive and personalized. By combining weather data, music streaming, and location services, users can discover new ways to experience both their environment and their music library.",
      "apis": [
        {
          "id": "openweather",
          "name": "OpenWeather API",
          "description": "Provides current weather data, forecasts, and historical weather information",
          "category": "weather",
          "baseUrl": "https://api.openweathermap.org",
          "sampleEndpoint": "/data/2.5/weather",
          "authType": "apikey",
          "corsCompatible": true,
          "documentationUrl": "https://openweathermap.org/api"
        },
        {
          "id": "spotify",
          "name": "Spotify Web API",
          "description": "Access to Spotify's music catalog, user playlists, and playback control",
          "category": "music",
          "baseUrl": "https://api.spotify.com",
          "sampleEndpoint": "/v1/search",
          "authType": "oauth",
          "corsCompatible": true,
          "documentationUrl": "https://developer.spotify.com/documentation/web-api"
        },
        {
          "id": "mapbox",
          "name": "Mapbox API",
          "description": "Mapping, geocoding, and location services",
          "category": "maps",
          "baseUrl": "https://api.mapbox.com",
          "sampleEndpoint": "/geocoding/v5/mapbox.places",
          "authType": "apikey",
          "corsCompatible": true,
          "documentationUrl": "https://docs.mapbox.com/api/"
        }
      ]
    },
    "uiLayout": {
      "screens": [
        {
          "name": "Dashboard",
          "description": "Main screen displaying current weather, music player, and map view",
          "components": ["WeatherCard", "MusicPlayer", "MapView", "RecommendationList"]
        },
        {
          "name": "Playlist Browser",
          "description": "Browse and select weather-based playlists",
          "components": ["PlaylistGrid", "FilterBar", "WeatherIndicator"]
        },
        {
          "name": "Map Explorer",
          "description": "Interactive map showing weather and music data by location",
          "components": ["InteractiveMap", "LocationSearch", "WeatherOverlay"]
        }
      ],
      "components": [
        {
          "type": "card",
          "purpose": "Display current weather conditions with temperature, humidity, and conditions",
          "apiSource": "OpenWeather API"
        },
        {
          "type": "player",
          "purpose": "Music playback controls and current track information",
          "apiSource": "Spotify Web API"
        },
        {
          "type": "map",
          "purpose": "Interactive map showing user location and weather patterns",
          "apiSource": "Mapbox API"
        },
        {
          "type": "list",
          "purpose": "Display recommended playlists based on current weather",
          "apiSource": "Spotify Web API"
        }
      ],
      "interactionFlow": {
        "steps": [
          {
            "from": "Dashboard",
            "to": "Playlist Browser",
            "action": "User clicks on recommended playlist"
          },
          {
            "from": "Playlist Browser",
            "to": "Dashboard",
            "action": "User selects a playlist to play"
          },
          {
            "from": "Dashboard",
            "to": "Map Explorer",
            "action": "User clicks on map view"
          },
          {
            "from": "Map Explorer",
            "to": "Dashboard",
            "action": "User selects a location on the map"
          }
        ]
      }
    },
    "codePreview": {
      "backendSnippet": "const express = require('express');\nconst cors = require('cors');\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\n// API Integration Points\nconst openweatherService = require('./services/openweather.service');\nconst spotifyService = require('./services/spotify.service');\nconst mapboxService = require('./services/mapbox.service');\n\n// Routes\napp.get('/api/weather', async (req, res) => {\n  // TODO: Implement OpenWeather API integration\n});\n\napp.get('/api/music', async (req, res) => {\n  // TODO: Implement Spotify Web API integration\n});\n\napp.get('/api/location', async (req, res) => {\n  // TODO: Implement Mapbox API integration\n});\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});",
      "frontendSnippet": "import React from 'react';\nimport { BrowserRouter as Router, Routes, Route } from 'react-router-dom';\nimport Dashboard from './components/Dashboard';\nimport PlaylistBrowser from './components/PlaylistBrowser';\nimport MapExplorer from './components/MapExplorer';\n\nfunction App() {\n  return (\n    <Router>\n      <div className=\"app\">\n        <Routes>\n          <Route path=\"/\" element={<Dashboard />} />\n          <Route path=\"/playlists\" element={<PlaylistBrowser />} />\n          <Route path=\"/map\" element={<MapExplorer />} />\n        </Routes>\n      </div>\n    </Router>\n  );\n}\n\nexport default App;",
      "structure": {
        "name": "root",
        "type": "directory",
        "children": [
          {
            "name": "backend",
            "type": "directory",
            "children": [
              {
                "name": "src",
                "type": "directory",
                "children": [
                  { "name": "server.js", "type": "file" },
                  {
                    "name": "routes",
                    "type": "directory",
                    "children": [
                      { "name": "mashup.routes.js", "type": "file" }
                    ]
                  },
                  {
                    "name": "services",
                    "type": "directory",
                    "children": [
                      { "name": "openweather.service.js", "type": "file" },
                      { "name": "spotify.service.js", "type": "file" },
                      { "name": "mapbox.service.js", "type": "file" }
                    ]
                  },
                  {
                    "name": "utils",
                    "type": "directory",
                    "children": [
                      { "name": "apiClient.js", "type": "file" }
                    ]
                  }
                ]
              },
              { "name": "package.json", "type": "file" },
              { "name": ".env.example", "type": "file" }
            ]
          },
          {
            "name": "frontend",
            "type": "directory",
            "children": [
              {
                "name": "src",
                "type": "directory",
                "children": [
                  { "name": "App.jsx", "type": "file" },
                  { "name": "index.js", "type": "file" },
                  {
                    "name": "components",
                    "type": "directory",
                    "children": [
                      { "name": "Dashboard.jsx", "type": "file" },
                      { "name": "PlaylistBrowser.jsx", "type": "file" },
                      { "name": "MapExplorer.jsx", "type": "file" }
                    ]
                  },
                  {
                    "name": "services",
                    "type": "directory",
                    "children": [
                      { "name": "api.service.js", "type": "file" }
                    ]
                  }
                ]
              },
              { "name": "package.json", "type": "file" },
              { "name": ".env.example", "type": "file" }
            ]
          },
          { "name": "README.md", "type": "file" }
        ]
      }
    },
    "downloadUrl": "/api/mashup/download/weather-music-navigator.zip",
    "timestamp": 1701360000000
  }
}
```

**Error Responses:**

**400 Bad Request - Insufficient APIs:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_APIS",
    "message": "Not enough APIs available for selection. Required: 3, Available: 2",
    "details": {
      "required": 3,
      "available": 2
    }
  }
}
```

**400 Bad Request - Insufficient Categories:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CATEGORIES",
    "message": "Not enough categories available for diverse selection. Required: 3, Available: 2",
    "details": {
      "required": 3,
      "available": 2
    }
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "PIPELINE_ERROR",
    "message": "An error occurred during mashup generation",
    "details": {}
  }
}
```

**Example cURL Request:**

```bash
# Generate mashup with default options
curl -X POST http://localhost:3000/api/mashup/generate \
  -H "Content-Type: application/json" \
  -d '{}'

# Generate mashup excluding weather category
curl -X POST http://localhost:3000/api/mashup/generate \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "excludeCategories": ["weather"]
    }
  }'

# Generate mashup with CORS-only APIs
curl -X POST http://localhost:3000/api/mashup/generate \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "corsOnly": true
    }
  }'
```

**Example JavaScript/Axios Request:**

```javascript
import axios from 'axios';

// Generate mashup
const generateMashup = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/mashup/generate', {
      options: {
        excludeCategories: ['weather'],
        corsOnly: true
      }
    });
    
    console.log('Mashup generated:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error generating mashup:', error.response?.data || error.message);
    throw error;
  }
};
```

---

### 2. Download Mashup

Download the ZIP archive containing the generated project files.

**Endpoint:** `GET /api/mashup/download/:filename`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | string | Yes | The ZIP filename from the mashup generation response (e.g., "weather-music-navigator.zip") |

**Success Response (200 OK):**

- **Content-Type:** `application/zip`
- **Content-Disposition:** `attachment; filename="weather-music-navigator.zip"`
- **Body:** Binary ZIP file data

**Error Responses:**

**400 Bad Request - Invalid Filename:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILENAME",
    "message": "Invalid filename: ../../../etc/passwd",
    "details": {
      "filename": "../../../etc/passwd"
    }
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found: weather-music-navigator.zip",
    "details": {
      "filename": "weather-music-navigator.zip"
    }
  }
}
```

**Example cURL Request:**

```bash
# Download mashup ZIP file
curl -O http://localhost:3000/api/mashup/download/weather-music-navigator.zip
```

**Example JavaScript/Axios Request:**

```javascript
import axios from 'axios';

// Download mashup
const downloadMashup = async (filename) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/mashup/download/${filename}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error downloading mashup:', error.response?.data || error.message);
    throw error;
  }
};
```

---

### 3. Get All APIs

Retrieve all APIs from the registry with optional filtering by category or authentication type.

**Endpoint:** `GET /api/registry/apis`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter APIs by category (e.g., "weather", "music", "maps") |
| `authType` | string | No | Filter APIs by authentication type ("none", "apikey", "oauth") |

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "apis": [
      {
        "id": "openweather",
        "name": "OpenWeather API",
        "description": "Provides current weather data, forecasts, and historical weather information",
        "category": "weather",
        "baseUrl": "https://api.openweathermap.org",
        "sampleEndpoint": "/data/2.5/weather",
        "authType": "apikey",
        "corsCompatible": true,
        "documentationUrl": "https://openweathermap.org/api"
      },
      {
        "id": "spotify",
        "name": "Spotify Web API",
        "description": "Access to Spotify's music catalog, user playlists, and playback control",
        "category": "music",
        "baseUrl": "https://api.spotify.com",
        "sampleEndpoint": "/v1/search",
        "authType": "oauth",
        "corsCompatible": true,
        "documentationUrl": "https://developer.spotify.com/documentation/web-api"
      }
      // ... more APIs
    ],
    "count": 50
  }
}
```

**Example cURL Requests:**

```bash
# Get all APIs
curl http://localhost:3000/api/registry/apis

# Get APIs in weather category
curl http://localhost:3000/api/registry/apis?category=weather

# Get APIs with no authentication
curl http://localhost:3000/api/registry/apis?authType=none

# Get APIs requiring API keys
curl http://localhost:3000/api/registry/apis?authType=apikey
```

**Example JavaScript/Axios Request:**

```javascript
import axios from 'axios';

// Get all APIs
const getAllAPIs = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/registry/apis');
    console.log(`Found ${response.data.data.count} APIs`);
    return response.data.data.apis;
  } catch (error) {
    console.error('Error fetching APIs:', error.response?.data || error.message);
    throw error;
  }
};

// Get APIs by category
const getAPIsByCategory = async (category) => {
  try {
    const response = await axios.get('http://localhost:3000/api/registry/apis', {
      params: { category }
    });
    return response.data.data.apis;
  } catch (error) {
    console.error('Error fetching APIs:', error.response?.data || error.message);
    throw error;
  }
};
```

---

### 4. Add New API

Add a new API to the registry. This endpoint is intended for administrative use.

**Endpoint:** `POST /api/registry/apis`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

```json
{
  "id": "new-api",
  "name": "New API",
  "description": "Description of the API functionality",
  "category": "weather",
  "baseUrl": "https://api.example.com",
  "sampleEndpoint": "/v1/data",
  "authType": "apikey",
  "corsCompatible": true,
  "documentationUrl": "https://docs.example.com",
  "mockData": {
    "example": "Optional sample response data"
  }
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (lowercase, hyphenated) |
| `name` | string | Yes | Display name for the API |
| `description` | string | Yes | Brief description of API functionality |
| `category` | string | Yes | Category (e.g., "weather", "music", "maps") |
| `baseUrl` | string | Yes | Base URL for API requests |
| `sampleEndpoint` | string | Yes | Example endpoint path |
| `authType` | string | Yes | Authentication type: "none", "apikey", or "oauth" |
| `corsCompatible` | boolean | Yes | Whether the API supports CORS |
| `documentationUrl` | string | Yes | Link to API documentation |
| `mockData` | object | No | Sample response data for Mock Mode |

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "new-api",
    "message": "API added successfully"
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Metadata:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_METADATA",
    "message": "Invalid API metadata: all required fields must be present and valid"
  }
}
```

**409 Conflict - Duplicate API:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_API",
    "message": "API with id 'new-api' already exists"
  }
}
```

**Example cURL Request:**

```bash
curl -X POST http://localhost:3000/api/registry/apis \
  -H "Content-Type: application/json" \
  -d '{
    "id": "new-weather-api",
    "name": "New Weather API",
    "description": "Provides weather forecasts and current conditions",
    "category": "weather",
    "baseUrl": "https://api.newweather.com",
    "sampleEndpoint": "/v1/current",
    "authType": "apikey",
    "corsCompatible": true,
    "documentationUrl": "https://docs.newweather.com"
  }'
```

**Example JavaScript/Axios Request:**

```javascript
import axios from 'axios';

// Add new API
const addAPI = async (apiData) => {
  try {
    const response = await axios.post('http://localhost:3000/api/registry/apis', apiData);
    console.log('API added successfully:', response.data.data);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.error('API already exists');
    } else if (error.response?.status === 400) {
      console.error('Invalid API metadata');
    } else {
      console.error('Error adding API:', error.response?.data || error.message);
    }
    throw error;
  }
};
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INSUFFICIENT_APIS` | 400 | Not enough APIs available for selection |
| `INSUFFICIENT_CATEGORIES` | 400 | Not enough categories available for diverse selection |
| `INVALID_FILENAME` | 400 | Invalid or malicious filename in download request |
| `INVALID_API_METADATA` | 400 | API metadata validation failed |
| `FILE_NOT_FOUND` | 404 | Requested ZIP file not found |
| `DUPLICATE_API` | 409 | API with the same ID already exists |
| `PIPELINE_ERROR` | 500 | Error during mashup generation pipeline |
| `API_SELECTION_FAILED` | 500 | Failed to select APIs |
| `IDEA_GENERATION_FAILED` | 500 | Failed to generate app idea |
| `CODE_GENERATION_FAILED` | 500 | Failed to generate code |
| `ZIP_EXPORT_FAILED` | 500 | Failed to create ZIP archive |

## Mock Mode

When APIs require authentication (OAuth or API keys), the system automatically activates Mock Mode:

- Generated code includes sample JSON responses
- README contains instructions for integrating real APIs
- Mock data indicators are added to documentation
- The mashup generation process continues without interruption

APIs in Mock Mode will have their `authType` set to `"apikey"` or `"oauth"` in the response.

## Best Practices

### Client-Side Implementation

1. **Handle Loading States**: Mashup generation can take a few seconds
2. **Implement Error Handling**: Always handle error responses gracefully
3. **Cache API List**: The API registry doesn't change frequently
4. **Validate User Input**: Validate options before sending requests
5. **Use Proper HTTP Methods**: POST for generation, GET for retrieval

### Performance Considerations

1. **Timeout Handling**: Set appropriate timeouts for mashup generation (recommended: 10 seconds)
2. **Retry Logic**: Implement retry logic for transient failures
3. **Download Streaming**: Use streaming for large ZIP downloads
4. **Cleanup**: Downloaded ZIP files are automatically cleaned up after 24 hours

### Security Considerations

1. **Filename Validation**: The API validates filenames to prevent path traversal attacks
2. **Input Sanitization**: All user inputs are validated and sanitized
3. **Rate Limiting**: Consider implementing rate limiting in production
4. **HTTPS**: Always use HTTPS in production environments

## Support

For issues or questions about the API:
- Check the main [README.md](README.md)
- Review [CONTRIBUTING.md](CONTRIBUTING.md)
- Open an issue on GitHub


---

### 5. AI Chatbot - Send Message

Send a message to the AI assistant for help with your downloaded project.

**Endpoint:** `POST /api/chatbot/chat`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "How do I add API keys to my project?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant",
      "content": "Previous assistant response"
    }
  ],
  "projectContext": {
    "id": "mashup_123",
    "idea": {
      "appName": "Weather Music Navigator",
      "apis": [...]
    }
  },
  "errorContext": {
    "errorMessage": "Cannot find module 'express'",
    "stackTrace": "Error: Cannot find module 'express'...",
    "fileName": "server.js",
    "lineNumber": 1
  }
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's question or message |
| `conversationHistory` | array | No | Previous messages in the conversation |
| `projectContext` | object | No | The generated mashup project data |
| `errorContext` | object | No | Error details for debugging assistance |

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "To add API keys to your project:\n\n1. Open backend/.env file\n2. Add your API keys following this format:\n   API_NAME_KEY=your_actual_key_here\n\n3. For your Weather Music Navigator project, you'll need:\n   - OPENWEATHER_API_KEY=your_key\n   - SPOTIFY_CLIENT_ID=your_id\n   - SPOTIFY_CLIENT_SECRET=your_secret\n   - MAPBOX_API_KEY=your_key\n\n4. Restart your backend server after adding keys\n\nCheck each API's documentation link in the README for how to obtain keys.",
    "conversationHistory": [
      {
        "role": "user",
        "content": "How do I add API keys to my project?"
      },
      {
        "role": "assistant",
        "content": "To add API keys to your project:..."
      }
    ]
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Message:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "Message is required and must be a non-empty string"
  }
}
```

**500 Internal Server Error - AI Service Not Configured:**
```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "AI service is not configured. Please add your AI_API_KEY to the .env file."
  }
}
```

**Example cURL Request:**

```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I fix CORS errors in my project?"
  }'
```

**Example JavaScript/Axios Request:**

```javascript
import axios from 'axios';

const sendChatMessage = async (message, projectContext) => {
  try {
    const response = await axios.post('http://localhost:3000/api/chatbot/chat', {
      message,
      projectContext
    });
    
    console.log('AI Response:', response.data.data.message);
    return response.data.data;
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    throw error;
  }
};
```

---

### 6. AI Chatbot - Get Quick Help

Get quick help for common topics without AI processing.

**Endpoint:** `GET /api/chatbot/quick-help/:topic`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Help topic: "setup", "api-keys", "errors", or "structure" |

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "topic": "setup",
    "help": "To set up your downloaded project:\n\n1. Extract the ZIP file\n2. Navigate to the backend directory:\n   cd backend\n   npm install\n   \n3. Configure environment variables:\n   - Copy .env.example to .env\n   - Add your API keys for the APIs that require authentication\n   \n4. Start the backend:\n   npm run dev\n   \n5. In a new terminal, navigate to frontend:\n   cd frontend\n   npm install\n   \n6. Configure frontend environment:\n   - Copy .env.example to .env\n   - Set VITE_API_BASE_URL (usually http://localhost:3000/api)\n   \n7. Start the frontend:\n   npm run dev\n\nYour app should now be running!"
  }
}
```

**Available Topics:**

- `setup` - Project setup instructions
- `api-keys` - How to add API keys
- `errors` - Common errors and solutions
- `structure` - Project structure overview

**Example cURL Request:**

```bash
curl http://localhost:3000/api/chatbot/quick-help/setup
```

---

### 7. AI Chatbot - Check Status

Check if the AI chatbot service is configured and ready.

**Endpoint:** `GET /api/chatbot/status`

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "configured": true,
    "message": "AI chatbot is ready"
  }
}
```

**When Not Configured:**

```json
{
  "success": true,
  "data": {
    "configured": false,
    "message": "AI chatbot requires configuration. Please add AI_API_KEY to .env file."
  }
}
```

**Example cURL Request:**

```bash
curl http://localhost:3000/api/chatbot/status
```

---

## AI Chatbot Configuration

To enable the AI chatbot feature, add the following to your `backend/.env` file:

```env
# AI Chatbot Configuration
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4
AI_API_URL=https://api.openai.com/v1/chat/completions
```

### Supported AI Providers

The chatbot is designed to work with OpenAI's API, but can be configured for other providers:

**OpenAI (Default):**
```env
AI_API_KEY=sk-...
AI_MODEL=gpt-4
AI_API_URL=https://api.openai.com/v1/chat/completions
```

**Azure OpenAI:**
```env
AI_API_KEY=your_azure_key
AI_MODEL=gpt-4
AI_API_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
```

**Other OpenAI-Compatible APIs:**
Any API that follows the OpenAI chat completions format should work.

### AI Chatbot Features

The AI assistant provides:

1. **Code Explanation** - Understands the generated project structure and explains code
2. **Error Debugging** - Analyzes error messages and provides specific fixes
3. **API Integration Help** - Guides users through API setup and authentication
4. **Best Practices** - Suggests improvements and follows industry standards
5. **Context-Aware** - Knows about the specific APIs and features in your project

### Quick Help Topics

For instant help without AI processing, use the quick help endpoints:

- **setup** - Complete setup guide for downloaded projects
- **api-keys** - Instructions for adding API keys
- **errors** - Common errors and their solutions
- **structure** - Overview of project structure

