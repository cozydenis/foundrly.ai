class CompetitionValidator {
  constructor(competitorService) {
    this.competitorService = competitorService;
  }

  async analyzeCompetition(competitionText, keywords = []) {
    const textScore = this.scoreCompetitionFromText(competitionText);
    let webResearchData = null;
    let webScore = null;

    // Perform web research if competitor service available and keywords provided
    if (this.competitorService && keywords.length > 0) {
      try {
        webResearchData = await this.competitorService.findCompetitors(keywords);
        webScore = this.competitorService.calculateCompetitionScore(webResearchData.totalCount);
      } catch (error) {
        console.warn('Competitor web research failed:', error.message);
      }
    }

    // Use web research score if available, otherwise fall back to text score
    const finalScore = webScore !== null ? webScore : textScore;

    return {
      score: finalScore,
      textAnalysis: {
        score: textScore,
        insights: this.generateTextInsights(competitionText)
      },
      webResearch: webResearchData ? {
        score: webScore,
        totalCompetitors: webResearchData.totalCount,
        competitors: webResearchData.competitors,
        analysis: this.generateWebResearchAnalysis(webResearchData)
      } : null,
      combinedAnalysis: this.generateCombinedAnalysis(textScore, webResearchData, competitionText)
    };
  }

  scoreCompetitionFromText(competition) {
    if (!competition || typeof competition !== 'string') return 5; // Neutral score
    
    const competitionLower = competition.toLowerCase();
    let score = 5; // Start neutral
    
    // Positive indicators (low competition = higher score)
    const lowCompetitionTerms = ['few', 'limited', 'no', 'minimal', 'niche', 'underserved', 'blue ocean'];
    lowCompetitionTerms.forEach(term => {
      if (competitionLower.includes(term)) score += 2;
    });
    
    // Negative indicators (high competition = lower score)
    const highCompetitionTerms = ['many', 'numerous', 'crowded', 'saturated', 'competitive', 'established', 'dominated'];
    highCompetitionTerms.forEach(term => {
      if (competitionLower.includes(term)) score -= 2;
    });
    
    // Competitive advantage indicators
    if (competitionLower.includes('advantage') || competitionLower.includes('unique') || 
        competitionLower.includes('differentiate') || competitionLower.includes('superior')) {
      score += 1;
    }
    
    // Market leader mentions
    if (competitionLower.includes('leader') || competitionLower.includes('dominant') || 
        competitionLower.includes('monopoly')) {
      score -= 1;
    }
    
    return Math.max(1, Math.min(10, score));
  }

  generateTextInsights(competitionText) {
    if (!competitionText) {
      return {
        level: 'unknown',
        indicators: [],
        recommendations: ['Conduct thorough competitive analysis']
      };
    }

    const text = competitionText.toLowerCase();
    const insights = {
      level: 'moderate',
      indicators: [],
      recommendations: []
    };

    // Determine competition level
    if (text.includes('few') || text.includes('limited') || text.includes('niche')) {
      insights.level = 'low';
      insights.indicators.push('Limited competition mentioned');
      insights.recommendations.push('Validate market demand despite low competition');
    } else if (text.includes('many') || text.includes('crowded') || text.includes('saturated')) {
      insights.level = 'high';
      insights.indicators.push('Crowded market indicated');
      insights.recommendations.push('Focus on strong differentiation strategy');
    }

    // Look for competitive advantages
    if (text.includes('advantage') || text.includes('unique')) {
      insights.indicators.push('Competitive advantages identified');
    } else {
      insights.recommendations.push('Define clear competitive advantages');
    }

    return insights;
  }

  generateWebResearchAnalysis(webResearchData) {
    const { totalCount, competitors } = webResearchData;
    
    const analysis = {
      competitiveLevel: this.categorizeCompetitionLevel(totalCount),
      keyInsights: [],
      recommendations: []
    };

    // Categorize competition level
    if (totalCount === 0) {
      analysis.keyInsights.push('No direct competitors found - potential blue ocean or very niche market');
      analysis.recommendations.push('Validate market demand and consider pivot if market too small');
    } else if (totalCount <= 3) {
      analysis.keyInsights.push(`Limited competition with ${totalCount} identified competitors`);
      analysis.recommendations.push('Move quickly to establish market presence');
    } else if (totalCount <= 8) {
      analysis.keyInsights.push(`Moderate competition in the space`);
      analysis.recommendations.push('Focus on differentiation and unique value proposition');
    } else {
      analysis.keyInsights.push(`Highly competitive market with ${totalCount}+ players`);
      analysis.recommendations.push('Consider niche positioning or significant innovation');
    }

    // Analyze competitor quality/relevance
    if (competitors && competitors.length > 0) {
      const topCompetitors = competitors.slice(0, 3);
      analysis.keyInsights.push(`Top competitors: ${topCompetitors.map(c => c.domain).join(', ')}`);
      
      const highRelevanceCount = competitors.filter(c => c.relevanceScore > 3).length;
      if (highRelevanceCount > competitors.length * 0.7) {
        analysis.keyInsights.push('High relevance competitors found - direct competition likely');
      }
    }

    return analysis;
  }

  generateCombinedAnalysis(textScore, webResearchData, competitionText) {
    const analysis = {
      confidence: 'medium',
      overallAssessment: '',
      strategicRecommendations: []
    };

    // Determine confidence level
    if (webResearchData && competitionText) {
      analysis.confidence = 'high';
      analysis.overallAssessment = 'Analysis based on both stated competition and web research';
    } else if (webResearchData) {
      analysis.confidence = 'medium';
      analysis.overallAssessment = 'Analysis based primarily on web research findings';
    } else if (competitionText) {
      analysis.confidence = 'low';
      analysis.overallAssessment = 'Analysis based only on provided competition description';
    } else {
      analysis.confidence = 'very low';
      analysis.overallAssessment = 'Limited competition analysis due to insufficient data';
    }

    // Strategic recommendations based on competitive landscape
    if (webResearchData) {
      const competitorCount = webResearchData.totalCount;
      
      if (competitorCount === 0) {
        analysis.strategicRecommendations.push('First-mover advantage opportunity - validate market quickly');
        analysis.strategicRecommendations.push('Consider why no competitors exist - market size or technical barriers?');
      } else if (competitorCount <= 3) {
        analysis.strategicRecommendations.push('Early market with room for growth - establish strong brand');
        analysis.strategicRecommendations.push('Study existing competitors to understand market needs');
      } else if (competitorCount <= 8) {
        analysis.strategicRecommendations.push('Differentiate through unique features or superior execution');
        analysis.strategicRecommendations.push('Consider partnerships or acquisition opportunities');
      } else {
        analysis.strategicRecommendations.push('Highly competitive - focus on niche market segment');
        analysis.strategicRecommendations.push('Significant innovation or cost advantage required');
      }
    }

    return analysis;
  }

  categorizeCompetitionLevel(count) {
    if (count === 0) return 'none';
    if (count <= 3) return 'low';
    if (count <= 8) return 'moderate';
    return 'high';
  }

  // Utility method for getting competition score
  getCompetitionScore(competitionText, webResearchData = null) {
    if (webResearchData) {
      return this.competitorService.calculateCompetitionScore(webResearchData.totalCount);
    }
    return this.scoreCompetitionFromText(competitionText);
  }
}

module.exports = CompetitionValidator;