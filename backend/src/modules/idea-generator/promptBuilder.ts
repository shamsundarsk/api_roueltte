/**
 * LLM Prompt Engine
 * Builds structured prompts for the LLM
 */

/**
 * Build a prompt for hackathon project idea generation
 * @param apis Array of API names to combine
 * @returns Structured prompt string
 */
export function buildIdeaPrompt(apis: string[]): string {
  const apiList = apis.map((api, idx) => `${idx + 1}. ${api}`).join('\n');

  return `You are a creative hackathon mentor helping students build innovative projects.

Combine these APIs into ONE cohesive hackathon project:
${apiList}

Generate a structured project idea with:

**Project Name:** [Creative, catchy name]

**One-Line Pitch:** [Compelling 1-sentence description]

**Key Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Feature 4]

**Why Students Should Build This:**
[2-3 sentences explaining the learning value and impact]

**Tech Stack Suggestion:**
[Brief mention of recommended technologies]

Keep it practical, exciting, and achievable in 24-48 hours.`;
}
