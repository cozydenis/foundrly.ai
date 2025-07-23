import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ValidatorHero from './components/ValidatorHero';
import LoadingState from './components/LoadingState';
import ValidationResults from './components/ValidationResults';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [currentState, setCurrentState] = useState('input'); // 'input', 'loading', 'results'
  const [validationResults, setValidationResults] = useState(null);

  const handleValidationSubmit = async (formData) => {
    setCurrentState('loading');
    
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setValidationResults(data.data);
        setCurrentState('results');
      } else {
        throw new Error(data.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      // Handle error state - for now, return to input
      setCurrentState('input');
      alert('Sorry, there was an error processing your validation. Please try again.');
    }
  };

  const handleNewValidation = () => {
    setCurrentState('input');
    setValidationResults(null);
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="min-h-screen bg-gray-50"
        >
        {/* Simple Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-inter font-medium text-black">Foundrly</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-inter font-medium">
                  Validator
                </span>
              </div>
              <a 
                href="/" 
                className="text-gray-600 hover:text-black transition-colors duration-200 font-inter font-medium"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        {currentState === 'input' && (
          <ValidatorHero 
            onSubmit={handleValidationSubmit}
            isLoading={false}
          />
        )}

        {currentState === 'loading' && <LoadingState />}

        {currentState === 'results' && validationResults && (
          <ValidationResults 
            results={validationResults}
            onNewValidation={handleNewValidation}
          />
        )}
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}

export default App;