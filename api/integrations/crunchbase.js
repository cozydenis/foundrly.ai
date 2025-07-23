class CrunchbaseIntegration {
  constructor() {
    this.baseUrl = 'https://api.crunchbase.com/api/v4';
    this.apiKey = process.env.CRUNCHBASE_API_KEY;
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  async analyzeMarketData(keywords, industry) {
    if (!this.apiKey) {
      console.warn('Crunchbase API key not configured');
      return this.createEmptyResult(keywords);
    }

    const cacheKey = `${keywords.sort().join(',')}:${industry || 'general'}`;
    if (this.isCached(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const [startupData, fundingData, investorData] = await Promise.allSettled([
        this.searchStartups(keywords, industry),
        this.analyzeFundingTrends(keywords, industry),
        this.findActiveInvestors(industry)
      ]);

      const result = this.aggregateMarketData(
        startupData.status === 'fulfilled' ? startupData.value : null,
        fundingData.status === 'fulfilled' ? fundingData.value : null,
        investorData.status === 'fulfilled' ? investorData.value : null,
        keywords,
        industry
      );

      this.cacheResult(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Crunchbase analysis failed:', error.message);
      return this.createErrorResult(keywords, error.message);
    }
  }

  async searchStartups(keywords, industry) {
    const searchTerms = keywords.join(' OR ');
    const params = new URLSearchParams({
      user_key: this.apiKey,
      query: searchTerms,
      limit: 50,
      order: 'created_at DESC'
    });

    if (industry) {
      params.append('categories', industry);
    }

    try {
      const response = await this.makeRequest(`/searches/organizations?${params}`);
      
      const startups = response.entities.map(entity => ({
        name: entity.properties.name,
        description: entity.properties.short_description,
        foundedYear: entity.properties.founded_on?.year,
        employees: entity.properties.num_employees_enum,
        location: entity.properties.location_identifiers?.[0],
        categories: entity.properties.categories?.map(cat => cat.value),
        website: entity.properties.website?.value,
        status: entity.properties.status,
        totalFunding: entity.properties.total_funding_usd,
        lastFundingDate: entity.properties.last_funding_on,
        fundingStage: entity.properties.last_funding_type
      }));

      return this.analyzeStartupLandscape(startups);
    } catch (error) {
      throw new Error(`Startup search failed: ${error.message}`);
    }
  }

  async analyzeFundingTrends(keywords, industry) {
    try {
      // Search for funding rounds in the space
      const params = new URLSearchParams({
        user_key: this.apiKey,
        limit: 100,
        order: 'announced_on DESC'
      });

      if (industry) {
        params.append('categories', industry);
      }

      const response = await this.makeRequest(`/searches/funding_rounds?${params}`);
      
      const fundingRounds = response.entities.map(entity => ({
        amount: entity.properties.money_raised?.value_usd,
        date: entity.properties.announced_on,
        stage: entity.properties.investment_type,
        organizationName: entity.properties.organization_identifier?.value,
        investorCount: entity.properties.num_investors
      })).filter(round => round.amount > 0);

      return this.analyzeFundingPatterns(fundingRounds);
    } catch (error) {
      throw new Error(`Funding analysis failed: ${error.message}`);
    }
  }

  async findActiveInvestors(industry) {
    try {
      const params = new URLSearchParams({
        user_key: this.apiKey,
        limit: 50,
        order: 'created_at DESC'
      });

      if (industry) {
        params.append('categories', industry);
      }

      const response = await this.makeRequest(`/searches/principals?${params}`);
      
      const investors = response.entities
        .filter(entity => entity.properties.primary_job_title?.includes('investor') ||
                         entity.properties.primary_organization?.category_groups?.includes('investor'))
        .map(entity => ({
          name: entity.properties.name,
          organization: entity.properties.primary_organization?.value,
          jobTitle: entity.properties.primary_job_title,
          location: entity.properties.location_identifiers?.[0],
          investmentCount: entity.properties.num_investments
        }));

      return {
        totalInvestors: investors.length,
        activeInvestors: investors.slice(0, 10),
        investmentActivity: this.calculateInvestmentActivity(investors)
      };
    } catch (error) {
      throw new Error(`Investor search failed: ${error.message}`);
    }
  }

  analyzeStartupLandscape(startups) {
    const analysis = {
      totalStartups: startups.length,
      recentStartups: startups.filter(s => s.foundedYear >= new Date().getFullYear() - 2).length,
      fundedStartups: startups.filter(s => s.totalFunding > 0).length,
      avgFunding: 0,
      topCategories: [],
      locations: [],
      fundingStages: [],
      competitiveIntensity: 'medium'
    };

    // Calculate average funding
    const fundedCompanies = startups.filter(s => s.totalFunding > 0);
    if (fundedCompanies.length > 0) {
      analysis.avgFunding = fundedCompanies.reduce((sum, s) => sum + s.totalFunding, 0) / fundedCompanies.length;
    }

    // Analyze categories
    const categories = new Map();
    startups.forEach(startup => {
      startup.categories?.forEach(cat => {
        categories.set(cat, (categories.get(cat) || 0) + 1);
      });
    });
    analysis.topCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Analyze locations
    const locations = new Map();
    startups.forEach(startup => {
      if (startup.location) {
        locations.set(startup.location, (locations.get(startup.location) || 0) + 1);
      }
    });
    analysis.locations = Array.from(locations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Analyze funding stages
    const stages = new Map();
    startups.forEach(startup => {
      if (startup.fundingStage) {
        stages.set(startup.fundingStage, (stages.get(startup.fundingStage) || 0) + 1);
      }
    });
    analysis.fundingStages = Array.from(stages.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([stage, count]) => ({ stage, count }));

    // Determine competitive intensity
    if (startups.length > 100) {
      analysis.competitiveIntensity = 'high';
    } else if (startups.length < 20) {
      analysis.competitiveIntensity = 'low';
    }

    return analysis;
  }

  analyzeFundingPatterns(fundingRounds) {
    const currentYear = new Date().getFullYear();
    const analysis = {
      totalRounds: fundingRounds.length,
      totalAmount: fundingRounds.reduce((sum, round) => sum + round.amount, 0),
      avgRoundSize: 0,
      yearlyTrends: [],
      stageDistribution: [],
      recentActivity: 'stable'
    };

    if (fundingRounds.length > 0) {
      analysis.avgRoundSize = analysis.totalAmount / fundingRounds.length;
    }

    // Yearly trends
    const yearlyData = new Map();
    fundingRounds.forEach(round => {
      const year = new Date(round.date).getFullYear();
      if (!yearlyData.has(year)) {
        yearlyData.set(year, { rounds: 0, amount: 0 });
      }
      const yearData = yearlyData.get(year);
      yearData.rounds++;
      yearData.amount += round.amount;
    });

    analysis.yearlyTrends = Array.from(yearlyData.entries())
      .sort((a, b) => b[0] - a[0]) // Sort by year descending
      .map(([year, data]) => ({ year, ...data }));

    // Stage distribution
    const stageData = new Map();
    fundingRounds.forEach(round => {
      stageData.set(round.stage, (stageData.get(round.stage) || 0) + 1);
    });
    analysis.stageDistribution = Array.from(stageData.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([stage, count]) => ({ stage, count }));

    // Recent activity trend
    if (analysis.yearlyTrends.length >= 2) {
      const thisYear = analysis.yearlyTrends.find(t => t.year === currentYear);
      const lastYear = analysis.yearlyTrends.find(t => t.year === currentYear - 1);
      
      if (thisYear && lastYear) {
        const growthRate = ((thisYear.amount - lastYear.amount) / lastYear.amount) * 100;
        if (growthRate > 20) analysis.recentActivity = 'increasing';
        else if (growthRate < -20) analysis.recentActivity = 'decreasing';
      }
    }

    return analysis;
  }

  calculateInvestmentActivity(investors) {
    const activity = {
      highActivity: investors.filter(i => (i.investmentCount || 0) > 10).length,
      mediumActivity: investors.filter(i => (i.investmentCount || 0) > 5 && (i.investmentCount || 0) <= 10).length,
      lowActivity: investors.filter(i => (i.investmentCount || 0) <= 5).length
    };
    
    return activity;
  }

  aggregateMarketData(startupData, fundingData, investorData, keywords, industry) {
    const marketInsights = [];
    let marketScore = 5; // Start neutral

    // Startup landscape insights
    if (startupData) {
      if (startupData.competitiveIntensity === 'high') {
        marketInsights.push('Highly competitive market with many established players');
        marketScore -= 1;
      } else if (startupData.competitiveIntensity === 'low') {
        marketInsights.push('Limited competition - potential opportunity or small market');
        marketScore += 1;
      }

      if (startupData.recentStartups > startupData.totalStartups * 0.3) {
        marketInsights.push('High recent startup activity indicates hot market');
        marketScore += 1;
      }

      if (startupData.avgFunding > 1000000) {
        marketInsights.push('Strong average funding suggests investor confidence');
        marketScore += 1;
      }
    }

    // Funding trends insights
    if (fundingData) {
      if (fundingData.recentActivity === 'increasing') {
        marketInsights.push('Growing investor interest with increasing funding activity');
        marketScore += 2;
      } else if (fundingData.recentActivity === 'decreasing') {
        marketInsights.push('Declining funding activity may indicate market challenges');
        marketScore -= 1;
      }

      if (fundingData.avgRoundSize > 5000000) {
        marketInsights.push('Large average round sizes indicate mature market');
      }
    }

    // Investor activity insights
    if (investorData) {
      if (investorData.investmentActivity.highActivity > 5) {
        marketInsights.push('Active investor ecosystem with engaged participants');
        marketScore += 1;
      }
    }

    return {
      keywords,
      industry,
      marketScore: Math.max(1, Math.min(10, marketScore)),
      startupLandscape: startupData,
      fundingTrends: fundingData,
      investorEcosystem: investorData,
      marketInsights,
      recommendations: this.generateRecommendations(startupData, fundingData, investorData),
      timestamp: Date.now()
    };
  }

  generateRecommendations(startupData, fundingData, investorData) {
    const recommendations = [];

    if (startupData?.competitiveIntensity === 'high') {
      recommendations.push('Focus on strong differentiation due to high competition');
      recommendations.push('Consider niche market positioning');
    }

    if (fundingData?.recentActivity === 'increasing') {
      recommendations.push('Good timing for fundraising given increasing activity');
    }

    if (startupData?.avgFunding > 0) {
      const avgFunding = startupData.avgFunding;
      if (avgFunding < 500000) {
        recommendations.push('Consider bootstrapping or angel funding approach');
      } else if (avgFunding > 5000000) {
        recommendations.push('Prepare for significant funding requirements');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Conduct additional market research for strategic positioning');
    }

    return recommendations;
  }

  async makeRequest(endpoint) {
    await this.delay(this.rateLimitDelay);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'X-cb-user-key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  isCached(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  cacheResult(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  createEmptyResult(keywords) {
    return {
      keywords,
      marketScore: 5,
      startupLandscape: null,
      fundingTrends: null,
      investorEcosystem: null,
      marketInsights: ['Crunchbase data not available'],
      recommendations: ['Conduct manual market research'],
      timestamp: Date.now()
    };
  }

  createErrorResult(keywords, error) {
    return {
      ...this.createEmptyResult(keywords),
      error,
      marketInsights: [`Crunchbase analysis failed: ${error}`]
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = CrunchbaseIntegration;