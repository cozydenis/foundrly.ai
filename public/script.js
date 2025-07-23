// DOM Elements
const simpleModeBtn = document.getElementById('simple-mode');
const detailedModeBtn = document.getElementById('detailed-mode');
const simpleForm = document.getElementById('simple-form');
const detailedForm = document.getElementById('detailed-form');
const ideaForm = document.getElementById('idea-form');
const inputSection = document.querySelector('.input-section');
const resultsSection = document.getElementById('results-section');
const loadingSection = document.getElementById('loading-section');

// Mode switching
simpleModeBtn.addEventListener('click', () => switchMode('simple'));
detailedModeBtn.addEventListener('click', () => switchMode('detailed'));

function switchMode(mode) {
    const descriptionField = document.getElementById('description');
    
    if (mode === 'simple') {
        simpleModeBtn.classList.add('active');
        detailedModeBtn.classList.remove('active');
        simpleForm.classList.add('active');
        detailedForm.classList.remove('active');
        
        // Make description field required in simple mode
        descriptionField.setAttribute('required', 'true');
    } else {
        detailedModeBtn.classList.add('active');
        simpleModeBtn.classList.remove('active');
        detailedForm.classList.add('active');
        simpleForm.classList.remove('active');
        
        // Remove required attribute from description field in detailed mode
        descriptionField.removeAttribute('required');
    }
}

// Form submission
ideaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Get form data based on active mode
    if (simpleModeBtn.classList.contains('active')) {
        data.description = formData.get('description');
        if (!data.description?.trim()) {
            showError('Please provide a description of your startup idea.');
            return;
        }
    } else {
        data.problem = formData.get('problem');
        data.solution = formData.get('solution');
        data.market = formData.get('market');
        data.competition = formData.get('competition');
        data.team = formData.get('team');
        
        if (!data.problem?.trim()) {
            showError('Please provide at least a problem statement.');
            return;
        }
    }
    
    await submitValidation(data);
});

async function submitValidation(data) {
    // Show loading state
    showLoading();
    
    // Animate loading steps
    animateLoadingSteps();
    
    try {
        const response = await fetch('/api/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result.data);
        } else {
            showError(result.message || 'Validation failed. Please try again.');
        }
    } catch (error) {
        console.error('Validation error:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

function showLoading() {
    inputSection.style.display = 'none';
    resultsSection.style.display = 'none';
    loadingSection.style.display = 'block';
    
    // Reset loading steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    steps[0].classList.add('active');
}

function animateLoadingSteps() {
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length - 1) {
            steps[currentStep].classList.remove('active');
            currentStep++;
            steps[currentStep].classList.add('active');
        } else {
            clearInterval(interval);
        }
    }, 3000);
}

function displayResults(data) {
    // Hide loading, show results
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    
    // Display overall score
    displayOverallScore(data.scores.overall, data.rating);
    
    // Display score breakdown
    displayScoreBreakdown(data.scores);
    
    // Display feedback
    displayFeedback(data.feedback);
    
    // Display additional analysis
    displayAdditionalAnalysis(data);
}

function displayOverallScore(score, rating) {
    const scoreElement = document.getElementById('overall-score');
    const ratingElement = document.getElementById('rating-text');
    const ratingBadge = document.getElementById('rating-badge');
    
    // Animate score counting
    animateScore(scoreElement, score);
    
    // Set rating
    ratingElement.textContent = rating;
    ratingBadge.className = `rating-badge rating-${rating.toLowerCase().replace(' ', '-')}`;
    
    // Update score circle color based on score
    const scoreCircle = document.querySelector('.score-circle');
    const percentage = (score / 10) * 100;
    
    let color;
    if (score >= 8) color = '#2ed573';
    else if (score >= 6) color = '#57D12C';
    else if (score >= 4) color = '#ffa502';
    else if (score >= 2) color = '#ff6b6b';
    else color = '#ff4757';
    
    scoreCircle.style.background = `conic-gradient(from 0deg, ${color} ${percentage * 3.6}deg, #e1e5e9 ${percentage * 3.6}deg)`;
}

function animateScore(element, targetScore) {
    let currentScore = 0;
    const increment = targetScore / 50;
    
    const animation = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }
        element.textContent = currentScore.toFixed(1);
    }, 30);
}

function displayScoreBreakdown(scores) {
    const scoresGrid = document.getElementById('scores-grid');
    scoresGrid.innerHTML = '';
    
    const scoreNames = {
        problemClarity: 'Problem Clarity',
        marketPotential: 'Market Potential',
        feasibility: 'Feasibility',
        technicalComplexity: 'Technical Simplicity',
        monetizationViability: 'Monetization',
        timeToMarket: 'Time to Market',
        competition: 'Competition Score'
    };
    
    Object.entries(scores).forEach(([key, value]) => {
        if (key === 'overall') return;
        
        const scoreItem = document.createElement('div');
        scoreItem.className = `score-item ${getScoreClass(value)}`;
        scoreItem.style.setProperty('--score-width', `${(value / 10) * 100}%`);
        
        scoreItem.innerHTML = `
            <div class="score-name">${scoreNames[key] || key}</div>
            <div class="score-number">${value}/10</div>
        `;
        
        scoresGrid.appendChild(scoreItem);
        
        // Animate score bar
        setTimeout(() => {
            scoreItem.style.setProperty('--score-width', `${(value / 10) * 100}%`);
        }, 100);
    });
}

