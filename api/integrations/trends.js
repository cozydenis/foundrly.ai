const googleTrends = require('google-trends-api');

class TrendsIntegration {
  constructor() {
    this.maxResults = 10;
    this.timeout = 30000;
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  async analyzeKeywordTrends(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return this.createEmptyResult(keywords);
    }

    const cacheKey = keywords.sort().join(',');
    if (this.isCached(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const trends = [];
      let totalInterest = 0;
      let validResults = 0;

      for (const keyword of keywords.slice(0, 5)) {
        try {
          const result = await this.getSingleKeywordTrend(keyword);
          if (result) {
            trends.push(result);
            totalInterest += result.avgInterest;
            validResults++;
          }
          
          // Rate limiting
          await this.delay(1000);
        } catch (error) {
          console.warn(`Failed to get trends for keyword "${keyword}":`, error.message);
        }
      }

      const result = {
        trends,
        avgInterest: validResults > 0 ? Math.round(totalInterest / validResults) : 0,
        validResults,
        totalKeywords: keywords.length,
        searchKeywords: keywords,
        timestamp: Date.now()
      };

      this.cacheResult(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Trends analysis failed:', error.message);
      return this.createErrorResult(keywords, error.message);
    }
  }

  async getSingleKeywordTrend(keyword) {
    try {
      const interestOverTime = await googleTrends.interestOverTime({
        keyword: keyword,
        startTime: new Date(Date.now() - (12 * 30 * 24 * 60 * 60 * 1000)), // 12 months
        endTime: new Date(),
        geo: 'US'
      });

      const data = JSON.parse(interestOverTime);
      
      if (!data.default || !data.default.timelineData || data.default.timelineData.length === 0) {
        return null;
      }

      return this.processKeywordData(keyword, data.default.timelineData);
    } catch (error) {
      throw new Error(`Failed to get trend data for "${keyword}": ${error.message}`);
    }
  }

  processKeywordData(keyword, timelineData) {
    const interests = timelineData.map(point => point.value[0]);
    const avgInterest = interests.reduce((sum, val) => sum + val, 0) / interests.length;

    // Calculate trend direction
    const trend = this.calculateTrendDirection(interests);
    const volatility = this.calculateVolatility(interests);
    
    return {
      keyword,
      avgInterest: Math.round(avgInterest),
      trend: trend.direction,
      changePct: Math.round(trend.changePct),
      maxInterest: Math.max(...interests),
      minInterest: Math.min(...interests),
      volatility: Math.round(volatility),
      dataPoints: interests.length,
      seasonality: this.detectSeasonality(interests)
    };
  }

  calculateTrendDirection(interests) {
    if (interests.length < 6) {
      return { direction: 'stable', changePct: 0 };
    }

    const lastQuarter = interests.slice(-3);
    const prevQuarter = interests.slice(-6, -3);
    
    const lastQuarterAvg = lastQuarter.reduce((sum, val) => sum + val, 0) / lastQuarter.length;
    const prevQuarterAvg = prevQuarter.reduce((sum, val) => sum + val, 0) / prevQuarter.length;
    
    if (prevQuarterAvg === 0) {
      return { direction: 'stable', changePct: 0 };
    }

    const changePct = ((lastQuarterAvg - prevQuarterAvg) / prevQuarterAvg) * 100;
    
    let direction = 'stable';
    if (changePct > 15) direction = 'rising';
    else if (changePct < -15) direction = 'declining';

    return { direction, changePct };
  }

  calculateVolatility(interests) {
    if (interests.length < 2) return 0;

    const mean = interests.reduce((sum, val) => sum + val, 0) / interests.length;
    const variance = interests.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / interests.length;
    
    return Math.sqrt(variance);
  }

  detectSeasonality(interests) {
    // Simple seasonality detection based on periodic patterns
    if (interests.length < 12) return 'insufficient_data';

    const peaks = [];
    const troughs = [];

    for (let i = 1; i < interests.length - 1; i++) {
      if (interests[i] > interests[i-1] && interests[i] > interests[i+1]) {
        peaks.push(i);
      }
      if (interests[i] < interests[i-1] && interests[i] < interests[i+1]) {
        troughs.push(i);
      }
    }

    // Check for regular patterns
    if (peaks.length >= 3) {
      const intervals = [];
      for (let i = 1; i < peaks.length; i++) {
        intervals.push(peaks[i] - peaks[i-1]);
      }
      
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      if (avgInterval >= 10 && avgInterval <= 14) return 'seasonal'; // Roughly quarterly
    }

    return peaks.length > troughs.length ? 'growth_trend' : 'stable';
  }

  calculateTrendScore(trendsData) {
    if (!trendsData || trendsData.avgInterest === 0) {
      return 0;
    }

    let score = 0;
    const { avgInterest, trends, validResults } = trendsData;

    // Base score from average interest (0-100 scale)
    score += Math.min(avgInterest / 10, 4); // Max 4 points

    // Trend direction bonuses
    if (trends && trends.length > 0) {
      const risingKeywords = trends.filter(t => t.trend === 'rising').length;
      const stableKeywords = trends.filter(t => t.trend === 'stable').length;
      
      score += (risingKeywords * 2); // 2 points per rising keyword
      score += (stableKeywords * 1); // 1 point per stable keyword
    }

    // High peak interest bonus
    const maxInterest = Math.max(...(trends?.map(t => t.maxInterest) || [0]));
    if (maxInterest > 50) score += 2;
    if (maxInterest > 80) score += 1;

    // Data quality bonus
    if (validResults >= 3) score += 1;

    return Math.min(Math.round(score), 10);
  }

  isCached(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  cacheResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  createEmptyResult(keywords) {
    return {
      trends: [],
      avgInterest: 0,
      validResults: 0,
      totalKeywords: keywords?.length || 0,
      searchKeywords: keywords || [],
      timestamp: Date.now()
    };
  }

  createErrorResult(keywords, error) {
    return {
      ...this.createEmptyResult(keywords),
      error,
      timestamp: Date.now()
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check method
  async healthCheck() {
    try {
      const testResult = await this.getSingleKeywordTrend('test');
      return { status: 'healthy', timestamp: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: Date.now() };
    }
  }
}

module.exports = TrendsIntegration;