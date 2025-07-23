const OpenAIService = require('./openai-service');
const TrendsService = require('./trends-service');
const CompetitorService = require('./competitor-service');

class StartupIdeaValidator {
  constructor() {
    this.openaiService = new OpenAIService();
    this.trendsService = new TrendsService();
    this.competitorService = new CompetitorService();
  }

  async validateIdea(input) {
    let idea;
    
    // Check if input is plain text or structured data
    if (typeof input === 'string') {
      // Plain text description - extract components using OpenAI
      idea = await this.openaiService.extractIdeaComponents(input);
      idea.extractedFromText = true;
    } else if (input && typeof input === 'object') {
      // Structured data - use as is
      idea = input;
      idea.extractedFromText = false;
    } else {
      throw new Error('Invalid input: must be a string or object');
    }
    const { problem, solution, market, competition, team } = idea;
    
    const problemScore = this.scoreProblemClarity(problem);
    
    // Enhanced market scoring with trends and competitor data
    let marketScore = this.scoreMarketPotential(market);
    let trendsData = null;
    let competitorData = null;
    let keywords = [];
    
    if (this.openaiService.isConfigured()) {
      try {
        keywords = await this.openaiService.extractKeywords(idea);
        
        // Run trends and competitor analysis in parallel
        const [trendsResult, competitorResult] = await Promise.allSettled([
          this.trendsService.getKeywordTrends(keywords),
          this.competitorService.findCompetitors(keywords)
        ]);
        
        if (trendsResult.status === 'fulfilled') {
          trendsData = trendsResult.value;
          const trendsScore = this.trendsService.calculateTrendScore(trendsData);
          marketScore = Math.round((marketScore + trendsScore) / 2);
        }
        
        if (competitorResult.status === 'fulfilled') {
          competitorData = competitorResult.value;
        }
      } catch (error) {
        console.warn('Market analysis failed:', error.message);
        // Continue with original market score
      }
    }
    
    const feasibilityScore = this.scoreFeasibility(solution, team, competition);
    const technicalComplexityScore = this.scoreTechnicalComplexity(solution, idea);
    const monetizationScore = this.scoreMonetizationViability(solution, market, idea);
    const timeToMarketScore = this.scoreTimeToMarket(solution, team, idea);
    const competitionScore = competitorData ? this.competitorService.calculateCompetitionScore(competitorData.totalCount) : this.scoreCompetitionFromText(competition);
    
    const overallScore = (problemScore + marketScore + feasibilityScore + technicalComplexityScore + monetizationScore + timeToMarketScore + competitionScore) / 7;
    
    return {
      scores: {
        problemClarity: problemScore,
        marketPotential: marketScore,
        feasibility: feasibilityScore,
        technicalComplexity: technicalComplexityScore,
        monetizationViability: monetizationScore,
        timeToMarket: timeToMarketScore,
        competition: competitionScore,
        overall: Math.round(overallScore * 100) / 100
      },
      rating: this.getRating(overallScore),
      feedback: this.generateFeedback(problemScore, marketScore, feasibilityScore, technicalComplexityScore, monetizationScore, timeToMarketScore, competitionScore, trendsData, competitorData),
      extractedFromText: idea.extractedFromText,
      extractedComponents: idea.extractedFromText ? {
        problem: idea.problem,
        solution: idea.solution,
        market: idea.market,
        competition: idea.competition,
        team: idea.team
      } : undefined,
      trendsAnalysis: trendsData ? {
        keywords,
        trendsData,
        trendsScore: this.trendsService.calculateTrendScore(trendsData)
      } : undefined,
      competitorAnalysis: competitorData ? {
        totalCount: competitorData.totalCount,
        competitors: competitorData.competitors,
        searchKeywords: competitorData.searchKeywords,
        competitionScore
      } : undefined
    };
  }

  scoreProblemClarity(problem) {
    if (!problem || typeof problem !== 'string') return 0;
    
    let score = 0;
    const problemLower = problem.toLowerCase();
    
    // Check for specific problem statement
    if (problem.length > 20) score += 2;
    if (problemLower.includes('problem') || problemLower.includes('issue') || 
        problemLower.includes('challenge') || problemLower.includes('pain')) score += 2;
    
    // Check for target audience mention
    if (problemLower.includes('people') || problemLower.includes('users') || 
        problemLower.includes('customers') || problemLower.includes('businesses')) score += 2;
    
    // Check for quantifiable impact
    if (problemLower.match(/\d+/)) score += 2;
    
    // Check for urgency indicators
    if (problemLower.includes('need') || problemLower.includes('want') || 
        problemLower.includes('require') || problemLower.includes('must')) score += 2;
    
    return Math.min(score, 10);
  }

