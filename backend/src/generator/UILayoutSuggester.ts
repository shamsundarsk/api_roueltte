import {
  APIMetadata,
  AppIdea,
  UILayout,
  Screen,
  ComponentSuggestion,
  InteractionFlow,
  FlowStep,
} from '../types/api.types';

/**
 * UILayoutSuggester generates UI layout recommendations based on API capabilities
 */
export class UILayoutSuggester {
  /**
   * Generate complete UI layout suggestions for an app idea
   */
  generateLayout(idea: AppIdea): UILayout {
    const screens = this.suggestScreens(idea.apis);
    const components = this.suggestComponents(idea.apis);
    const interactionFlow = this.suggestInteractionFlow(screens);

    return {
      screens,
      components,
      interactionFlow,
    };
  }

  /**
   * Suggest 2-4 screens based on API capabilities
   */
  suggestScreens(apis: APIMetadata[]): Screen[] {
    const screens: Screen[] = [];

    // Always include a landing/dashboard screen
    const dashboardComponents = apis.map((api) => `${api.name} Overview`);
    screens.push({
      name: 'Dashboard',
      description: 'Main landing page displaying overview of all integrated APIs',
      components: ['Navigation Bar', 'Header', ...dashboardComponents, 'Footer'],
    });

    // Create a screen for each API based on its category and capabilities
    apis.forEach((api) => {
      const screenName = this.generateScreenName(api);
      const components = this.generateScreenComponents(api);
      const description = this.generateScreenDescription(api);

      screens.push({
        name: screenName,
        description,
        components,
      });
    });

    return screens;
  }

  /**
   * Generate a screen name based on API metadata
   */
  private generateScreenName(api: APIMetadata): string {
    // Remove common suffixes like "API" and capitalize
    const cleanName = api.name.replace(/\s*API\s*/i, '').trim();
    return `${cleanName} Screen`;
  }

  /**
   * Generate screen description based on API capabilities
   */
  private generateScreenDescription(api: APIMetadata): string {
    return `Screen dedicated to ${api.name} functionality, displaying ${api.description.toLowerCase()}`;
  }

  /**
   * Generate components for a screen based on API type
   */
  private generateScreenComponents(api: APIMetadata): string[] {
    const components: string[] = ['Navigation Bar'];

    // Map category to appropriate component types
    const categoryComponentMap: Record<string, string[]> = {
      weather: ['Weather Card', 'Temperature Display', 'Forecast List', 'Location Selector'],
      music: ['Music Player', 'Playlist', 'Track List', 'Search Bar'],
      maps: ['Map View', 'Location Marker', 'Search Input', 'Directions Panel'],
      news: ['Article List', 'Article Card', 'Category Filter', 'Search Bar'],
      finance: ['Stock Chart', 'Price Display', 'Ticker List', 'Portfolio Summary'],
      sports: ['Score Card', 'Team List', 'Match Schedule', 'Statistics Panel'],
      food: ['Recipe Card', 'Ingredient List', 'Search Bar', 'Nutrition Info'],
      movies: ['Movie Card', 'Movie List', 'Search Bar', 'Rating Display'],
      books: ['Book Card', 'Book List', 'Search Bar', 'Author Info'],
      games: ['Game Card', 'Leaderboard', 'Player Stats', 'Search Bar'],
      social: ['Post Feed', 'User Profile', 'Comment Section', 'Share Button'],
      productivity: ['Task List', 'Calendar View', 'Form Input', 'Status Indicator'],
      health: ['Health Metrics', 'Chart Display', 'Activity Log', 'Goal Tracker'],
      travel: ['Destination Card', 'Map View', 'Booking Form', 'Itinerary List'],
      education: ['Course List', 'Lesson Card', 'Progress Tracker', 'Quiz Component'],
    };

    // Get components based on category, or use generic components
    // Use hasOwnProperty to avoid prototype pollution issues (e.g., category="constructor")
    const categoryKey = api.category.toLowerCase();
    const categoryComponents =
      Object.prototype.hasOwnProperty.call(categoryComponentMap, categoryKey)
        ? categoryComponentMap[categoryKey]
        : [
            'Data Display Card',
            'List View',
            'Search/Filter Bar',
            'Detail Panel',
          ];

    components.push(...categoryComponents);
    components.push('Loading Indicator', 'Error Message Display');

    return components;
  }

