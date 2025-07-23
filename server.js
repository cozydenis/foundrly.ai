require('dotenv').config();
const express = require('express');
const path = require('path');
const ValidationEngine = require('./lib/scoring/ValidationEngine');

const app = express();
const port = process.env.PORT || 3000;
const validationEngine = new ValidationEngine();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve marketing landing page
app.use('/marketing', express.static(path.join(__dirname, 'react-landing/build')));

// Landing page redirects
app.get('/landing', (req, res) => {
  res.redirect('/marketing');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    integrations: validationEngine.getIntegrationStatus()
  });
});

// Main validation endpoint
app.post('/api/validate', async (req, res) => {
  try {
    const { description, problem, solution, market, competition, team } = req.body;
    
    // Prepare input based on provided data
    let input;
    if (description) {
      input = description;
    } else if (problem) {
      input = { problem, solution, market, competition, team };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either "description" (plain text) or "problem" (structured data) is required'
      });
    }
    
    // Run validation
    const result = await validationEngine.validateIdea(input);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Integration status endpoint
app.get('/api/integrations', (req, res) => {
  res.json({
    status: validationEngine.getIntegrationStatus(),
    timestamp: Date.now()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Foundrly MVP - Startup Idea Validator API',
    version: '1.0.0',
    description: 'AI-powered validation for startup ideas with comprehensive market analysis',
    endpoints: {
      'GET /api': 'API documentation',
      'GET /api/health': 'Health check with integration status',
      'GET /api/integrations': 'Integration status details',
      'POST /api/validate': 'Validate a startup idea (accepts plain text or structured data)'
    },
    integrations: {
      'OpenAI GPT-4o-mini': 'Idea component extraction and keyword analysis',
      'Google Trends': 'Market trend analysis',
      'Web Scraping': 'Competitor research',
      'Reddit API': 'Sentiment analysis (optional)',
      'Crunchbase API': 'Startup ecosystem data (optional)'
    },
    examples: {
      plainText: {
        endpoint: 'POST /api/validate',
        body: {
          description: 'I want to build an app that helps small restaurants manage their inventory better. Most restaurants waste a lot of food and lose money because they don\'t track their ingredients properly. My solution is a simple mobile app that lets restaurant owners scan barcodes and track expiration dates.'
        }
      },
      structuredData: {
        endpoint: 'POST /api/validate',
        body: {
          problem: 'Small restaurants struggle to manage inventory efficiently',
          solution: 'A simple mobile app that tracks inventory in real-time',
          market: 'There are 600,000 restaurants in the US with growing demand for efficiency tools',
          competition: 'Few competitors focus specifically on small restaurant needs',
          team: 'Experienced restaurant management and mobile app developers'
        }
      }
    },
    scoring: {
      dimensions: [
        'Problem Clarity (0-10)',
        'Market Potential (0-10)',
        'Implementation Feasibility (0-10)', 
        'Technical Complexity (0-10, higher = simpler)',
        'Monetization Viability (0-10)',
        'Time to Market (0-10, higher = faster)',
        'Competition Score (0-10, higher = less competitive)'
      ],
      ratings: ['Excellent (8-10)', 'Good (6-8)', 'Average (4-6)', 'Poor (2-4)', 'Very Poor (0-2)']
    }
  });
});

// Main routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve React validator static assets first (before routes)
app.use('/validator', express.static(path.join(__dirname, 'react-validator/build')));

// Serve React landing static assets
app.use('/landing', express.static(path.join(__dirname, 'react-llama/build')));

// Validator SPA route - catch all validator/* routes
app.get('/validator/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react-validator/build', 'index.html'));
});

// Landing page SPA route - catch all landing/* routes
app.get('/landing/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react-llama/build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Foundrly MVP - Startup Idea Validator`);
  console.log(`🌐 Server running on port ${port}`);
  console.log(`📊 API Documentation: http://localhost:${port}/api`);
  console.log(`🔍 Validation Endpoint: http://localhost:${port}/api/validate`);
  console.log(`💻 Web Interface: http://localhost:${port}`);
  
  // Log integration status
  const integrationStatus = validationEngine.getIntegrationStatus();
  console.log('\n🔧 Integration Status:');
  Object.entries(integrationStatus).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        console.log(`   ${subKey}: ${subValue ? '✅' : '❌'}`);
      });
    } else {
      console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    }
  });
  console.log('');
});

module.exports = app;