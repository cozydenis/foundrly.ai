const OpenAI = require('openai');

class LLMSynthesis {
  constructor() {
    this.client = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    this.model = 'gpt-4o-mini';
    this.maxTokens = 1500;
    this.temperature = 0.3;
  }

  async extractIdeaComponents(description) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildExtractionPrompt(description);
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert startup analyst. Extract key components from startup ideas with precision and clarity. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 800
      });

      return this.parseExtractionResponse(response.choices[0].message.content);
    } catch (error) {
      throw new Error(`Failed to extract idea components: ${error.message}`);
    }
  }

  async extractKeywords(ideaComponents) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const { problem, solution, market } = ideaComponents;
    const combinedText = `${problem || ''} ${solution || ''} ${market || ''}`.trim();

    const prompt = `
Extract 3-5 relevant keywords for market research from this startup idea:

"${combinedText}"

Focus on:
- Industry/market keywords
- Problem domain keywords  
- Technology/solution keywords
- Target audience keywords

Return a JSON array of strings: ["keyword1", "keyword2", "keyword3"]

Important: Return only the JSON array, no additional text.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system", 
            content: "You are an expert at identifying relevant market research keywords. Always return valid JSON arrays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 200
      });

      return this.parseKeywordResponse(response.choices[0].message.content);
    } catch (error) {
      throw new Error(`Failed to extract keywords: ${error.message}`);
    }
  }

  async synthesizeValidationResults(validationData) {
    if (!this.isConfigured()) {
      return this.generateFallbackSynthesis(validationData);
    }

    const prompt = this.buildSynthesisPrompt(validationData);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a senior startup advisor. Provide concise, actionable insights based on validation data. Be direct and specific in recommendations."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return this.parseSynthesisResponse(response.choices[0].message.content);
    } catch (error) {
      console.warn('LLM synthesis failed, using fallback:', error.message);
      return this.generateFallbackSynthesis(validationData);
    }
  }

  async generateImprovementSuggestions(validationData, focusAreas = []) {
    if (!this.isConfigured()) {
      return this.generateFallbackSuggestions(validationData);
    }

    const prompt = this.buildImprovementPrompt(validationData, focusAreas);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a startup mentor. Provide specific, actionable improvement suggestions based on validation results. Focus on concrete next steps."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      });

      return this.parseImprovementResponse(response.choices[0].message.content);
    } catch (error) {
      console.warn('Improvement suggestions failed, using fallback:', error.message);
      return this.generateFallbackSuggestions(validationData);
    }
  }

  buildExtractionPrompt(description) {
    return `
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
  }

  buildSynthesisPrompt(validationData) {
    const { scores, trendsAnalysis, competitorAnalysis, marketData } = validationData;
    
    return `
Analyze this startup validation data and provide strategic insights:

SCORES:
- Problem Clarity: ${scores.problemClarity}/10
- Market Potential: ${scores.marketPotential}/10  
- Feasibility: ${scores.feasibility}/10
- Technical Complexity: ${scores.technicalComplexity}/10 (higher = simpler)
- Monetization: ${scores.monetizationViability}/10
- Time to Market: ${scores.timeToMarket}/10 (higher = faster)
- Competition: ${scores.competition}/10 (higher = less competitive)
- Overall: ${scores.overall}/10

${trendsAnalysis ? `MARKET TRENDS: ${trendsAnalysis.trendsData?.avgInterest || 0} avg search interest, ${trendsAnalysis.trendsData?.trends?.length || 0} keywords analyzed` : ''}

${competitorAnalysis ? `COMPETITION: ${competitorAnalysis.totalCount} competitors found` : ''}

Provide a concise strategic assessment covering:
1. Key strengths (2-3 points)
2. Major concerns (2-3 points)  
3. Strategic recommendations (3-4 points)
4. Next steps (2-3 specific actions)

Be specific and actionable. Focus on the most impactful insights.
`;
  }

  buildImprovementPrompt(validationData, focusAreas) {
    const { scores, feedback } = validationData;
    const lowScores = Object.entries(scores)
      .filter(([key, score]) => key !== 'overall' && score < 6)
      .map(([key, score]) => `${key}: ${score}/10`);

    return `
Based on this startup validation data, provide specific improvement suggestions:

LOW-SCORING AREAS:
${lowScores.length > 0 ? lowScores.join('\n') : 'None - all scores above 6/10'}

${focusAreas.length > 0 ? `FOCUS AREAS: ${focusAreas.join(', ')}` : ''}

CURRENT FEEDBACK:
${JSON.stringify(feedback.detailed, null, 2)}

For each low-scoring area, provide:
1. Specific actions to improve the score
2. Resources or research needed
3. Timeline estimate for improvements
4. Success metrics to track

Format as actionable recommendations with clear next steps.
`;
  }

  parseExtractionResponse(content) {
    const cleanedContent = this.cleanJsonResponse(content);
    
    try {
      const parsed = JSON.parse(cleanedContent);
      
      // Validate required fields
      const requiredFields = ['problem', 'solution', 'market', 'competition', 'team'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          parsed[field] = 'Not specified';
        }
      }
      
      return parsed;
    } catch (parseError) {
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  parseKeywordResponse(content) {
    const cleanedContent = this.cleanJsonResponse(content);
    
    try {
      const keywords = JSON.parse(cleanedContent);
      
      if (!Array.isArray(keywords)) {
        throw new Error('Expected array of keywords');
      }
      
      return keywords
        .filter(k => typeof k === 'string' && k.trim().length > 0)
        .slice(0, 5); // Limit to 5 keywords
    } catch (parseError) {
      throw new Error('Invalid keywords response format');
    }
  }

  parseSynthesisResponse(content) {
    // For now, return raw content - could be enhanced to parse structured format
    return {
      insights: content,
      timestamp: Date.now(),
      source: 'llm_synthesis'
    };
  }

  parseImprovementResponse(content) {
    return {
      suggestions: content,
      timestamp: Date.now(),
      source: 'llm_analysis'
    };
  }

  cleanJsonResponse(content) {
    let cleaned = content.trim();
    
    // Remove code block markers
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    return cleaned;
  }

  generateFallbackSynthesis(validationData) {
    const { scores } = validationData;
    const strengths = [];
    const concerns = [];
    const recommendations = [];

    // Analyze scores for insights
    Object.entries(scores).forEach(([key, score]) => {
      if (key === 'overall') return;
      
      if (score >= 8) {
        strengths.push(`Strong ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      } else if (score <= 4) {
        concerns.push(`${key.replace(/([A-Z])/g, ' $1')} needs improvement`);
        recommendations.push(`Focus on improving ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    });

    if (strengths.length === 0) strengths.push('Balanced overall approach');
    if (concerns.length === 0) concerns.push('No major red flags identified');
    if (recommendations.length === 0) recommendations.push('Continue with current approach');

    const insights = `
STRATEGIC ASSESSMENT

Key Strengths:
${strengths.map(s => `• ${s}`).join('\n')}

Areas of Concern:
${concerns.map(c => `• ${c}`).join('\n')}

Recommendations:
${recommendations.map(r => `• ${r}`).join('\n')}

Next Steps:
• Validate assumptions with target customers
• Develop minimum viable product
• Test market demand
`;

    return {
      insights,
      timestamp: Date.now(),
      source: 'fallback_analysis'
    };
  }

  generateFallbackSuggestions(validationData) {
    const { scores } = validationData;
    const suggestions = [];

    Object.entries(scores).forEach(([key, score]) => {
      if (key === 'overall' || score >= 6) return;
      
      const area = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      suggestions.push(`Improve ${area} by conducting additional research and validation`);
    });

    if (suggestions.length === 0) {
      suggestions.push('All areas scoring well - focus on execution and market testing');
    }

    return {
      suggestions: suggestions.join('\n\n'),
      timestamp: Date.now(),
      source: 'fallback_suggestions'
    };
  }

  isConfigured() {
    return !!this.client;
  }

  async healthCheck() {
    if (!this.isConfigured()) {
      return { status: 'not_configured', message: 'OpenAI API key not set' };
    }

    try {
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      
      return { status: 'healthy', timestamp: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: Date.now() };
    }
  }
}

module.exports = LLMSynthesis;