  scoreMarketPotential(market) {
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

  scoreFeasibility(solution, team, competition) {
    let score = 0;
    
    // Solution feasibility
    if (solution && typeof solution === 'string') {
      const solutionLower = solution.toLowerCase();
      if (solution.length > 30) score += 2;
      if (solutionLower.includes('technology') || solutionLower.includes('app') || 
          solutionLower.includes('platform') || solutionLower.includes('service')) score += 1;
      if (solutionLower.includes('simple') || solutionLower.includes('easy')) score += 1;
    }
    
    // Team strength
    if (team && typeof team === 'string') {
      const teamLower = team.toLowerCase();
      if (teamLower.includes('experience') || teamLower.includes('expert')) score += 2;
      if (teamLower.includes('developer') || teamLower.includes('engineer') || 
          teamLower.includes('technical')) score += 1;
      if (teamLower.includes('business') || teamLower.includes('marketing')) score += 1;
    }
    
    // Competition analysis
    if (competition && typeof competition === 'string') {
      const competitionLower = competition.toLowerCase();
      if (competitionLower.includes('few') || competitionLower.includes('limited') || 
          competitionLower.includes('niche')) score += 2;
      if (competitionLower.includes('advantage') || competitionLower.includes('unique')) score += 1;
    }
    
    return Math.min(score, 10);
  }

  scoreTechnicalComplexity(solution, idea) {
    if (!solution || typeof solution !== 'string') return 5; // Neutral score for missing data
    
    let score = 10; // Start high, reduce for complexity indicators
    const solutionLower = solution.toLowerCase();
    const fullText = `${solution} ${idea.problem || ''} ${idea.market || ''}`.toLowerCase();
    
    // High complexity indicators (reduce score)
    const highComplexityTerms = ['ai', 'machine learning', 'blockchain', 'quantum', 'neural network', 'deep learning', 'computer vision', 'nlp', 'artificial intelligence'];
    const mediumComplexityTerms = ['api', 'database', 'cloud', 'backend', 'frontend', 'algorithm', 'integration', 'automation', 'analytics'];
    const lowComplexityTerms = ['website', 'app', 'mobile', 'web', 'simple', 'basic', 'template', 'wordpress'];
    
    let complexityScore = 0;
    highComplexityTerms.forEach(term => {
      if (fullText.includes(term)) complexityScore += 3;
    });
    mediumComplexityTerms.forEach(term => {
      if (fullText.includes(term)) complexityScore += 2;
    });
    lowComplexityTerms.forEach(term => {
      if (fullText.includes(term)) complexityScore -= 1;
    });
    
    // Multiple technology mentions increase complexity
    const techMentions = (fullText.match(/technology|tech|software|hardware|system|platform/g) || []).length;
    complexityScore += Math.min(techMentions, 3);
    
    // Infrastructure requirements
    if (fullText.includes('scale') || fullText.includes('million') || fullText.includes('enterprise')) {
      complexityScore += 2;
    }
    
    score = Math.max(1, Math.min(10, 10 - Math.floor(complexityScore / 2)));
    return score;
  }

  scoreMonetizationViability(solution, market, idea) {
    if (!solution) return 0;
    
    let score = 0;
    const fullText = `${solution} ${market || ''} ${idea.problem || ''}`.toLowerCase();
    
    // Clear revenue model indicators
    const revenueModels = ['subscription', 'saas', 'commission', 'transaction', 'fee', 'premium', 'freemium', 'advertising', 'marketplace'];
    revenueModels.forEach(model => {
      if (fullText.includes(model)) score += 2;
    });
    
    // Business model clarity
    if (fullText.includes('pay') || fullText.includes('price') || fullText.includes('cost') || fullText.includes('charge')) {
      score += 1;
    }
    
    // Market size indicators for monetization potential
    if (fullText.includes('billion') || fullText.includes('million')) score += 2;
    if (fullText.includes('enterprise') || fullText.includes('business')) score += 1;
    
    // Recurring revenue potential
    if (fullText.includes('recurring') || fullText.includes('monthly') || fullText.includes('annual')) {
      score += 2;
    }
    
    // Network effects or scaling potential
    if (fullText.includes('network') || fullText.includes('platform') || fullText.includes('marketplace')) {
      score += 1;
    }
    
    // Value proposition clarity
    if (fullText.includes('save') || fullText.includes('reduce') || fullText.includes('increase') || fullText.includes('improve')) {
      score += 1;
    }
    
    return Math.min(score, 10);
  }

  scoreTimeToMarket(solution, team, idea) {
    if (!solution) return 0;
    
    let score = 5; // Start with neutral
    const solutionLower = solution.toLowerCase();
    const teamLower = (team || '').toLowerCase();
    const fullText = `${solution} ${team || ''} ${idea.problem || ''}`.toLowerCase();
    
    // Quick to market indicators (increase score)
    const quickMarketTerms = ['simple', 'basic', 'minimal', 'mvp', 'prototype', 'existing', 'template', 'no-code', 'low-code'];
    quickMarketTerms.forEach(term => {
      if (fullText.includes(term)) score += 1;
    });
    
    // Slow to market indicators (decrease score)
    const slowMarketTerms = ['complex', 'advanced', 'enterprise', 'custom', 'proprietary', 'research', 'development', 'innovation'];
    slowMarketTerms.forEach(term => {
      if (fullText.includes(term)) score -= 1;
    });
    
    // Team readiness (increase score)
    if (teamLower.includes('experience') || teamLower.includes('expert') || teamLower.includes('developer')) {
      score += 2;
    }
    if (teamLower.includes('team') || teamLower.includes('founded') || teamLower.includes('ready')) {
      score += 1;
    }
    
    // Technology complexity impact
    if (fullText.includes('ai') || fullText.includes('machine learning') || fullText.includes('blockchain')) {
      score -= 2;
    }
    if (fullText.includes('mobile') || fullText.includes('web') || fullText.includes('app')) {
      score += 1;
    }
    
    // Regulatory or compliance requirements
    if (fullText.includes('regulation') || fullText.includes('compliance') || fullText.includes('approval')) {
      score -= 2;
    }
    
    return Math.max(1, Math.min(10, score));
  }

  scoreCompetitionFromText(competition) {
    if (!competition || typeof competition !== 'string') return 5; // Neutral score
    
    const competitionLower = competition.toLowerCase();
    let score = 5; // Start neutral
    
    // Positive indicators (low competition)
    const lowCompetitionTerms = ['few', 'limited', 'no', 'minimal', 'niche', 'underserved'];
    lowCompetitionTerms.forEach(term => {
      if (competitionLower.includes(term)) score += 2;
    });
    
    // Negative indicators (high competition)
    const highCompetitionTerms = ['many', 'numerous', 'crowded', 'saturated', 'competitive', 'established'];
    highCompetitionTerms.forEach(term => {
      if (competitionLower.includes(term)) score -= 2;
    });
    
    // Advantage indicators
    if (competitionLower.includes('advantage') || competitionLower.includes('unique') || competitionLower.includes('differentiate')) {
      score += 1;
    }
    
    return Math.max(1, Math.min(10, score));
  }

  getRating(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    if (score >= 2) return 'Poor';
    return 'Very Poor';
  }

  generateFeedback(problemScore, marketScore, feasibilityScore, technicalComplexityScore, monetizationScore, timeToMarketScore, competitionScore, trendsData, competitorData) {
    const feedback = {
      overall: [],
      detailed: {
        problemClarity: [],
        marketPotential: [],
        feasibility: [],
        technicalComplexity: [],
        monetizationViability: [],
        timeToMarket: [],
        competition: []
      }
    };
    
    // Problem Clarity Feedback
    if (problemScore < 5) {
      feedback.detailed.problemClarity.push('Problem statement needs more clarity and specificity');
      feedback.overall.push('Problem statement requires better definition');
    } else if (problemScore >= 8) {
      feedback.detailed.problemClarity.push('Excellent problem definition with clear target audience and pain points');
    } else {
      feedback.detailed.problemClarity.push('Good problem clarity, consider adding more specific metrics or urgency indicators');
    }
    
    // Market Potential Feedback
    if (marketScore < 5) {
      feedback.detailed.marketPotential.push('Market potential analysis requires more research and quantifiable data');
      feedback.overall.push('Market analysis needs strengthening');
    } else if (marketScore >= 8) {
      feedback.detailed.marketPotential.push('Strong market potential with clear size indicators and growth prospects');
    } else {
      feedback.detailed.marketPotential.push('Decent market potential, consider adding competitive landscape details');
    }
    
    // Feasibility Feedback
    if (feasibilityScore < 5) {
      feedback.detailed.feasibility.push('Feasibility assessment needs more technical and team details');
      feedback.overall.push('Implementation feasibility concerns identified');
    } else if (feasibilityScore >= 8) {
      feedback.detailed.feasibility.push('High feasibility with strong team indicators and clear solution approach');
    } else {
      feedback.detailed.feasibility.push('Moderate feasibility, consider strengthening team composition or solution details');
    }
    
    // Technical Complexity Feedback
    if (technicalComplexityScore < 4) {
      feedback.detailed.technicalComplexity.push('High technical complexity may require significant development resources and expertise');
      feedback.overall.push('Complex technical implementation challenges ahead');
    } else if (technicalComplexityScore >= 7) {
      feedback.detailed.technicalComplexity.push('Low to moderate technical complexity enables faster development and lower risk');
    } else {
      feedback.detailed.technicalComplexity.push('Moderate technical complexity requires careful planning and skilled team');
    }
    
    // Monetization Viability Feedback
    if (monetizationScore < 4) {
      feedback.detailed.monetizationViability.push('Monetization model unclear - define specific revenue streams and pricing strategy');
      feedback.overall.push('Revenue model needs clarification');
    } else if (monetizationScore >= 7) {
      feedback.detailed.monetizationViability.push('Strong monetization potential with clear revenue models identified');
    } else {
      feedback.detailed.monetizationViability.push('Basic monetization approach present, consider diversifying revenue streams');
    }
    
    // Time to Market Feedback
    if (timeToMarketScore < 4) {
      feedback.detailed.timeToMarket.push('Extended development timeline expected due to complexity or resource requirements');
      feedback.overall.push('Long development cycle may impact market entry');
    } else if (timeToMarketScore >= 7) {
      feedback.detailed.timeToMarket.push('Fast time to market potential enables quick validation and iteration');
    } else {
      feedback.detailed.timeToMarket.push('Moderate development timeline - plan for 6-12 month MVP development');
    }
    
    // Competition Feedback
    if (competitorData) {
      const competitorCount = competitorData.totalCount;
      if (competitorCount === 0) {
        feedback.detailed.competition.push('No direct competitors found - potential blue ocean opportunity or very niche market');
        feedback.overall.push('Limited competition detected');
      } else if (competitorCount <= 3) {
        feedback.detailed.competition.push(`Low competition detected with ${competitorCount} potential competitors identified`);
        feedback.overall.push('Favorable competitive landscape');
      } else if (competitorCount <= 8) {
        feedback.detailed.competition.push(`Moderate competition with ${competitorCount} competitors - focus on differentiation`);
      } else {
        feedback.detailed.competition.push(`High competition with ${competitorCount}+ competitors - strong differentiation required`);
        feedback.overall.push('Highly competitive market identified');
      }
      
      // Highlight top competitors
      const topCompetitors = competitorData.competitors.slice(0, 3);
      if (topCompetitors.length > 0) {
        const competitorNames = topCompetitors.map(c => c.domain).join(', ');
        feedback.detailed.competition.push(`Key competitors identified: ${competitorNames}`);
      }
    } else {
      if (competitionScore < 4) {
        feedback.detailed.competition.push('High competition indicated - conduct thorough competitive analysis');
        feedback.overall.push('Competitive pressure concerns');
      } else if (competitionScore >= 7) {
        feedback.detailed.competition.push('Low competition environment favorable for market entry');
      } else {
        feedback.detailed.competition.push('Moderate competition level - differentiation strategy needed');
      }
    }
    
    // Add trends-based feedback
    if (trendsData) {
      const risingKeywords = trendsData.trends.filter(t => t.trend === 'rising');
      const decliningKeywords = trendsData.trends.filter(t => t.trend === 'declining');
      
      if (risingKeywords.length > 0) {
        feedback.detailed.marketPotential.push(`Positive market trends detected for: ${risingKeywords.map(k => k.keyword).join(', ')}`);
        feedback.overall.push('Market trends are favorable');
      }
      if (decliningKeywords.length > 0) {
        feedback.detailed.marketPotential.push(`Declining interest observed for: ${decliningKeywords.map(k => k.keyword).join(', ')}`);
        feedback.overall.push('Some market segments showing decline');
      }
      if (trendsData.avgInterest < 20) {
        feedback.detailed.marketPotential.push('Low search volume detected - consider market education or niche positioning');
      }
    }
    
    // Overall summary feedback
    const avgScore = (problemScore + marketScore + feasibilityScore + technicalComplexityScore + monetizationScore + timeToMarketScore + competitionScore) / 7;
    
    if (avgScore >= 8) {
      feedback.overall.unshift('Excellent startup idea with strong fundamentals across all dimensions');
    } else if (avgScore >= 6) {
      feedback.overall.unshift('Good startup concept with solid foundation and clear opportunities');
    } else if (avgScore >= 4) {
      feedback.overall.unshift('Average startup idea requiring focused improvements in key areas');
    } else {
      feedback.overall.unshift('Startup concept needs significant development before pursuing');
    }
    
    return feedback;
  }
}

module.exports = StartupIdeaValidator;