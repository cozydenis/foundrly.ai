const MarketValidator = require('../../api/validation/market');
const FeasibilityValidator = require('../../api/validation/feasibility');
const CompetitionValidator = require('../../api/validation/competition');
const TrendsIntegration = require('../../api/integrations/trends');
const RedditIntegration = require('../../api/integrations/reddit');
const CrunchbaseIntegration = require('../../api/integrations/crunchbase');
const LLMSynthesis = require('../../api/llm/synthesis');

class ValidationEngine {
  constructor() {
    // Initialize integrations
    this.trendsIntegration = new TrendsIntegration();
    this.redditIntegration = new RedditIntegration();
    this.crunchbaseIntegration = new CrunchbaseIntegration();
    this.llmSynthesis = new LLMSynthesis();

    // Initialize validators with their dependencies
    this.marketValidator = new MarketValidator(this.trendsIntegration);
    this.feasibilityValidator = new FeasibilityValidator();
    this.competitionValidator = new CompetitionValidator(null); // Will set competitor service separately
    
    // Configuration
    this.enabledIntegrations = {
      trends: true,
      reddit: false, // Disabled by default for now
      crunchbase: false, // Requires API key
      llmSynthesis: true
    };
  }

  async validateIdea(input) {
    try {
      // Step 1: Parse and extract idea components
      const ideaComponents = await this.extractIdeaComponents(input);
      
      // Step 2: Extract keywords for market research
      let keywords;
      try {
        keywords = this.enabledIntegrations.llmSynthesis && this.llmSynthesis.isConfigured() 
          ? await this.llmSynthesis.extractKeywords(ideaComponents)
          : this.extractBasicKeywords(ideaComponents);
      } catch (error) {
        console.warn('LLM keyword extraction failed, using fallback:', error.message);
        keywords = this.extractBasicKeywords(ideaComponents);
      }
      
      // Step 3: Run all validations in parallel
      const validationResults = await this.runParallelValidations(ideaComponents, keywords);
      
      // Step 4: Calculate scores
      const scores = this.calculateAllScores(ideaComponents, validationResults);
      
      // Step 5: Generate comprehensive feedback
      const feedback = await this.generateComprehensiveFeedback(scores, validationResults, ideaComponents);
      
      // Step 6: Compile final result
      return this.compileValidationResult(ideaComponents, scores, feedback, validationResults, keywords);
      
    } catch (error) {
      console.error('Validation engine error:', error);
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  async extractIdeaComponents(input) {
    if (typeof input === 'string') {
      // Plain text description - use LLM to extract components
      if (this.enabledIntegrations.llmSynthesis && this.llmSynthesis.isConfigured()) {
        try {
          const extracted = await this.llmSynthesis.extractIdeaComponents(input);
          return { ...extracted, extractedFromText: true, originalDescription: input };
        } catch (error) {
          console.warn('LLM component extraction failed, using fallback:', error.message);
          // Fall through to basic extraction
        }
      }
      
      // Fallback basic extraction
      return this.extractBasicComponents(input);
    } else if (input && typeof input === 'object') {
      // Structured data
      return {
        problem: input.problem || '',
        solution: input.solution || '',
        market: input.market || '',
        competition: input.competition || '',
        team: input.team || '',
        extractedFromText: false
      };
    } else {
      throw new Error('Invalid input: must be a string or object');
    }
  }

  extractBasicComponents(input) {
    // Basic component extraction from plain text
    const text = input.toLowerCase();
    
    // Try to identify problem indicators
    let problem = 'Not specified';
    const problemIndicators = ['problem', 'issue', 'challenge', 'struggle', 'difficulty', 'pain'];
    for (const indicator of problemIndicators) {
      const index = text.indexOf(indicator);
      if (index !== -1) {
        // Extract sentence containing the problem indicator
        const sentences = input.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(indicator)) {
            problem = sentence.trim();
            break;
          }
        }
        break;
      }
    }
    
    // Try to identify solution indicators
    let solution = input.substring(0, 200); // Default to first 200 chars
    const solutionIndicators = ['solution', 'app', 'platform', 'build', 'create', 'develop'];
    for (const indicator of solutionIndicators) {
      const index = text.indexOf(indicator);
      if (index !== -1) {
        const sentences = input.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(indicator)) {
            solution = sentence.trim();
            break;
          }
        }
        break;
      }
    }
    
    return {
      problem,
      solution,
      market: 'Not specified',
      competition: 'Not specified', 
      team: 'Not specified',
      extractedFromText: true,
      originalDescription: input
    };
  }

  extractBasicKeywords(ideaComponents) {
    // Fallback keyword extraction without LLM
    const text = `${ideaComponents.problem || ''} ${ideaComponents.solution || ''} ${ideaComponents.market || ''}`;
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common words and take unique ones
    const stopWords = ['that', 'this', 'with', 'from', 'they', 'have', 'been', 'their', 'said', 'each', 'which', 'will', 'would', 'could', 'should'];
    const keywords = [...new Set(words)]
      .filter(word => !stopWords.includes(word))
      .slice(0, 5);
    
    return keywords;
  }

  async runParallelValidations(ideaComponents, keywords) {
    const validationPromises = [];

    // Market analysis
    if (this.enabledIntegrations.trends) {
      validationPromises.push(
        this.marketValidator.analyzeMarketPotential(ideaComponents.market, keywords)
          .then(result => ({ type: 'market', data: result }))
          .catch(error => ({ type: 'market', error: error.message }))
      );
    }

    // Feasibility analysis
    validationPromises.push(
      Promise.resolve(this.feasibilityValidator.analyzeFeasibility(
        ideaComponents.solution, 
        ideaComponents.team, 
        ideaComponents.competition
      )).then(result => ({ type: 'feasibility', data: result }))
    );

    // Competition analysis  
    validationPromises.push(
      this.competitionValidator.analyzeCompetition(ideaComponents.competition, keywords)
        .then(result => ({ type: 'competition', data: result }))
        .catch(error => ({ type: 'competition', error: error.message }))
    );

    // Reddit sentiment analysis (if enabled)
    if (this.enabledIntegrations.reddit) {
      validationPromises.push(
        this.redditIntegration.analyzeSentiment(keywords)
          .then(result => ({ type: 'reddit', data: result }))
          .catch(error => ({ type: 'reddit', error: error.message }))
      );
    }

    // Crunchbase market data (if enabled and configured)
    if (this.enabledIntegrations.crunchbase && this.crunchbaseIntegration.isConfigured()) {
      const industry = this.inferIndustry(ideaComponents);
      validationPromises.push(
        this.crunchbaseIntegration.analyzeMarketData(keywords, industry)
          .then(result => ({ type: 'crunchbase', data: result }))
          .catch(error => ({ type: 'crunchbase', error: error.message }))
      );
    }

    const results = await Promise.allSettled(validationPromises);
    
    // Process results
    const validationResults = {};
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.data) {
        validationResults[result.value.type] = result.value.data;
      } else if (result.status === 'fulfilled' && result.value.error) {
        console.warn(`${result.value.type} validation failed:`, result.value.error);
      }
    });

    return validationResults;
  }

  calculateAllScores(ideaComponents, validationResults) {
    const scores = {};
    
    // Problem clarity
    scores.problemClarity = this.scoreProblemClarity(ideaComponents.problem);
    
    // Market potential (enhanced with validation results)
    scores.marketPotential = validationResults.market 
      ? validationResults.market.score 
      : this.marketValidator.scoreMarketFromText(ideaComponents.market);
    
    // Feasibility scores
    if (validationResults.feasibility) {
      scores.feasibility = validationResults.feasibility.implementation.score;
      scores.technicalComplexity = validationResults.feasibility.technicalComplexity.score;
      scores.timeToMarket = validationResults.feasibility.timeToMarket.score;
    } else {
      // Fallback basic scoring
      scores.feasibility = this.scoreFeasibility(ideaComponents.solution, ideaComponents.team, ideaComponents.competition);
      scores.technicalComplexity = this.scoreTechnicalComplexity(ideaComponents.solution);
      scores.timeToMarket = this.scoreTimeToMarket(ideaComponents.solution, ideaComponents.team);
    }
    
    // Competition score
    scores.competition = validationResults.competition 
      ? validationResults.competition.score 
      : this.competitionValidator.scoreCompetitionFromText(ideaComponents.competition);
    
    // Monetization viability
    scores.monetizationViability = this.scoreMonetization(ideaComponents.solution, ideaComponents.market);
    
    // Calculate overall score
    const allScores = Object.values(scores);
    scores.overall = Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 100) / 100;
    
    return scores;
  }

  scoreProblemClarity(problem) {
    if (!problem || typeof problem !== 'string') return 0;
    
    let score = 0;
    const problemLower = problem.toLowerCase();
    
    if (problem.length > 20) score += 2;
    if (problemLower.includes('problem') || problemLower.includes('issue') || 
        problemLower.includes('challenge') || problemLower.includes('pain')) score += 2;
    if (problemLower.includes('people') || problemLower.includes('users') || 
        problemLower.includes('customers') || problemLower.includes('businesses')) score += 2;
    if (problemLower.match(/\d+/)) score += 2;
    if (problemLower.includes('need') || problemLower.includes('want') || 
        problemLower.includes('require') || problemLower.includes('must')) score += 2;
    
    return Math.min(score, 10);
  }

  scoreFeasibility(solution, team, competition) {
    // Enhanced feasibility scoring for B2B SaaS and developer tools
    let score = 5; // Start with baseline
    
    if (solution && typeof solution === 'string') {
      const solutionLower = solution.toLowerCase();
      const isB2B = this.detectB2BProduct(solutionLower);
      const isPlatform = this.detectPlatformBusiness(solutionLower);
      const isAIPowered = this.detectAIPoweredSolution(solutionLower);
      
      // Detail and specificity
      if (solution.length > 50) score += 2;
      if (solution.length > 100) score += 1;
      
      // B2B SaaS feasibility indicators
      const b2bIndicators = ['dashboard', 'analytics', 'integration', 'api', 'workflow', 'automation'];
      const techStack = ['cloud', 'database', 'backend', 'frontend', 'microservices'];
      const mvpIndicators = ['mvp', 'prototype', 'beta', 'pilot', 'poc'];
      
      b2bIndicators.forEach(indicator => {
        if (solutionLower.includes(indicator)) score += 1;
      });
      
      techStack.forEach(tech => {
        if (solutionLower.includes(tech)) score += 0.5;
      });
      
      mvpIndicators.forEach(mvp => {
        if (solutionLower.includes(mvp)) score += 2;
      });
      
      // For B2B products, technical complexity can increase feasibility (defensive moat)
      if (isB2B && (solutionLower.includes('complex') || solutionLower.includes('advanced'))) {
        score += 2;
      }
      
      // Platform businesses have network effects but higher initial complexity
      if (isPlatform) {
        score += 1; // Long-term feasibility benefit
      }
      
      // AI-powered solutions require more technical expertise but have higher barriers to entry
      if (isAIPowered) {
        score += 1;
      }
    }
    
    if (team && typeof team === 'string') {
      const teamLower = team.toLowerCase();
      const techExperience = ['developer', 'engineer', 'technical', 'cto', 'architect', 'programming'];
      const b2bExperience = ['enterprise', 'b2b', 'saas', 'sales', 'business development'];
      const domainExperience = ['industry', 'domain', 'expert', 'specialist', 'consultant'];
      
      techExperience.forEach(exp => {
        if (teamLower.includes(exp)) score += 2;
      });
      
      b2bExperience.forEach(exp => {
        if (teamLower.includes(exp)) score += 1;
      });
      
      domainExperience.forEach(exp => {
        if (teamLower.includes(exp)) score += 1;
      });
      
      if (teamLower.includes('years') || teamLower.includes('experience')) score += 1;
      if (teamLower.includes('founded') || teamLower.includes('startup')) score += 1;
    }
    
    return Math.max(2, Math.min(10, score));
  }

  scoreTechnicalComplexity(solution) {
    if (!solution) return 5;
    
    const solutionLower = solution.toLowerCase();
    const isB2B = this.detectB2BProduct(solutionLower);
    const isPlatform = this.detectPlatformBusiness(solutionLower);
    
    let complexityPoints = 0;
    
    // Enhanced complexity terms for B2B/SaaS
    const highComplexity = ['ai', 'machine learning', 'blockchain', 'quantum', 'nlp', 'computer vision', 'deep learning'];
    const mediumComplexity = ['api', 'database', 'cloud', 'backend', 'microservices', 'kubernetes', 'docker'];
    const b2bComplexity = ['analytics', 'dashboard', 'integration', 'workflow', 'automation', 'enterprise', 'crm', 'erp'];
    const developerTools = ['sdk', 'framework', 'library', 'cli', 'devops', 'ci/cd', 'deployment', 'monitoring'];
    const lowComplexity = ['website', 'simple', 'basic', 'landing page'];
    
    highComplexity.forEach(term => {
      if (solutionLower.includes(term)) complexityPoints += 3;
    });
    
    mediumComplexity.forEach(term => {
      if (solutionLower.includes(term)) complexityPoints += 2;
    });
    
    b2bComplexity.forEach(term => {
      if (solutionLower.includes(term)) complexityPoints += 2;
    });
    
    developerTools.forEach(term => {
      if (solutionLower.includes(term)) complexityPoints += 3;
    });
    
    lowComplexity.forEach(term => {
      if (solutionLower.includes(term)) complexityPoints -= 1;
    });
    
    // For B2B/SaaS products, technical complexity is often a competitive moat
    // Higher complexity should result in higher scores (technical simplicity becomes technical sophistication)
    if (isB2B || isPlatform) {
      // Invert the scoring - higher complexity = higher score for B2B
      let score = 5 + Math.floor(complexityPoints / 2);
      return Math.max(3, Math.min(10, score));
    } else {
      // For B2C products, maintain original logic (simpler = better)
      return Math.max(1, Math.min(10, 10 - Math.floor(complexityPoints / 2)));
    }
  }

  scoreTimeToMarket(solution, team) {
    let score = 5;
    const solutionLower = (solution || '').toLowerCase();
    const teamLower = (team || '').toLowerCase();
    
    if (solutionLower.includes('simple') || solutionLower.includes('mvp')) score += 2;
    if (teamLower.includes('experience')) score += 2;
    if (solutionLower.includes('ai') || solutionLower.includes('complex')) score -= 2;
    
    return Math.max(1, Math.min(10, score));
  }

  scoreMonetization(solution, market) {
    let score = 0;
    const text = `${solution || ''} ${market || ''}`.toLowerCase();
    const isB2B = this.detectB2BProduct(text);
    const isPlatform = this.detectPlatformBusiness(text);
    const isAIPowered = this.detectAIPoweredSolution(text);
    
    // Enhanced SaaS and B2B monetization models
    const saasModels = ['subscription', 'saas', 'monthly', 'annual', 'recurring'];
    const b2bModels = ['enterprise', 'per seat', 'per user', 'volume', 'tiered pricing', 'freemium'];
    const platformModels = ['commission', 'transaction', 'marketplace', 'revenue share', 'take rate'];
    const usageBasedModels = ['pay per use', 'consumption', 'api calls', 'credits', 'metered'];
    const aiModels = ['inference', 'model training', 'compute', 'tokens', 'requests'];
    
    // Score different monetization models
    saasModels.forEach(model => {
      if (text.includes(model)) score += 3; // SaaS models are highly scalable
    });
    
    b2bModels.forEach(model => {
      if (text.includes(model)) score += 2;
    });
    
    platformModels.forEach(model => {
      if (text.includes(model)) score += 3; // Platform models have network effects
    });
    
    usageBasedModels.forEach(model => {
      if (text.includes(model)) score += 2;
    });
    
    if (isAIPowered) {
      aiModels.forEach(model => {
        if (text.includes(model)) score += 2;
      });
      // AI solutions can command premium pricing
      score += 1;
    }
    
    // Market size indicators
    if (text.includes('billion')) score += 3;
    if (text.includes('million')) score += 2;
    if (text.includes('thousand')) score += 1;
    
    // Pricing indicators
    if (text.includes('$') || text.includes('price') || text.includes('cost')) score += 1;
    
    // B2B products typically have better monetization potential
    if (isB2B) score += 2;
    if (isPlatform) score += 2;
    
    return Math.min(score, 10);
  }

  async generateComprehensiveFeedback(scores, validationResults, ideaComponents) {
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

    // Use LLM synthesis if available
    if (this.enabledIntegrations.llmSynthesis && this.llmSynthesis.isConfigured()) {
      try {
        const synthesisFeedback = await this.llmSynthesis.synthesizeValidationResults({
          scores,
          trendsAnalysis: validationResults.market?.trendsData ? { trendsData: validationResults.market.trendsData } : null,
          competitorAnalysis: validationResults.competition,
          marketData: validationResults.crunchbase
        });
        
        if (synthesisFeedback.insights) {
          feedback.overall.push(synthesisFeedback.insights);
        }
      } catch (error) {
        console.warn('LLM synthesis failed, using fallback feedback:', error.message);
        // Add basic overall feedback as fallback
        const avgScore = scores.overall;
        if (avgScore >= 7) {
          feedback.overall.push('Strong startup concept with solid fundamentals across multiple dimensions');
        } else if (avgScore >= 5) {
          feedback.overall.push('Promising startup idea with opportunities for focused improvements');
        } else if (avgScore >= 3) {
          feedback.overall.push('Startup concept requires significant development in key areas');
        } else {
          feedback.overall.push('Major foundational issues identified that need addressing');
        }
      }
    }

    // Generate basic feedback for each dimension
    this.addBasicFeedback(feedback, scores, validationResults);
    
    return feedback;
  }

  addBasicFeedback(feedback, scores, validationResults) {
    // Problem clarity
    if (scores.problemClarity < 5) {
      feedback.detailed.problemClarity.push('Problem statement needs more clarity and specificity');
    } else if (scores.problemClarity >= 8) {
      feedback.detailed.problemClarity.push('Excellent problem definition with clear target audience');
    }

    // Market potential
    if (validationResults.market?.analysis) {
      feedback.detailed.marketPotential.push(...validationResults.market.analysis.strengths.map(s => s));
      feedback.detailed.marketPotential.push(...validationResults.market.analysis.recommendations.map(r => r));
    }

    // Competition
    if (validationResults.competition?.combinedAnalysis) {
      feedback.detailed.competition.push(validationResults.competition.combinedAnalysis.overallAssessment);
    }

    // Add fallback feedback if sections are empty
    Object.keys(feedback.detailed).forEach(key => {
      if (feedback.detailed[key].length === 0) {
        feedback.detailed[key].push(`${key.replace(/([A-Z])/g, ' $1')} analysis completed`);
      }
    });
  }

  compileValidationResult(ideaComponents, scores, feedback, validationResults, keywords) {
    const result = {
      scores,
      rating: this.getRating(scores.overall),
      feedback,
      extractedFromText: ideaComponents.extractedFromText,
      extractedComponents: ideaComponents.extractedFromText ? {
        problem: ideaComponents.problem,
        solution: ideaComponents.solution,
        market: ideaComponents.market,
        competition: ideaComponents.competition,
        team: ideaComponents.team
      } : undefined
    };

    // Add integration results
    if (validationResults.market?.trendsData) {
      result.trendsAnalysis = {
        keywords,
        trendsData: validationResults.market.trendsData,
        trendsScore: validationResults.market.trendsScore
      };
    }

    if (validationResults.competition) {
      result.competitorAnalysis = {
        totalCount: validationResults.competition.webResearch?.totalCompetitors || 0,
        competitors: validationResults.competition.webResearch?.competitors || [],
        searchKeywords: keywords,
        competitionScore: validationResults.competition.score
      };
    }

    if (validationResults.reddit) {
      result.sentimentAnalysis = validationResults.reddit;
    }

    if (validationResults.crunchbase) {
      result.marketData = validationResults.crunchbase;
    }

    return result;
  }

  getRating(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    if (score >= 2) return 'Poor';
    return 'Very Poor';
  }

  inferIndustry(ideaComponents) {
    const text = `${ideaComponents.problem || ''} ${ideaComponents.solution || ''}`.toLowerCase();
    
    // Enhanced industry inference with B2B focus
    if (text.includes('restaurant') || text.includes('food')) return 'food-and-beverages';
    if (text.includes('healthcare') || text.includes('medical')) return 'health-care';
    if (text.includes('education') || text.includes('learning')) return 'education';
    if (text.includes('finance') || text.includes('payment') || text.includes('fintech')) return 'financial-services';
    if (text.includes('retail') || text.includes('ecommerce')) return 'retail';
    if (text.includes('developer') || text.includes('api') || text.includes('sdk')) return 'developer-tools';
    if (text.includes('enterprise') || text.includes('b2b') || text.includes('saas')) return 'enterprise-software';
    if (text.includes('ai') || text.includes('machine learning') || text.includes('data')) return 'artificial-intelligence';
    if (text.includes('platform') || text.includes('marketplace')) return 'platform';
    
    return 'software'; // Default fallback
  }

  // Helper methods for business type detection
  detectB2BProduct(text) {
    const b2bIndicators = [
      'b2b', 'enterprise', 'business', 'company', 'organization', 'corporate',
      'saas', 'dashboard', 'analytics', 'crm', 'erp', 'workflow', 'automation',
      'integration', 'api', 'developer', 'team', 'collaboration', 'productivity'
    ];
    
    return b2bIndicators.some(indicator => text.includes(indicator));
  }

  detectPlatformBusiness(text) {
    const platformIndicators = [
      'platform', 'marketplace', 'network', 'ecosystem', 'connect', 'match',
      'two-sided', 'multi-sided', 'sellers', 'buyers', 'vendors', 'providers',
      'community', 'exchange', 'aggregator', 'intermediary'
    ];
    
    return platformIndicators.some(indicator => text.includes(indicator));
  }

  detectAIPoweredSolution(text) {
    const aiIndicators = [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
      'nlp', 'natural language', 'computer vision', 'neural network', 'algorithm',
      'predictive', 'recommendation', 'automation', 'intelligent', 'smart',
      'chatbot', 'voice', 'image recognition', 'text analysis', 'data science'
    ];
    
    return aiIndicators.some(indicator => text.includes(indicator));
  }

  // Configuration methods
  enableIntegration(name) {
    if (name in this.enabledIntegrations) {
      this.enabledIntegrations[name] = true;
    }
  }

  disableIntegration(name) {
    if (name in this.enabledIntegrations) {
      this.enabledIntegrations[name] = false;
    }
  }

  getIntegrationStatus() {
    return {
      ...this.enabledIntegrations,
      configured: {
        openai: this.llmSynthesis.isConfigured(),
        crunchbase: this.crunchbaseIntegration.isConfigured()
      }
    };
  }
}

module.exports = ValidationEngine;