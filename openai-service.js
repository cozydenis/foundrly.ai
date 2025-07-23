const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else {
      this.client = null;
    }
  }

  async extractIdeaComponents(description) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    const prompt = `
Extract structured information from this startup idea description. Return a JSON object with these exact fields:

{
  "problem": "Clear description of the problem being solved",
  "solution": "The proposed solution or product",
  "market": "Target market and market potential information",
  "competition": "Information about competitors or alternatives",
  "team": "Team information if mentioned, or 'Not specified' if not mentioned"
}

Startup idea description: "${description}"

Important: Return only valid JSON, no additional text or explanation.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing startup ideas and extracting key components. Always return valid JSON with the exact structure requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0].message.content.trim();
      
      // Clean up the response to ensure valid JSON
      let cleanedContent = content;
      if (content.startsWith('```json')) {
        cleanedContent = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (content.startsWith('```')) {
        cleanedContent = content.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      try {
        const parsed = JSON.parse(cleanedContent);
        
        // Validate the required fields
        const requiredFields = ['problem', 'solution', 'market', 'competition', 'team'];
        for (const field of requiredFields) {
          if (!parsed[field]) {
            parsed[field] = 'Not specified';
          }
        }
        
        return parsed;
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', cleanedContent);
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw new Error(`Failed to extract idea components: ${error.message}`);
    }
  }

  async extractKeywords(idea) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    const { problem, solution, market } = idea;
    const combinedText = `${problem || ''} ${solution || ''} ${market || ''}`.trim();

    const prompt = `
Extract 3-5 relevant keywords for Google Trends analysis from this startup idea. Focus on:
- Industry/market keywords
- Problem/solution keywords
- Technology/product keywords

Return a JSON array of strings, like: ["keyword1", "keyword2", "keyword3"]

Startup idea text: "${combinedText}"

Important: Return only valid JSON array, no additional text.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at identifying relevant market keywords for trend analysis. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const content = response.choices[0].message.content.trim();
      
      // Clean up the response
      let cleanedContent = content;
      if (content.startsWith('```json')) {
        cleanedContent = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (content.startsWith('```')) {
        cleanedContent = content.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      try {
        const keywords = JSON.parse(cleanedContent);
        
        if (!Array.isArray(keywords)) {
          throw new Error('Expected array of keywords');
        }
        
        return keywords.filter(k => typeof k === 'string' && k.trim().length > 0);
      } catch (parseError) {
        console.error('Failed to parse keywords response:', cleanedContent);
        throw new Error('Invalid keywords response format from OpenAI');
      }
    } catch (error) {
      console.error('OpenAI keyword extraction error:', error.message);
      throw new Error(`Failed to extract keywords: ${error.message}`);
    }
  }

  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }
}

module.exports = OpenAIService;