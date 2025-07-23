class FeasibilityValidator {
  constructor() {
    this.complexityWeights = {
      high: ['ai', 'machine learning', 'blockchain', 'quantum', 'neural network', 'deep learning', 'computer vision', 'nlp'],
      medium: ['api', 'database', 'cloud', 'backend', 'frontend', 'algorithm', 'integration', 'automation'],
      low: ['website', 'app', 'mobile', 'web', 'simple', 'basic', 'template', 'wordpress']
    };
  }

  analyzeFeasibility(solution, team, competition) {
    const implementationScore = this.scoreImplementation(solution, team, competition);
    const technicalComplexity = this.assessTechnicalComplexity(solution);
    const timeToMarket = this.estimateTimeToMarket(solution, team);
    
    return {
      overallScore: Math.round((implementationScore + technicalComplexity.simplicityScore + timeToMarket.score) / 3),
      implementation: {
        score: implementationScore,
        analysis: this.generateImplementationAnalysis(solution, team, competition)
      },
      technicalComplexity: {
        score: technicalComplexity.simplicityScore,
        complexity: technicalComplexity.complexity,
        factors: technicalComplexity.factors,
        analysis: technicalComplexity.analysis
      },
      timeToMarket: {
        score: timeToMarket.score,
        estimate: timeToMarket.estimate,
        factors: timeToMarket.factors,
        analysis: timeToMarket.analysis
      }
    };
  }

  scoreImplementation(solution, team, competition) {
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

  assessTechnicalComplexity(solution) {
    if (!solution || typeof solution !== 'string') {
      return { simplicityScore: 5, complexity: 'unknown', factors: [], analysis: 'Unable to assess without solution details' };
    }

    const solutionLower = solution.toLowerCase();
    let complexityPoints = 0;
    const factors = [];

    // Check complexity indicators
    this.complexityWeights.high.forEach(term => {
      if (solutionLower.includes(term)) {
        complexityPoints += 3;
        factors.push({ term, impact: 'high', description: 'Advanced technology requiring specialized expertise' });
      }
    });

    this.complexityWeights.medium.forEach(term => {
      if (solutionLower.includes(term)) {
        complexityPoints += 2;
        factors.push({ term, impact: 'medium', description: 'Standard development practices required' });
      }
    });

    this.complexityWeights.low.forEach(term => {
      if (solutionLower.includes(term)) {
        complexityPoints -= 1;
        factors.push({ term, impact: 'low', description: 'Simple implementation approach' });
      }
    });

    // Infrastructure and scaling complexity
    if (solutionLower.includes('scale') || solutionLower.includes('enterprise')) {
      complexityPoints += 2;
      factors.push({ term: 'scaling', impact: 'medium', description: 'Requires scalable architecture' });
    }

    // Determine complexity level
    let complexity, simplicityScore;
    if (complexityPoints >= 6) {
      complexity = 'high';
      simplicityScore = Math.max(1, 4 - Math.floor(complexityPoints / 3));
    } else if (complexityPoints >= 3) {
      complexity = 'medium';
      simplicityScore = 6 - Math.floor(complexityPoints / 2);
    } else {
      complexity = 'low';
      simplicityScore = Math.min(10, 8 + Math.abs(complexityPoints));
    }

    const analysis = this.generateComplexityAnalysis(complexity, factors);

    return {
      simplicityScore,
      complexity,
      factors,
      analysis
    };
  }

  estimateTimeToMarket(solution, team) {
    const solutionLower = (solution || '').toLowerCase();
    const teamLower = (team || '').toLowerCase();
    
    let timePoints = 5; // Start neutral
    const factors = [];

    // Quick to market indicators
    const quickTerms = ['simple', 'basic', 'minimal', 'mvp', 'prototype', 'existing', 'template'];
    quickTerms.forEach(term => {
      if (solutionLower.includes(term)) {
        timePoints += 1;
        factors.push({ factor: term, impact: 'accelerates', months: -1 });
      }
    });

    // Slow to market indicators
    const slowTerms = ['complex', 'advanced', 'enterprise', 'custom', 'proprietary', 'research'];
    slowTerms.forEach(term => {
      if (solutionLower.includes(term)) {
        timePoints -= 1;
        factors.push({ factor: term, impact: 'delays', months: 2 });
      }
    });

    // Team readiness
    if (teamLower.includes('experience') || teamLower.includes('expert') || teamLower.includes('developer')) {
      timePoints += 2;
      factors.push({ factor: 'experienced team', impact: 'accelerates', months: -2 });
    }

    // Technology complexity
    if (solutionLower.includes('ai') || solutionLower.includes('machine learning')) {
      timePoints -= 2;
      factors.push({ factor: 'AI/ML development', impact: 'delays', months: 4 });
    }

    // Regulatory requirements
    if (solutionLower.includes('regulation') || solutionLower.includes('compliance')) {
      timePoints -= 2;
      factors.push({ factor: 'regulatory compliance', impact: 'delays', months: 3 });
    }

    const score = Math.max(1, Math.min(10, timePoints));
    const estimate = this.scoreToTimeEstimate(score);
    const analysis = this.generateTimeAnalysis(score, factors);

    return {
      score,
      estimate,
      factors,
      analysis
    };
  }

  scoreToTimeEstimate(score) {
    if (score >= 8) return '2-4 months';
    if (score >= 6) return '4-8 months';
    if (score >= 4) return '8-12 months';
    if (score >= 2) return '12-18 months';
    return '18+ months';
  }

  generateImplementationAnalysis(solution, team, competition) {
    const analysis = { strengths: [], concerns: [], recommendations: [] };
    
    if (!solution) {
      analysis.concerns.push('Solution description missing');
      analysis.recommendations.push('Provide detailed solution architecture');
    }
    
    if (!team) {
      analysis.concerns.push('Team information not provided');
      analysis.recommendations.push('Detail team expertise and experience');
    } else if (team.toLowerCase().includes('experience')) {
      analysis.strengths.push('Team appears experienced');
    }
    
    return analysis;
  }

  generateComplexityAnalysis(complexity, factors) {
    const highImpactFactors = factors.filter(f => f.impact === 'high');
    
    switch (complexity) {
      case 'high':
        return `High technical complexity detected. ${highImpactFactors.length} advanced technology components identified. Consider breaking into phases.`;
      case 'medium':
        return 'Moderate technical complexity requiring standard development practices and skilled team.';
      case 'low':
        return 'Low technical complexity enables rapid development with standard tools and frameworks.';
      default:
        return 'Technical complexity assessment unavailable.';
    }
  }

  generateTimeAnalysis(score, factors) {
    const accelerators = factors.filter(f => f.impact === 'accelerates');
    const delays = factors.filter(f => f.impact === 'delays');
    
    let analysis = `Development timeline score: ${score}/10. `;
    
    if (accelerators.length > 0) {
      analysis += `Accelerating factors: ${accelerators.map(f => f.factor).join(', ')}. `;
    }
    
    if (delays.length > 0) {
      analysis += `Potential delays from: ${delays.map(f => f.factor).join(', ')}. `;
    }
    
    return analysis;
  }
}

module.exports = FeasibilityValidator;