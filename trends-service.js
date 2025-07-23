const googleTrends = require('google-trends-api');

class TrendsService {
  async getKeywordTrends(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return { trends: [], avgInterest: 0 };
    }

    try {
      const trends = [];
      let totalInterest = 0;
      let validResults = 0;

      for (const keyword of keywords.slice(0, 5)) { // Limit to 5 keywords to avoid rate limits
        try {
          const result = await this.getSingleKeywordTrend(keyword);
          if (result) {
            trends.push(result);
            totalInterest += result.avgInterest;
            validResults++;
          }
          
          // Add delay to avoid rate limiting
          await this.delay(1000);
        } catch (error) {
          console.warn(`Failed to get trends for keyword "${keyword}":`, error.message);
          // Continue with other keywords
        }
      }

      const avgInterest = validResults > 0 ? totalInterest / validResults : 0;

      return {
        trends,
        avgInterest: Math.round(avgInterest),
        validResults,
        totalKeywords: keywords.length
      };
    } catch (error) {
      console.error('Trends service error:', error.message);
      return { trends: [], avgInterest: 0, error: error.message };
    }
  }

  async getSingleKeywordTrend(keyword) {
    try {
      // Get interest over time for the past 12 months
      const interestOverTime = await googleTrends.interestOverTime({
        keyword: keyword,
        startTime: new Date(Date.now() - (12 * 30 * 24 * 60 * 60 * 1000)), // 12 months ago
        endTime: new Date(),
        geo: 'US'
      });

      const data = JSON.parse(interestOverTime);
      
      if (!data.default || !data.default.timelineData || data.default.timelineData.length === 0) {
        return null;
      }

      // Calculate average interest
      const timelineData = data.default.timelineData;
      const interests = timelineData.map(point => point.value[0]);
      const avgInterest = interests.reduce((sum, val) => sum + val, 0) / interests.length;

      // Calculate trend direction (comparing last 3 months to previous 3 months)
      const lastQuarter = interests.slice(-3);
      const prevQuarter = interests.slice(-6, -3);
      
      const lastQuarterAvg = lastQuarter.reduce((sum, val) => sum + val, 0) / lastQuarter.length;
      const prevQuarterAvg = prevQuarter.reduce((sum, val) => sum + val, 0) / prevQuarter.length;
      
      let trend = 'stable';
      const changePct = ((lastQuarterAvg - prevQuarterAvg) / prevQuarterAvg) * 100;
      
      if (changePct > 10) trend = 'rising';
      else if (changePct < -10) trend = 'declining';

      return {
        keyword,
        avgInterest: Math.round(avgInterest),
        trend,
        changePct: Math.round(changePct),
        maxInterest: Math.max(...interests),
        minInterest: Math.min(...interests)
      };
    } catch (error) {
      throw new Error(`Failed to get trend data for "${keyword}": ${error.message}`);
    }
  }

  calculateTrendScore(trendsData) {
    if (!trendsData || trendsData.avgInterest === 0) {
      return 0;
    }

    let score = 0;
    const { avgInterest, trends } = trendsData;

    // Base score from average interest (0-100 scale)
    score += Math.min(avgInterest / 10, 4); // Max 4 points from interest level

    // Bonus points for trending keywords
    if (trends && trends.length > 0) {
      const risingKeywords = trends.filter(t => t.trend === 'rising').length;
      const stableKeywords = trends.filter(t => t.trend === 'stable').length;
      
      score += (risingKeywords * 2); // 2 points per rising keyword
      score += (stableKeywords * 1); // 1 point per stable keyword
    }

    // Bonus for high peak interest
    const maxInterest = Math.max(...(trends.map(t => t.maxInterest) || [0]));
    if (maxInterest > 50) score += 2;
    if (maxInterest > 80) score += 1;

    return Math.min(Math.round(score), 10); // Cap at 10
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = TrendsService;