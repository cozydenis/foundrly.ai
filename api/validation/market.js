class MarketValidator {
  constructor(trendsService) {
    this.trendsService = trendsService;
  }

  async analyzeMarketPotential(marketData, keywords = []) {
    const textScore = this.scoreMarketFromText(marketData);
    let trendsScore = 0;
    let trendsData = null;

    // Analyze trends if keywords available
    if (keywords.length > 0 && this.trendsService) {
      try {
        trendsData = await this.trendsService.getKeywordTrends(keywords);
        trendsScore = this.trendsService.calculateTrendScore(trendsData);
      } catch (error) {
        console.warn('Trends analysis failed:', error.message);
      }
    }

    const combinedScore = trendsData 
      ? Math.round((textScore + trendsScore) / 2)
      : textScore;

    return {
      score: combinedScore,
      textScore,
      trendsScore,
      trendsData,
      analysis: this.generateMarketAnalysis(textScore, trendsScore, trendsData)
    };
  }

  scoreMarketFromText(market) {
    if (!market || typeof market !== 'string') return 0;
    
    let score = 0;
    const marketLower = market.toLowerCase();
    
    // Market size indicators
    if (marketLower.includes('billion') || marketLower.includes('million')) score += 3;
    if (marketLower.includes('growing') || marketLower.includes('expand')) score += 2;
    
    // Target market clarity
    if (marketLower.includes('target') || marketLower.includes('segment')) score += 2;
    
    // Market research evidence
    if (marketLower.includes('research') || marketLower.includes('study') || 
        marketLower.includes('data')) score += 2;
    
    // Competition analysis
    if (marketLower.includes('competitor') || marketLower.includes('alternative')) score += 1;
    
    return Math.min(score, 10);
  }

  generateMarketAnalysis(textScore, trendsScore, trendsData) {
    const analysis = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };

    // Text-based analysis
    if (textScore >= 7) {
      analysis.strengths.push('Strong market description with clear size indicators');
    } else if (textScore < 4) {
      analysis.weaknesses.push('Market description lacks quantifiable data');
      analysis.recommendations.push('Add specific market size metrics and growth rates');
    }

    // Trends-based analysis
    if (trendsData) {
      const risingKeywords = trendsData.trends?.filter(t => t.trend === 'rising') || [];
      const decliningKeywords = trendsData.trends?.filter(t => t.trend === 'declining') || [];
      
      if (risingKeywords.length > 0) {
        analysis.strengths.push(`Growing market interest in: ${risingKeywords.map(k => k.keyword).join(', ')}`);
      }
      
      if (decliningKeywords.length > 0) {
        analysis.weaknesses.push(`Declining interest in: ${decliningKeywords.map(k => k.keyword).join(', ')}`);
      }
      
      if (trendsData.avgInterest < 20) {
        analysis.recommendations.push('Consider market education strategy due to low search volume');
      }
    }

    return analysis;
  }

  calculateMarketScore(marketText, trendsData) {
    const textScore = this.scoreMarketFromText(marketText);
    
    if (!trendsData) return textScore;
    
    const trendsScore = this.trendsService?.calculateTrendScore(trendsData) || 0;
    return Math.round((textScore + trendsScore) / 2);
  }
}

module.exports = MarketValidator;