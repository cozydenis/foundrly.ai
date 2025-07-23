import { motion } from 'framer-motion';
import { useState } from 'react';

const ValidatorHero = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState('simple');
  const [formData, setFormData] = useState({
    description: '',
    problem: '',
    solution: '',
    market: '',
    competition: '',
    team: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'simple') {
      onSubmit({ description: formData.description });
    } else {
      const { description, ...detailedData } = formData;
      onSubmit(detailedData);
    }
  };

  const isFormValid = mode === 'simple' 
    ? formData.description.trim().length > 0
    : formData.problem.trim().length > 0;

  return (
    <section className="min-h-screen flex items-center justify-center px-6 sm:px-8 pt-20">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-hero sm:text-hero-lg font-inter font-medium text-black mb-6">
            Validate your
            <br />
            <span className="text-gray-600">startup idea</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-500 font-inter font-light max-w-2xl mx-auto leading-relaxed">
            Get AI-powered insights on your startup concept with comprehensive market analysis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm"
        >
          {/* Mode Toggle */}
          <div className="flex mb-12 bg-gray-100 rounded-2xl p-2">
            <button
              type="button"
              onClick={() => setMode('simple')}
              className={`flex-1 py-4 px-8 rounded-xl font-inter font-medium transition-all duration-300 ${
                mode === 'simple'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Simple Mode
            </button>
            <button
              type="button"
              onClick={() => setMode('detailed')}
              className={`flex-1 py-4 px-8 rounded-xl font-inter font-medium transition-all duration-300 ${
                mode === 'detailed'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Detailed Mode
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {mode === 'simple' ? (
              <motion.div
                key="simple"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="description" className="block text-lg font-inter font-medium text-black mb-4">
                    Describe your startup idea
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={8}
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all duration-300 resize-none text-lg font-inter"
                    placeholder="I want to build an AI-powered app that helps small restaurants optimize their delivery operations. Most restaurants struggle with managing orders during peak hours, leading to delays and customer complaints. My solution uses predictive algorithms to forecast demand and optimize kitchen workflow..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-3 font-inter">
                    Include the problem, solution, target market, and what makes your approach unique
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detailed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="problem" className="block text-lg font-inter font-medium text-black mb-4">
                      Problem Statement
                    </label>
                    <textarea
                      id="problem"
                      name="problem"
                      rows={5}
                      className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all duration-300 resize-none font-inter"
                      placeholder="What specific problem are you solving? Who faces this problem and why haven't they solved it themselves?"
                      value={formData.problem}
                      onChange={(e) => handleInputChange('problem', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="solution" className="block text-lg font-inter font-medium text-black mb-4">
                      Solution
                    </label>
                    <textarea
                      id="solution"
                      name="solution"
                      rows={5}
                      className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all duration-300 resize-none font-inter"
                      placeholder="How does your solution work? What makes it 10x better than alternatives?"
                      value={formData.solution}
                      onChange={(e) => handleInputChange('solution', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="market" className="block text-lg font-inter font-medium text-black mb-4">
                      Market & Opportunity
                    </label>
                    <textarea
                      id="market"
                      name="market"
                      rows={5}
                      className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all duration-300 resize-none font-inter"
                      placeholder="Market size, target demographics, growth potential. Include specific numbers and metrics."
                      value={formData.market}
                      onChange={(e) => handleInputChange('market', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="competition" className="block text-lg font-inter font-medium text-black mb-4">
                      Competition
                    </label>
                    <textarea
                      id="competition"
                      name="competition"
                      rows={5}
                      className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all duration-300 resize-none font-inter"
                      placeholder="Who are your direct and indirect competitors? What's your competitive advantage?"
                      value={formData.competition}
                      onChange={(e) => handleInputChange('competition', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="team" className="block text-lg font-inter font-medium text-black mb-4">
                    Team & Execution
                  </label>
                  <textarea
                    id="team"
                    name="team"
                    rows={4}
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all duration-300 resize-none font-inter"
                    placeholder="Team background, relevant experience, previous successes. What makes you the right team to execute this?"
                    value={formData.team}
                    onChange={(e) => handleInputChange('team', e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full mt-12 px-12 py-6 bg-black text-white text-xl font-inter font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              whileHover={{ scale: isFormValid && !isLoading ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid && !isLoading ? 0.98 : 1 }}
            >
              {isLoading ? 'Analyzing...' : 'Validate My Idea'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ValidatorHero;