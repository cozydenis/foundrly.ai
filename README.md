# 🚀 Foundrly MVP - AI-Powered Startup Idea Validator

A comprehensive platform for validating startup ideas using AI analysis, market research, and competitive intelligence.

## ✨ Features

- **7-Dimensional Validation**: Problem clarity, market potential, feasibility, technical complexity, monetization, time-to-market, and competition analysis
- **AI-Powered Analysis**: OpenAI GPT-4o-mini for intelligent component extraction and insights
- **Market Research**: Google Trends integration for real-time market trend analysis
- **Competitor Discovery**: Automated web scraping to find potential competitors
- **Professional UI**: Clean, responsive interface with color-coded scoring and detailed feedback

## 🏗️ Architecture

```
foundrly-mvp/
├── api/
│   ├── validation/     # Core validation modules
│   ├── integrations/   # External API integrations  
│   └── llm/           # AI/LLM services
├── frontend/
│   └── components/    # React components
├── lib/
│   └── scoring/      # Central validation engine
└── public/           # Static web interface
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- NPM or Yarn
- OpenAI API key (optional but recommended)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd foundrly-mvp
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your API keys (optional)
```

3. **Start the server:**
```bash
npm start
```

4. **Access the application:**
- Web Interface: http://localhost:3000
- API Documentation: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

## 🔧 Configuration

### API Keys (Optional)

The system works without any API keys using fallback mechanisms, but provides enhanced features with:

**OpenAI API Key** (Recommended)
- Intelligent component extraction from plain text descriptions
- Advanced keyword analysis for market research
- Strategic insights and improvement recommendations

```bash
# In .env file
OPENAI_API_KEY=sk-proj-your-api-key-here
```

**Crunchbase API Key** (Premium)
- Professional startup ecosystem data
- Funding trends and investor insights
- Competitive landscape from verified database

```bash
# In .env file  
CRUNCHBASE_API_KEY=your-crunchbase-key-here
```

### Without API Keys

The system provides full functionality using fallback mechanisms:
- Basic text parsing for component extraction
- Rule-based keyword identification
- Web scraping for competitor research
- Google Trends for market analysis (no key required)

## 📊 API Usage

### Validate Startup Ideas

**Endpoint:** `POST /api/validate`

**Plain Text Input:**
```json
{
  "description": "I want to build an AI app that helps restaurants manage inventory. Most restaurants waste food because they can't track ingredients properly."
}
```

**Structured Input:**
```json
{
  "problem": "Restaurants struggle with food waste",
  "solution": "AI-powered inventory management app", 
  "market": "600,000 restaurants in the US",
  "competition": "Few specialized competitors",
  "team": "Experienced developers"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scores": {
      "problemClarity": 8,
      "marketPotential": 7, 
      "feasibility": 6,
      "technicalComplexity": 5,
      "monetizationViability": 7,
      "timeToMarket": 6,
      "competition": 8,
      "overall": 6.7
    },
    "rating": "Good",
    "feedback": {
      "overall": ["Strategic insights..."],
      "detailed": {
        "problemClarity": ["Specific feedback..."],
        // ... other dimensions
      }
    },
    "trendsAnalysis": { /* Market trends data */ },
    "competitorAnalysis": { /* Found competitors */ }
  }
}
```

## 🔍 Integration Status

Check which integrations are active:

**Endpoint:** `GET /api/integrations`

**Response:**
```json
{
  "status": {
    "trends": true,
    "reddit": false, 
    "crunchbase": false,
    "llmSynthesis": true,
    "configured": {
      "openai": true,
      "crunchbase": false
    }
  }
}
```

## 🛠️ Development

### Project Structure

- **api/validation/** - Core validation logic (market, feasibility, competition)
- **api/integrations/** - External services (trends, reddit, crunchbase)
- **api/llm/** - AI services (OpenAI integration)
- **lib/scoring/** - Central validation engine
- **frontend/components/** - React components for UI

### Adding New Integrations

1. Create integration module in `api/integrations/`
2. Add to ValidationEngine constructor
3. Update integration status tracking
4. Add configuration options

### Running Tests

```bash
npm test  # Run unit tests (when implemented)
npm run dev  # Development mode with auto-reload
```

## 🚨 Troubleshooting

### Common Issues

**"Internal Server Error" when validating ideas:**
- Usually caused by OpenAI API quota exceeded
- System automatically falls back to basic analysis
- Check server logs for specific error messages

**"Failed to find competitors":**
- Web scraping may be blocked by some networks
- System continues with text-based competition analysis
- Consider using VPN or different network

**Low validation scores:**
- Provide more detailed descriptions in each section
- Include specific metrics (market size, revenue model)
- Mention team experience and technical background

### Logs and Debugging

Server logs show integration status and fallback usage:
```bash
node server.js
# Look for warnings about failed integrations
```

## 📈 Performance

- **Response Time**: 2-30 seconds depending on enabled integrations
- **Rate Limits**: Built-in delays respect external API limits  
- **Caching**: 15-minute cache for trends data, 30-minute for Reddit
- **Fallbacks**: Graceful degradation when services are unavailable

## 🔒 Security

- API keys stored in environment variables
- Input validation and sanitization
- No sensitive data in error responses
- Rate limiting protection

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality  
4. Submit pull request

---

**Need help?** Check the API documentation at `/api` or create an issue in the repository.