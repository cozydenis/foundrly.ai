import React, { useState, useEffect } from 'react';

const IdeaValidator = () => {
  const [inputMode, setInputMode] = useState('simple');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    problem: '',
    solution: '',
    market: '',
    competition: '',
    team: ''
  });

  const loadingSteps = [
    { icon: 'fa-brain', text: 'Extracting key components' },
    { icon: 'fa-chart-line', text: 'Analyzing market trends' },
    { icon: 'fa-search', text: 'Finding competitors' },
    { icon: 'fa-calculator', text: 'Calculating scores' }
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let payload;
    if (inputMode === 'simple') {
      if (!formData.description.trim()) {
        setError('Please provide a description of your startup idea.');
        return;
      }
      payload = { description: formData.description };
    } else {
      if (!formData.problem.trim()) {
        setError('Please provide at least a problem statement.');
        return;
      }
      payload = {
        problem: formData.problem,
        solution: formData.solution,
        market: formData.market,
        competition: formData.competition,
        team: formData.team
      };
    }

    setLoading(true);
    setResults(null);
    setError(null);
    setLoadingStep(0);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.message || 'Validation failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      problem: '',
      solution: '',
      market: '',
      competition: '',
      team: ''
    });
    setResults(null);
    setError(null);
    setInputMode('simple');
  };

  const getScoreClass = (score) => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'average';
    if (score >= 2) return 'poor';
    return 'very-poor';
  };

  const getRatingClass = (rating) => {
    return `rating-${rating.toLowerCase().replace(' ', '-')}`;
  };

  const scoreNames = {
    problemClarity: 'Problem Clarity',
    marketPotential: 'Market Potential',
    feasibility: 'Feasibility',
    technicalComplexity: 'Technical Simplicity',
    monetizationViability: 'Monetization',
    timeToMarket: 'Time to Market',
    competition: 'Competition Score'
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <h3>Analyzing Your Idea...</h3>
        <p>This may take up to 30 seconds as we analyze market trends and find competitors</p>
        <div className="loading-steps">
          {loadingSteps.map((step, index) => (
            <div key={index} className={`step ${index === loadingStep ? 'active' : ''}`}>
              <i className={`fas ${step.icon}`}></i> {step.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="results-container">
        <h2><i className="fas fa-chart-bar"></i> Validation Results</h2>
        
        {/* Overall Score */}
        <div className="overall-score">
          <div className="score-circle" style={{
            background: `conic-gradient(from 0deg, ${
              results.scores.overall >= 8 ? '#2ed573' :
              results.scores.overall >= 6 ? '#57D12C' :
              results.scores.overall >= 4 ? '#ffa502' :
              results.scores.overall >= 2 ? '#ff6b6b' : '#ff4757'
            } ${(results.scores.overall / 10) * 360}deg, #e1e5e9 ${(results.scores.overall / 10) * 360}deg)`
          }}>
            <div className="score-value">{results.scores.overall}</div>
            <div className="score-label">Overall Score</div>
          </div>
          <div className={`rating-badge ${getRatingClass(results.rating)}`}>
            <span>{results.rating}</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="score-breakdown">
          <h3>Score Breakdown</h3>
          <div className="scores-grid">
            {Object.entries(results.scores).map(([key, value]) => {
              if (key === 'overall') return null;
              return (
                <div key={key} className={`score-item ${getScoreClass(value)}`}>
                  <div className="score-name">{scoreNames[key] || key}</div>
                  <div className="score-number">{value}/10</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        <div className="feedback-section">
          <h3>Detailed Analysis</h3>
          <div className="feedback-container">
            {/* Overall feedback */}
            {results.feedback.overall && results.feedback.overall.length > 0 && (
              <div className="feedback-category">
                <div className="feedback-title">
                  <i className="fas fa-chart-pie"></i> Overall Assessment
                </div>
                <ul className="feedback-items">
                  {results.feedback.overall.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Detailed feedback */}
            {results.feedback.detailed && Object.entries(results.feedback.detailed).map(([category, items]) => {
              if (!items || items.length === 0) return null;
              
              const categoryNames = {
                problemClarity: 'Problem Statement',
                marketPotential: 'Market Analysis',
                feasibility: 'Implementation Feasibility',
                technicalComplexity: 'Technical Assessment',
                monetizationViability: 'Revenue Model',
                timeToMarket: 'Development Timeline',
                competition: 'Competitive Landscape'
              };
              
              const categoryIcons = {
                problemClarity: 'fas fa-exclamation-triangle',
                marketPotential: 'fas fa-chart-line',
                feasibility: 'fas fa-cogs',
                technicalComplexity: 'fas fa-microchip',
                monetizationViability: 'fas fa-dollar-sign',
                timeToMarket: 'fas fa-clock',
                competition: 'fas fa-users'
              };

              return (
                <div key={category} className="feedback-category">
                  <div className="feedback-title">
                    <i className={categoryIcons[category] || 'fas fa-info-circle'}></i>
                    {categoryNames[category] || category}
                  </div>
                  <ul className="feedback-items">
                    {items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Analysis */}
        <div className="additional-analysis">
          {/* Trends Analysis */}
          {results.trendsAnalysis && results.trendsAnalysis.trendsData && (
            <div className="analysis-card">
              <h4><i className="fas fa-chart-line"></i>Market Trends Analysis</h4>
              <p>Average search interest: <strong>{results.trendsAnalysis.trendsData.avgInterest || 0}</strong></p>
              <div className="trends-list">
                {results.trendsAnalysis.trendsData.trends?.map((trend, index) => (
                  <span key={index} className={`trend-item trend-${trend.trend}`}>
                    {trend.keyword} ({trend.trend})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Analysis */}
          {results.competitorAnalysis && results.competitorAnalysis.competitors && (
            <div className="analysis-card">
              <h4><i className="fas fa-search"></i>Competitor Analysis</h4>
              <p>Found <strong>{results.competitorAnalysis.totalCount}</strong> potential competitors</p>
              {results.competitorAnalysis.competitors.slice(0, 5).length > 0 && (
                <div className="competitors-list">
                  {results.competitorAnalysis.competitors.slice(0, 5).map((competitor, index) => (
                    <span key={index} className="competitor-item">{competitor.domain}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button className="new-validation-btn" onClick={resetForm}>
          <i className="fas fa-plus"></i> Validate Another Idea
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2><i className="fas fa-rocket"></i> Submit Your Idea</h2>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}
      
      <div className="input-mode-toggle">
        <button 
          className={`mode-btn ${inputMode === 'simple' ? 'active' : ''}`}
          onClick={() => setInputMode('simple')}
        >
          Simple Mode
        </button>
        <button 
          className={`mode-btn ${inputMode === 'detailed' ? 'active' : ''}`}
          onClick={() => setInputMode('detailed')}
        >
          Detailed Mode
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {inputMode === 'simple' ? (
          <div className="form-group">
            <label htmlFor="description">
              <i className="fas fa-edit"></i> Describe Your Startup Idea
            </label>
            <textarea
              id="description"
              rows="6"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Example: I want to build an AI-powered app that helps small restaurants optimize their delivery operations. Most restaurants struggle with managing orders during peak hours, leading to delays and customer complaints. My solution uses predictive algorithms to forecast demand and optimize kitchen workflow..."
              required
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="problem">
                <i className="fas fa-exclamation-triangle"></i> Problem Statement
              </label>
              <textarea
                id="problem"
                rows="3"
                value={formData.problem}
                onChange={(e) => handleInputChange('problem', e.target.value)}
                placeholder="What specific problem are you solving? Who faces this problem?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="solution">
                <i className="fas fa-cogs"></i> Solution
              </label>
              <textarea
                id="solution"
                rows="3"
                value={formData.solution}
                onChange={(e) => handleInputChange('solution', e.target.value)}
                placeholder="How does your solution solve the problem? What makes it unique?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="market">
                <i className="fas fa-chart-line"></i> Market & Opportunity
              </label>
              <textarea
                id="market"
                rows="3"
                value={formData.market}
                onChange={(e) => handleInputChange('market', e.target.value)}
                placeholder="Who is your target market? How big is the opportunity?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="competition">
                <i className="fas fa-users"></i> Competition
              </label>
              <textarea
                id="competition"
                rows="2"
                value={formData.competition}
                onChange={(e) => handleInputChange('competition', e.target.value)}
                placeholder="Who are your competitors? What's your competitive advantage?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="team">
                <i className="fas fa-user-friends"></i> Team
              </label>
              <textarea
                id="team"
                rows="2"
                value={formData.team}
                onChange={(e) => handleInputChange('team', e.target.value)}
                placeholder="Tell us about your team's background and expertise"
              />
            </div>
          </>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          <i className="fas fa-search"></i> Validate My Idea
        </button>
      </form>
    </div>
  );
};

export default IdeaValidator;