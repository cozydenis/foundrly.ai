class RedditIntegration {
  constructor() {
    this.baseUrl = 'https://www.reddit.com';
    this.userAgent = 'StartupValidator/1.0';
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  async analyzeSentiment(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return this.createEmptyResult();
    }

    const cacheKey = keywords.sort().join(',');
    if (this.isCached(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const results = [];
      
      for (const keyword of keywords.slice(0, 3)) { // Limit to avoid rate limits
        const sentimentData = await this.searchKeywordSentiment(keyword);
        if (sentimentData) {
          results.push(sentimentData);
        }
        
        // Rate limiting
        await this.delay(2000);
      }

      const aggregatedResult = this.aggregateResults(results, keywords);
      this.cacheResult(cacheKey, aggregatedResult);
      
      return aggregatedResult;
    } catch (error) {
      console.error('Reddit sentiment analysis failed:', error.message);
      return this.createErrorResult(keywords, error.message);
    }
  }

  async searchKeywordSentiment(keyword) {
    try {
      // Search relevant subreddits
      const subreddits = ['startups', 'entrepreneur', 'business', 'technology'];
      const posts = [];

      for (const subreddit of subreddits.slice(0, 2)) { // Limit subreddits
        try {
          const subredditPosts = await this.fetchSubredditPosts(subreddit, keyword);
          posts.push(...subredditPosts);
        } catch (error) {
          console.warn(`Failed to fetch from r/${subreddit}:`, error.message);
        }
      }

      if (posts.length === 0) {
        return null;
      }

      return this.analyzePosts(keyword, posts);
    } catch (error) {
      throw new Error(`Reddit search failed for "${keyword}": ${error.message}`);
    }
  }

  async fetchSubredditPosts(subreddit, keyword) {
    try {
      // Use Reddit's JSON API
      const searchUrl = `${this.baseUrl}/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&limit=10&sort=relevance`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return (data.data?.children || []).map(child => ({
        title: child.data.title,
        selftext: child.data.selftext,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        subreddit: child.data.subreddit,
        permalink: child.data.permalink
      }));
    } catch (error) {
      throw new Error(`Failed to fetch from r/${subreddit}: ${error.message}`);
    }
  }

  analyzePosts(keyword, posts) {
    if (posts.length === 0) {
      return null;
    }

    let totalSentiment = 0;
    let sentimentCount = 0;
    const themes = new Map();
    const discussions = [];

    posts.forEach(post => {
      // Simple sentiment analysis based on keywords and score
      const sentiment = this.calculatePostSentiment(post, keyword);
      if (sentiment !== null) {
        totalSentiment += sentiment;
        sentimentCount++;
      }

      // Extract themes from titles
      this.extractThemes(post.title, themes);

      // Store relevant discussions
      if (post.score > 0 || post.num_comments > 5) {
        discussions.push({
          title: post.title,
          score: post.score,
          comments: post.num_comments,
          subreddit: post.subreddit,
          relevance: this.calculateRelevance(post, keyword)
        });
      }
    });

    const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0;
    const topThemes = Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, mentions: count }));

    const topDiscussions = discussions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);

    return {
      keyword,
      sentiment: this.categorizeSentiment(avgSentiment),
      sentimentScore: Math.round(avgSentiment * 100) / 100,
      totalPosts: posts.length,
      avgScore: posts.reduce((sum, p) => sum + p.score, 0) / posts.length,
      totalComments: posts.reduce((sum, p) => sum + p.num_comments, 0),
      themes: topThemes,
      topDiscussions
    };
  }

  calculatePostSentiment(post, keyword) {
    const text = `${post.title} ${post.selftext}`.toLowerCase();
    const keywordLower = keyword.toLowerCase();

    // Skip if keyword not prominently featured
    if (!text.includes(keywordLower)) {
      return null;
    }

    let sentiment = 0;

    // Positive indicators
    const positiveWords = ['great', 'awesome', 'excellent', 'love', 'amazing', 'fantastic', 'perfect', 'recommend', 'useful', 'helpful'];
    const negativeWords = ['terrible', 'awful', 'hate', 'worst', 'useless', 'scam', 'avoid', 'disappointed', 'frustrated', 'problem'];

    positiveWords.forEach(word => {
      const count = (text.match(new RegExp(word, 'g')) || []).length;
      sentiment += count * 0.5;
    });

    negativeWords.forEach(word => {
      const count = (text.match(new RegExp(word, 'g')) || []).length;
      sentiment -= count * 0.5;
    });

    // Factor in post score (normalized)
    const scoreWeight = Math.max(-1, Math.min(1, post.score / 10));
    sentiment += scoreWeight * 0.3;

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, sentiment));
  }

  extractThemes(title, themes) {
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Common startup/business themes
    const relevantThemes = ['startup', 'business', 'technology', 'innovation', 'market', 'customer', 'product', 'service', 'growth', 'funding'];
    
    words.forEach(word => {
      if (relevantThemes.includes(word)) {
        themes.set(word, (themes.get(word) || 0) + 1);
      }
    });
  }

  calculateRelevance(post, keyword) {
    const title = post.title.toLowerCase();
    const keyword_lower = keyword.toLowerCase();
    
    let relevance = 0;
    
    // Keyword in title
    if (title.includes(keyword_lower)) relevance += 3;
    
    // Post engagement
    relevance += Math.min(post.score / 10, 2);
    relevance += Math.min(post.num_comments / 20, 1);
    
    return relevance;
  }

  aggregateResults(results, keywords) {
    if (results.length === 0) {
      return this.createEmptyResult();
    }

    const totalPosts = results.reduce((sum, r) => sum + r.totalPosts, 0);
    const avgSentiment = results.reduce((sum, r) => sum + r.sentimentScore, 0) / results.length;
    const totalComments = results.reduce((sum, r) => sum + r.totalComments, 0);

    // Combine themes
    const allThemes = new Map();
    results.forEach(result => {
      result.themes.forEach(theme => {
        allThemes.set(theme.theme, (allThemes.get(theme.theme) || 0) + theme.mentions);
      });
    });

    const topThemes = Array.from(allThemes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, mentions]) => ({ theme, mentions }));

    // Combine discussions
    const allDiscussions = results.flatMap(r => r.topDiscussions)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    return {
      keywords,
      overallSentiment: this.categorizeSentiment(avgSentiment),
      sentimentScore: Math.round(avgSentiment * 100) / 100,
      totalPosts,
      totalComments,
      keywordResults: results,
      themes: topThemes,
      topDiscussions: allDiscussions,
      marketInsights: this.generateMarketInsights(results, topThemes),
      timestamp: Date.now()
    };
  }

  generateMarketInsights(results, themes) {
    const insights = [];
    
    // Sentiment insights
    const positiveResults = results.filter(r => r.sentimentScore > 0.2);
    const negativeResults = results.filter(r => r.sentimentScore < -0.2);
    
    if (positiveResults.length > negativeResults.length) {
      insights.push('Generally positive sentiment detected in discussions');
    } else if (negativeResults.length > positiveResults.length) {
      insights.push('Some negative sentiment found - investigate potential concerns');
    }
    
    // Activity insights
    const totalEngagement = results.reduce((sum, r) => sum + r.totalComments, 0);
    if (totalEngagement > 50) {
      insights.push('High engagement levels suggest active market interest');
    } else if (totalEngagement < 10) {
      insights.push('Limited discussion volume may indicate niche market');
    }
    
    // Theme insights
    if (themes.length > 0) {
      insights.push(`Key discussion themes: ${themes.slice(0, 3).map(t => t.theme).join(', ')}`);
    }
    
    return insights;
  }

  categorizeSentiment(score) {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  isCached(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  cacheResult(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  createEmptyResult() {
    return {
      keywords: [],
      overallSentiment: 'neutral',
      sentimentScore: 0,
      totalPosts: 0,
      totalComments: 0,
      keywordResults: [],
      themes: [],
      topDiscussions: [],
      marketInsights: ['No Reddit data available for analysis'],
      timestamp: Date.now()
    };
  }

  createErrorResult(keywords, error) {
    return {
      ...this.createEmptyResult(),
      keywords,
      error,
      marketInsights: [`Reddit analysis failed: ${error}`]
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = RedditIntegration;