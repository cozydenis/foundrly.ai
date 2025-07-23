const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class CompetitorService {
  constructor() {
    this.maxResults = 10;
    this.timeout = 30000; // 30 seconds
  }

  async findCompetitors(keywords) {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return { competitors: [], totalCount: 0, searchKeywords: [] };
    }

    try {
      const searchQueries = this.generateSearchQueries(keywords);
      const competitors = [];
      const seenDomains = new Set();
      
      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 searches to avoid rate limits
        try {
          const results = await this.searchCompetitors(query);
          
          results.forEach(result => {
            const domain = this.extractDomain(result.url);
            if (!seenDomains.has(domain) && competitors.length < this.maxResults) {
              seenDomains.add(domain);
              competitors.push({
                ...result,
                domain,
                searchQuery: query
              });
            }
          });
          
          // Add delay between searches
          await this.delay(2000);
        } catch (error) {
          console.warn(`Search failed for query "${query}":`, error.message);
        }
      }

      return {
        competitors,
        totalCount: competitors.length,
        searchKeywords: keywords,
        searchQueries
      };
    } catch (error) {
      console.error('Competitor analysis failed:', error.message);
      return { 
        competitors: [], 
        totalCount: 0, 
        searchKeywords: keywords, 
        error: error.message 
      };
    }
  }

  generateSearchQueries(keywords) {
    const queries = [];
    
    // Individual keyword searches
    keywords.forEach(keyword => {
      queries.push(`"${keyword}" startup company`);
      queries.push(`"${keyword}" software solution`);
    });
    
    // Combined keyword searches
    if (keywords.length > 1) {
      const combined = keywords.slice(0, 2).join(' ');
      queries.push(`"${combined}" competitors`);
      queries.push(`"${combined}" alternatives`);
    }
    
    return queries;
  }

  async searchCompetitors(query) {
    let browser;
    try {
      // Use DuckDuckGo to avoid Google's bot detection
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
      
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set a realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: this.timeout });
      
      // Wait for results to load
      await page.waitForSelector('[data-result]', { timeout: 10000 });
      
      const html = await page.content();
      const $ = cheerio.load(html);
      const results = [];
      
      // Parse DuckDuckGo results
      $('[data-result]').each((index, element) => {
        if (results.length >= 5) return false; // Limit results per search
        
        const $el = $(element);
        const titleElement = $el.find('h2 a');
        const snippetElement = $el.find('[data-result="snippet"]');
        
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const snippet = snippetElement.text().trim();
        
        if (title && url && this.isValidCompetitor(title, snippet, query)) {
          results.push({
            title,
            url: this.cleanUrl(url),
            snippet: snippet.substring(0, 200), // Limit snippet length
            relevanceScore: this.calculateRelevance(title, snippet, query)
          });
        }
      });
      
      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  isValidCompetitor(title, snippet, query) {
    const text = `${title} ${snippet}`.toLowerCase();
    
    // Filter out non-commercial results
    const excludePatterns = [
      'wikipedia', 'wiki', 'reddit', 'quora', 'stackoverflow', 
      'youtube', 'news', 'blog', 'article', 'definition',
      'github', 'documentation', 'tutorial', 'how to'
    ];
    
    const hasExcluded = excludePatterns.some(pattern => text.includes(pattern));
    if (hasExcluded) return false;
    
    // Look for commercial indicators
    const commercialIndicators = [
      'company', 'startup', 'software', 'platform', 'solution',
      'service', 'app', 'tool', 'business', 'saas'
    ];
    
    const hasCommercial = commercialIndicators.some(indicator => text.includes(indicator));
    return hasCommercial;
  }

  calculateRelevance(title, snippet, query) {
    const text = `${title} ${snippet}`.toLowerCase();
    const queryWords = query.toLowerCase().replace(/['"]/g, '').split(' ');
    
    let score = 0;
    queryWords.forEach(word => {
      if (word.length > 2) { // Skip small words
        const count = (text.match(new RegExp(word, 'g')) || []).length;
        score += count;
      }
    });
    
    // Boost score for commercial terms in title
    if (title.toLowerCase().includes('startup') || title.toLowerCase().includes('company')) {
      score += 2;
    }
    
    return score;
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  cleanUrl(url) {
    try {
      // Remove tracking parameters and clean up
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  calculateCompetitionScore(competitorCount) {
    // Inverse scoring: fewer competitors = higher score
    if (competitorCount === 0) return 10;
    if (competitorCount <= 2) return 8;
    if (competitorCount <= 5) return 6;
    if (competitorCount <= 8) return 4;
    if (competitorCount <= 12) return 2;
    return 1;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CompetitorService;