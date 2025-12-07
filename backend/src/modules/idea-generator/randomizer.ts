/**
 * API Randomizer Component
 * Selects random APIs from the list
 */

import { API_LIST } from './apiList';

/**
 * Get random APIs from the list
 * @param count Number of APIs to select (default: 3)
 * @returns Array of randomly selected API names
 */
export function getRandomAPIs(count: number = 3): string[] {
  const shuffled = [...API_LIST].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, API_LIST.length));
}
