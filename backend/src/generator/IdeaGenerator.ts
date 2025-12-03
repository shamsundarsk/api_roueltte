import { APIMetadata, AppIdea } from '../types';
import { IdeaGenerationError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

/**
 * IdeaGenerator class responsible for generating creative app concepts
 * from API combinations using template-based generation
 */
export class IdeaGenerator {
  /**
   * Generate a complete app idea from three APIs
   */
  generateIdea(apis: APIMetadata[]): AppIdea {
    if (apis.length !== 3) {
      logger.logError(
        new IdeaGenerationError('Exactly 3 APIs are required for idea generation', {
          providedCount: apis.length,
        })
      );
      throw new IdeaGenerationError('Exactly 3 APIs are required for idea generation', {
        providedCount: apis.length,
      });
    }

    try {
      const appName = this.generateAppName(apis);
      const description = this.generateDescription(apis);
      const features = this.generateFeatures(apis);
      const rationale = this.generateRationale(apis);

      logger.logInfo('App idea generated successfully', { appName });

      return {
        appName,
        description,
        features,
        rationale,
        apis,
      };
    } catch (error) {
      logger.logError(
        new IdeaGenerationError('Failed to generate app idea', {
          apis: apis.map(api => api.id),
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
      throw new IdeaGenerationError('Failed to generate app idea', {
        apis: apis.map(api => api.id),
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Generate an app name by combining API themes
   */
  generateAppName(apis: APIMetadata[]): string {
    // Extract key themes from API names and categories
    const themes = apis.map((api) => {
      // Extract the main word from API name (remove "API", "Service", etc.)
      const cleanName = api.name
        .replace(/\s*(API|Service|Platform)\s*/gi, '')
        .trim();
      return cleanName;
    });

    // Template patterns for app names
    const patterns = [
      `${themes[0]} ${themes[1]} ${themes[2]}`,
      `${themes[0]}-Powered ${themes[1]}`,
      `${themes[2]} ${themes[0]} Hub`,
      `Smart${themes[1]} with ${themes[0]}`,
      `${themes[0]} ${themes[2]} Connect`,
      `${themes[1]}${themes[2]} Explorer`,
      `The ${themes[0]} ${themes[1]} App`,
      `${themes[2]}-Enhanced ${themes[0]}`,
    ];

    // Select a pattern based on API combination (deterministic but varied)
    const patternIndex =
      (apis[0].id.charCodeAt(0) + apis[1].id.charCodeAt(0)) % patterns.length;
    return patterns[patternIndex];
  }

  /**
   * Generate a 2-4 sentence description of the app concept
   */
  generateDescription(apis: APIMetadata[]): string {
    const [api1, api2, api3] = apis;

    // Sanitize text to remove periods and other punctuation that could create sentence boundaries
    const sanitizeText = (text: string): string => {
      return text.replace(/[.!?;]/g, '').trim() || 'API';
    };

    const cleanName1 = sanitizeText(api1.name);
    const cleanName2 = sanitizeText(api2.name);
    const cleanName3 = sanitizeText(api3.name);
    const cleanCategory1 = sanitizeText(api1.category);
    const cleanCategory2 = sanitizeText(api2.category);
    const cleanCategory3 = sanitizeText(api3.category);

    // Extract category-based action verbs
    const getActionVerb = (category: string): string => {
      const verbMap: Record<string, string> = {
        weather: 'tracks weather conditions',
        music: 'plays and discovers music',
        maps: 'provides location services',
        news: 'delivers news updates',
        finance: 'monitors financial data',
        sports: 'tracks sports events',
        food: 'discovers recipes and restaurants',
        travel: 'plans travel itineraries',
        social: 'connects people',
        entertainment: 'provides entertainment content',
        productivity: 'enhances productivity',
        health: 'monitors health metrics',
        education: 'facilitates learning',
        gaming: 'provides gaming experiences',
      };
      return verbMap[category.toLowerCase()] || `integrates ${sanitizeText(category)} data`;
    };

    const action1 = getActionVerb(api1.category);
    const action2 = getActionVerb(api2.category);
    const action3 = getActionVerb(api3.category);

    // Generate 2-4 sentences
    const sentences = [
      `This innovative application combines the power of ${cleanName1}, ${cleanName2}, and ${cleanName3} to create a unique user experience.`,
      `The app ${action1} using ${cleanName1}, ${action2} through ${cleanName2}, and ${action3} via ${cleanName3}.`,
      `Users can seamlessly interact with all three services in a unified interface, creating workflows that weren't possible before.`,
      `By leveraging these APIs together, the application opens up new possibilities for ${cleanCategory1}, ${cleanCategory2}, and ${cleanCategory3} integration.`,
    ];

    // Return 2-4 sentences (vary based on API combination)
    const sentenceCount = 2 + ((apis[0].id.length + apis[1].id.length) % 3);
    return sentences.slice(0, sentenceCount).join(' ');
  }

  /**
   * Generate 3-5 key features that leverage all three APIs
   */
  generateFeatures(apis: APIMetadata[]): string[] {
    const [api1, api2, api3] = apis;

    // Generate features that combine API capabilities
    const features = [
      `Real-time ${api1.category} data integration powered by ${api1.name}`,
      `Interactive ${api2.category} features using ${api2.name} endpoints`,
      `Advanced ${api3.category} capabilities through ${api3.name} integration`,
      `Cross-platform synchronization combining ${api1.name} and ${api2.name} data`,
      `Smart recommendations based on ${api2.name} and ${api3.name} insights`,
      `Unified dashboard displaying ${api1.category}, ${api2.category}, and ${api3.category} information`,
      `Automated workflows connecting ${api1.name}, ${api2.name}, and ${api3.name}`,
    ];

    // Return 3-5 features (vary based on API combination)
    const featureCount = 3 + ((apis[0].id.length + apis[2].id.length) % 3);
    return features.slice(0, featureCount);
  }

  /**
   * Generate rationale explaining why the three APIs work well together
   */
  generateRationale(apis: APIMetadata[]): string {
    const [api1, api2, api3] = apis;

    // Create synergy explanation
    const synergies = [
      `The combination of ${api1.name} and ${api2.name} creates a natural workflow where ${api1.category} data enhances ${api2.category} functionality.`,
      `Adding ${api3.name} to the mix provides ${api3.category} context that makes both ${api1.category} and ${api2.category} features more valuable.`,
      `These three APIs complement each other because users who need ${api1.category} services often benefit from ${api2.category} and ${api3.category} capabilities.`,
      `The synergy between ${api1.category}, ${api2.category}, and ${api3.category} creates opportunities for innovative features that wouldn't be possible with any single API.`,
    ];

    // Combine 2-3 synergy statements
    const statementCount = 2 + (apis[1].id.length % 2);
    return synergies.slice(0, statementCount).join(' ');
  }
}