  /**
   * Map API response types to UI component suggestions
   */
  suggestComponents(apis: APIMetadata[]): ComponentSuggestion[] {
    const suggestions: ComponentSuggestion[] = [];

    apis.forEach((api) => {
      const apiSuggestions = this.generateComponentSuggestionsForAPI(api);
      suggestions.push(...apiSuggestions);
    });

    return suggestions;
  }

  /**
   * Generate component suggestions for a specific API
   */
  private generateComponentSuggestionsForAPI(api: APIMetadata): ComponentSuggestion[] {
    const suggestions: ComponentSuggestion[] = [];

    // Map categories to component types
    const categoryToComponentType: Record<
      string,
      Array<{ type: ComponentSuggestion['type']; purpose: string }>
    > = {
      weather: [
        { type: 'card', purpose: 'Display current weather conditions' },
        { type: 'list', purpose: 'Show weather forecast for upcoming days' },
        { type: 'chart', purpose: 'Visualize temperature trends' },
      ],
      music: [
        { type: 'player', purpose: 'Play audio tracks' },
        { type: 'list', purpose: 'Display playlists and tracks' },
        { type: 'card', purpose: 'Show album or artist information' },
      ],
      maps: [
        { type: 'map', purpose: 'Display geographic locations' },
        { type: 'form', purpose: 'Input location search queries' },
        { type: 'list', purpose: 'Show nearby places or directions' },
      ],
      news: [
        { type: 'list', purpose: 'Display news articles' },
        { type: 'card', purpose: 'Show article preview with image' },
        { type: 'form', purpose: 'Filter news by category or search' },
      ],
      finance: [
        { type: 'chart', purpose: 'Display stock price trends' },
        { type: 'card', purpose: 'Show current stock prices and changes' },
        { type: 'list', purpose: 'List portfolio holdings' },
      ],
      sports: [
        { type: 'card', purpose: 'Display game scores and team info' },
        { type: 'list', purpose: 'Show match schedules' },
        { type: 'chart', purpose: 'Visualize player or team statistics' },
      ],
      food: [
        { type: 'card', purpose: 'Display recipe with image' },
        { type: 'list', purpose: 'Show ingredients and instructions' },
        { type: 'form', purpose: 'Search recipes by ingredients' },
      ],
      movies: [
        { type: 'card', purpose: 'Display movie poster and details' },
        { type: 'list', purpose: 'Show movie listings' },
        { type: 'form', purpose: 'Search movies by title or genre' },
      ],
      social: [
        { type: 'list', purpose: 'Display social media feed' },
        { type: 'card', purpose: 'Show individual posts' },
        { type: 'form', purpose: 'Create new posts or comments' },
      ],
      productivity: [
        { type: 'list', purpose: 'Display tasks or calendar events' },
        { type: 'form', purpose: 'Create or edit tasks' },
        { type: 'card', purpose: 'Show task details' },
      ],
    };

    // Get suggestions for this API's category, or use generic suggestions
    const categorySuggestions = categoryToComponentType[api.category.toLowerCase()] || [
      { type: 'card' as const, purpose: `Display ${api.name} data` },
      { type: 'list' as const, purpose: `List ${api.name} items` },
      { type: 'form' as const, purpose: `Input parameters for ${api.name}` },
    ];

    categorySuggestions.forEach((suggestion) => {
      suggestions.push({
        type: suggestion.type,
        purpose: suggestion.purpose,
        apiSource: api.name,
      });
    });

    return suggestions;
  }

  /**
   * Describe navigation flow between screens
   */
  suggestInteractionFlow(screens: Screen[]): InteractionFlow {
    const steps: FlowStep[] = [];

    if (screens.length === 0) {
      return { steps };
    }

    // Start from Dashboard
    const dashboard = screens.find((s) => s.name === 'Dashboard') || screens[0];

    // Create flow from dashboard to each feature screen
    screens.forEach((screen) => {
      if (screen.name !== dashboard.name) {
        steps.push({
          from: dashboard.name,
          to: screen.name,
          action: `Click on ${screen.name} navigation item or card`,
        });

        // Add return flow
        steps.push({
          from: screen.name,
          to: dashboard.name,
          action: 'Click back button or home navigation',
        });
      }
    });

    // Add cross-navigation between feature screens if there are multiple
    const featureScreens = screens.filter((s) => s.name !== dashboard.name);
    if (featureScreens.length > 1) {
      for (let i = 0; i < featureScreens.length - 1; i++) {
        steps.push({
          from: featureScreens[i].name,
          to: featureScreens[i + 1].name,
          action: `Navigate via menu or related content link`,
        });
      }
    }

    return { steps };
  }
}