function displayFeedback(feedback) {
    const feedbackContainer = document.getElementById('feedback-container');
    feedbackContainer.innerHTML = '';
    
    // Overall feedback
    if (feedback.overall && feedback.overall.length > 0) {
        const overallCard = document.createElement('div');
        overallCard.className = 'feedback-category';
        overallCard.innerHTML = `
            <div class="feedback-title">
                <i class="fas fa-chart-pie"></i>
                Overall Assessment
            </div>
            <ul class="feedback-items">
                ${feedback.overall.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        feedbackContainer.appendChild(overallCard);
    }
    
    // Detailed feedback
    if (feedback.detailed) {
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
        
        Object.entries(feedback.detailed).forEach(([category, items]) => {
            if (items && items.length > 0) {
                const categoryCard = document.createElement('div');
                categoryCard.className = 'feedback-category';
                categoryCard.innerHTML = `
                    <div class="feedback-title">
                        <i class="${categoryIcons[category] || 'fas fa-info-circle'}"></i>
                        ${categoryNames[category] || category}
                    </div>
                    <ul class="feedback-items">
                        ${items.map(item => `<li class="${getFeedbackClass(item)}">${item}</li>`).join('')}
                    </ul>
                `;
                feedbackContainer.appendChild(categoryCard);
            }
        });
    }
}

function displayAdditionalAnalysis(data) {
    const analysisContainer = document.getElementById('additional-analysis');
    analysisContainer.innerHTML = '';
    
    // Trends analysis
    if (data.trendsAnalysis && data.trendsAnalysis.trendsData) {
        const trendsCard = document.createElement('div');
        trendsCard.className = 'analysis-card';
        
        const trends = data.trendsAnalysis.trendsData.trends;
        const trendsHtml = trends.map(trend => 
            `<span class="trend-item trend-${trend.trend}">${trend.keyword} (${trend.trend})</span>`
        ).join('');
        
        trendsCard.innerHTML = `
            <h4><i class="fas fa-chart-line"></i>Market Trends Analysis</h4>
            <p>Average search interest: <strong>${data.trendsAnalysis.trendsData.avgInterest || 0}</strong></p>
            <div class="trends-list">${trendsHtml}</div>
        `;
        
        analysisContainer.appendChild(trendsCard);
    }
    
    // Competitor analysis
    if (data.competitorAnalysis && data.competitorAnalysis.competitors) {
        const competitorCard = document.createElement('div');
        competitorCard.className = 'analysis-card';
        
        const competitors = data.competitorAnalysis.competitors.slice(0, 5);
        const competitorsHtml = competitors.map(competitor => 
            `<span class="competitor-item">${competitor.domain}</span>`
        ).join('');
        
        competitorCard.innerHTML = `
            <h4><i class="fas fa-search"></i>Competitor Analysis</h4>
            <p>Found <strong>${data.competitorAnalysis.totalCount}</strong> potential competitors</p>
            ${competitors.length > 0 ? `<div class="competitors-list">${competitorsHtml}</div>` : ''}
        `;
        
        analysisContainer.appendChild(competitorCard);
    }
}

function getScoreClass(score) {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'average';
    if (score >= 2) return 'poor';
    return 'very-poor';
}

function getFeedbackClass(feedback) {
    const positive = ['excellent', 'strong', 'good', 'positive', 'favorable', 'high'];
    const negative = ['poor', 'weak', 'low', 'concerns', 'challenges', 'needs', 'requires'];
    
    const feedbackLower = feedback.toLowerCase();
    
    if (positive.some(word => feedbackLower.includes(word))) {
        return 'positive';
    }
    if (negative.some(word => feedbackLower.includes(word))) {
        return 'negative';
    }
    return '';
}

function showError(message) {
    loadingSection.style.display = 'none';
    
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
    `;
    
    // Insert error message before form
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(errorDiv, formContainer.firstChild);
    
    // Auto-remove error after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

function resetForm() {
    // Clear form
    ideaForm.reset();
    
    // Remove error messages
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    
    // Show input section, hide results
    inputSection.style.display = 'block';
    resultsSection.style.display = 'none';
    loadingSection.style.display = 'none';
    
    // Reset to simple mode (this will also handle the required attribute)
    switchMode('simple');
}

// Auto-resize textareas
document.addEventListener('DOMContentLoaded', () => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    });
});