const fs = require('fs');
const path = require('path');

// Read the current registry
const registryPath = path.join(__dirname, 'api-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Filter out test APIs
const cleanedAPIs = registry.apis.filter(api => !api.id.startsWith('test-api'));

// Additional APIs to add
const newAPIs = [
  {
    "id": "pokemon",
    "name": "PokéAPI",
    "description": "Pokémon data including species, abilities, and moves",
    "category": "gaming",
    "baseUrl": "https://pokeapi.co",
    "sampleEndpoint": "/api/v2/pokemon/ditto",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://pokeapi.co/docs/v2"
  },
  {
    "id": "rawg",
    "name": "RAWG Video Games Database",
    "description": "Video game database with 500,000+ games",
    "category": "gaming",
    "baseUrl": "https://api.rawg.io",
    "sampleEndpoint": "/api/games",
    "authType": "apikey",
    "corsCompatible": true,
    "mockData": {
      "games": [{"name": "The Witcher 3", "rating": 4.5}]
    },
    "documentationUrl": "https://rawg.io/apidocs"
  },
  {
    "id": "steam",
    "name": "Steam Web API",
    "description": "Steam game data, player stats, and achievements",
    "category": "gaming",
    "baseUrl": "https://api.steampowered.com",
    "sampleEndpoint": "/ISteamApps/GetAppList/v2",
    "authType": "apikey",
    "corsCompatible": true,
    "mockData": {
      "apps": [{"appid": 570, "name": "Dota 2"}]
    },
    "documentationUrl": "https://steamcommunity.com/dev"
  },
  {
    "id": "cocktaildb",
    "name": "TheCocktailDB",
    "description": "Cocktail recipes and ingredients",
    "category": "food",
    "baseUrl": "https://www.thecocktaildb.com",
    "sampleEndpoint": "/api/json/v1/1/search.php?s=margarita",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://www.thecocktaildb.com/api.php"
  },
  {
    "id": "mealdb",
    "name": "TheMealDB",
    "description": "Meal recipes from around the world",
    "category": "food",
    "baseUrl": "https://www.themealdb.com",
    "sampleEndpoint": "/api/json/v1/1/search.php?s=Arrabiata",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://www.themealdb.com/api.php"
  },
  {
    "id": "catfacts",
    "name": "Cat Facts API",
    "description": "Random cat facts",
    "category": "animals",
    "baseUrl": "https://catfact.ninja",
    "sampleEndpoint": "/fact",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://catfact.ninja"
  },
  {
    "id": "dogapi",
    "name": "Dog API",
    "description": "Random dog images by breed",
    "category": "animals",
    "baseUrl": "https://dog.ceo",
    "sampleEndpoint": "/api/breeds/image/random",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://dog.ceo/dog-api"
  },
  {
    "id": "thecatapi",
    "name": "The Cat API",
    "description": "Cat images, breeds, and facts",
    "category": "animals",
    "baseUrl": "https://api.thecatapi.com",
    "sampleEndpoint": "/v1/images/search",
    "authType": "apikey",
    "corsCompatible": true,
    "mockData": {
      "url": "https://cdn2.thecatapi.com/images/sample.jpg"
    },
    "documentationUrl": "https://thecatapi.com"
  },
  {
    "id": "quotes",
    "name": "Quotable API",
    "description": "Random quotes and authors",
    "category": "quotes",
    "baseUrl": "https://api.quotable.io",
    "sampleEndpoint": "/random",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://github.com/lukePeavey/quotable"
  },
  {
    "id": "adviceslip",
    "name": "Advice Slip API",
    "description": "Random pieces of advice",
    "category": "quotes",
    "baseUrl": "https://api.adviceslip.com",
    "sampleEndpoint": "/advice",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://api.adviceslip.com"
  },
  {
    "id": "jokesapi",
    "name": "JokeAPI",
    "description": "Programming and general jokes",
    "category": "entertainment",
    "baseUrl": "https://v2.jokeapi.dev",
    "sampleEndpoint": "/joke/Programming",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://jokeapi.dev"
  },
  {
    "id": "chucknorris",
    "name": "Chuck Norris Jokes API",
    "description": "Random Chuck Norris jokes",
    "category": "entertainment",
    "baseUrl": "https://api.chucknorris.io",
    "sampleEndpoint": "/jokes/random",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://api.chucknorris.io"
  },
  {
    "id": "ipapi",
    "name": "IP API",
    "description": "IP geolocation and information",
    "category": "utilities",
    "baseUrl": "http://ip-api.com",
    "sampleEndpoint": "/json",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://ip-api.com/docs"
  },
  {
    "id": "qrcode",
    "name": "QR Code Generator API",
    "description": "Generate QR codes",
    "category": "utilities",
    "baseUrl": "https://api.qrserver.com",
    "sampleEndpoint": "/v1/create-qr-code/?data=HelloWorld",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://goqr.me/api"
  },
  {
    "id": "urlshortener",
    "name": "TinyURL API",
    "description": "URL shortening service",
    "category": "utilities",
    "baseUrl": "https://tinyurl.com",
    "sampleEndpoint": "/api-create.php",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://tinyurl.com/app/dev"
  },
  {
    "id": "randomuser",
    "name": "Random User Generator",
    "description": "Generate random user data",
    "category": "utilities",
    "baseUrl": "https://randomuser.me",
    "sampleEndpoint": "/api",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://randomuser.me/documentation"
  },
  {
    "id": "agify",
    "name": "Agify API",
    "description": "Predict age from name",
    "category": "utilities",
    "baseUrl": "https://api.agify.io",
    "sampleEndpoint": "/?name=michael",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://agify.io"
  },
  {
    "id": "genderize",
    "name": "Genderize API",
    "description": "Predict gender from name",
    "category": "utilities",
    "baseUrl": "https://api.genderize.io",
    "sampleEndpoint": "/?name=peter",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://genderize.io"
  },
  {
    "id": "nationalize",
    "name": "Nationalize API",
    "description": "Predict nationality from name",
    "category": "utilities",
    "baseUrl": "https://api.nationalize.io",
    "sampleEndpoint": "/?name=michael",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://nationalize.io"
  },
  {
    "id": "bored",
    "name": "Bored API",
    "description": "Find random activities to do",
    "category": "entertainment",
    "baseUrl": "https://www.boredapi.com",
    "sampleEndpoint": "/api/activity",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://www.boredapi.com/documentation"
  },
  {
    "id": "numbersapi",
    "name": "Numbers API",
    "description": "Interesting facts about numbers",
    "category": "education",
    "baseUrl": "http://numbersapi.com",
    "sampleEndpoint": "/42",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "http://numbersapi.com"
  },
  {
    "id": "dictionary",
    "name": "Free Dictionary API",
    "description": "Word definitions and meanings",
    "category": "education",
    "baseUrl": "https://api.dictionaryapi.dev",
    "sampleEndpoint": "/api/v2/entries/en/hello",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://dictionaryapi.dev"
  },
  {
    "id": "wikipedia",
    "name": "Wikipedia API",
    "description": "Access Wikipedia content",
    "category": "education",
    "baseUrl": "https://en.wikipedia.org",
    "sampleEndpoint": "/w/api.php?action=query&list=search&srsearch=javascript",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://www.mediawiki.org/wiki/API:Main_page"
  },
  {
    "id": "carbon",
    "name": "Carbon Interface API",
    "description": "Calculate carbon emissions",
    "category": "environment",
    "baseUrl": "https://www.carboninterface.com",
    "sampleEndpoint": "/api/v1/estimates",
    "authType": "apikey",
    "corsCompatible": true,
    "mockData": {
      "carbon_kg": 12.5
    },
    "documentationUrl": "https://docs.carboninterface.com"
  },
  {
    "id": "openaq",
    "name": "OpenAQ Air Quality API",
    "description": "Real-time air quality data",
    "category": "environment",
    "baseUrl": "https://api.openaq.org",
    "sampleEndpoint": "/v2/latest",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://docs.openaq.org"
  },
  {
    "id": "sunrise",
    "name": "Sunrise Sunset API",
    "description": "Sunrise and sunset times",
    "category": "weather",
    "baseUrl": "https://api.sunrise-sunset.org",
    "sampleEndpoint": "/json?lat=36.7201600&lng=-4.4203400",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://sunrise-sunset.org/api"
  },
  {
    "id": "holidays",
    "name": "Calendarific API",
    "description": "Worldwide holidays and observances",
    "category": "calendar",
    "baseUrl": "https://calendarific.com",
    "sampleEndpoint": "/api/v2/holidays",
    "authType": "apikey",
    "corsCompatible": true,
    "mockData": {
      "holidays": [{"name": "New Year's Day", "date": "2024-01-01"}]
    },
    "documentationUrl": "https://calendarific.com/api-documentation"
  },
  {
    "id": "publicholidays",
    "name": "Public Holidays API",
    "description": "Public holidays by country",
    "category": "calendar",
    "baseUrl": "https://date.nager.at",
    "sampleEndpoint": "/api/v3/PublicHolidays/2024/US",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://date.nager.at/Api"
  },
  {
    "id": "color",
    "name": "The Color API",
    "description": "Color information and schemes",
    "category": "design",
    "baseUrl": "https://www.thecolorapi.com",
    "sampleEndpoint": "/id?hex=FF5733",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://www.thecolorapi.com/docs"
  },
  {
    "id": "loremipsum",
    "name": "Lorem Ipsum API",
    "description": "Generate placeholder text",
    "category": "design",
    "baseUrl": "https://loripsum.net",
    "sampleEndpoint": "/api",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://loripsum.net"
  },
  {
    "id": "placeholder",
    "name": "Placeholder.com",
    "description": "Generate placeholder images",
    "category": "design",
    "baseUrl": "https://via.placeholder.com",
    "sampleEndpoint": "/150",
    "authType": "none",
    "corsCompatible": true,
    "documentationUrl": "https://placeholder.com"
  }
];

// Combine cleaned APIs with new ones
const finalAPIs = [...cleanedAPIs, ...newAPIs];

// Write back to file
const output = {
  apis: finalAPIs
};

fs.writeFileSync(registryPath, JSON.stringify(output, null, 2));

console.log(`✅ Registry cleaned and updated!`);
console.log(`   Removed: ${registry.apis.length - cleanedAPIs.length} test APIs`);
console.log(`   Added: ${newAPIs.length} new APIs`);
console.log(`   Total: ${finalAPIs.length} APIs`);
