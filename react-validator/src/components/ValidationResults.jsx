import { motion } from 'framer-motion';

const ValidationResults = ({ results, onNewValidation }) => {
  // Safety check for results
  if (!results || typeof results !== 'object') {
    return (
      <section className="py-32 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm">
            <h2 className="text-2xl font-inter font-medium text-black mb-4">
              Validation Error
            </h2>
            <p className="text-gray-600 font-inter mb-8">
              Sorry, there was an error processing your validation results. Please try again.
            </p>
            <button
              onClick={onNewValidation}
              className="bg-black text-white px-8 py-3 text-lg font-inter font-medium rounded-full hover:bg-gray-800 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const getScoreColor = (score) => {
    const safeScore = Number(score) || 0;
    if (safeScore >= 8) return 'text-score-excellent';
    if (safeScore >= 6) return 'text-score-good';
    if (safeScore >= 4) return 'text-score-average';
    if (safeScore >= 2) return 'text-score-poor';
    return 'text-score-very-poor';
  };

  const getScoreBgColor = (score) => {
    const safeScore = Number(score) || 0;
    if (safeScore >= 8) return 'bg-score-excellent';
    if (safeScore >= 6) return 'bg-score-good';
    if (safeScore >= 4) return 'bg-score-average';
    if (safeScore >= 2) return 'bg-score-poor';
    return 'bg-score-very-poor';
  };

  const getRatingText = (score) => {
    const safeScore = Number(score) || 0;
    if (safeScore >= 8) return 'Excellent';
    if (safeScore >= 6) return 'Good';
    if (safeScore >= 4) return 'Average';
    if (safeScore >= 2) return 'Poor';
    return 'Very Poor';
  };

  // Safe access to results properties - backend returns scores.overall not overall_score
  const overallScore = Number(results.scores?.overall) || 0;
  const scores = results.scores || {};
  const feedback = results.feedback || {};

  return (
    <section className="py-32 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-display lg:text-display-lg font-inter font-medium text-black mb-6">
            Validation Results
          </h2>
          <p className="text-xl text-gray-500 font-inter font-light">
            Here's what our AI analysis discovered about your startup idea
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm mb-12"
        >
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white ${getScoreBgColor(overallScore)}`}>
                <div className="text-center">
                  <div className="text-4xl font-inter font-bold">{overallScore.toFixed(1)}</div>
                  <div className="text-sm opacity-90">out of 10</div>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-3xl font-inter font-medium text-black mb-2">
                {getRatingText(overallScore)} Startup Idea
              </h3>
              <p className="text-xl text-gray-600 font-inter font-light">
                Your idea shows {overallScore >= 6 ? 'strong' : 'moderate'} potential in our analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm mb-12"
        >
          <h3 className="text-2xl font-inter font-medium text-black mb-8 text-center">
            Score Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(scores)
              .filter(([key]) => key !== 'overall') // Exclude overall score since it's shown separately
              .map(([key, score], index) => {
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const safeScore = Number(score) || 0;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index, ease: "easeOut" }}
                    className="text-center"
                  >
                    <div className={`text-4xl font-inter font-bold mb-2 ${getScoreColor(safeScore)}`}>
                      {safeScore.toFixed(1)}
                    </div>
                    <div className="text-gray-800 font-inter font-medium mb-1">
                      {formattedKey}
                    </div>
                    <div className="text-sm text-gray-500 font-inter">
                      {getRatingText(safeScore)}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>

        {/* AI Feedback */}
        {(feedback.overall || feedback.detailed) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm mb-12"
          >
            <h3 className="text-2xl font-inter font-medium text-black mb-8 text-center">
              AI Analysis
            </h3>
            <div className="space-y-8">
              {/* Overall Feedback */}
              {feedback.overall && Array.isArray(feedback.overall) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="border-l-4 border-gray-200 pl-6"
                >
                  <h4 className="text-xl font-inter font-medium text-black mb-3">
                    Overall Assessment
                  </h4>
                  <div className="space-y-3">
                    {feedback.overall.map((text, idx) => (
                      <p key={idx} className="text-gray-700 font-inter font-light leading-relaxed whitespace-pre-line">
                        {text}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Detailed Feedback */}
              {feedback.detailed && Object.entries(feedback.detailed).map(([category, feedbackArray], index) => {
                const formattedCategory = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index, ease: "easeOut" }}
                    className="border-l-4 border-gray-200 pl-6"
                  >
                    <h4 className="text-xl font-inter font-medium text-black mb-3">
                      {formattedCategory}
                    </h4>
                    <div className="space-y-2">
                      {Array.isArray(feedbackArray) ? 
                        feedbackArray.map((text, idx) => (
                          <p key={idx} className="text-gray-700 font-inter font-light leading-relaxed">
                            {text}
                          </p>
                        )) :
                        <p className="text-gray-700 font-inter font-light leading-relaxed">
                          {feedbackArray}
                        </p>
                      }
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Additional Analysis */}
        {(results.trendsAnalysis || results.competitorAnalysis) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm mb-12"
          >
            <h3 className="text-2xl font-inter font-medium text-black mb-8 text-center">
              Market Intelligence
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {results.trendsAnalysis && (
                <div>
                  <h4 className="text-xl font-inter font-medium text-black mb-6">
                    Market Trends
                  </h4>
                  <div className="space-y-4">
                    {results.trendsAnalysis.keywords && results.trendsAnalysis.keywords.map((keyword, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <span className="text-gray-700 font-inter capitalize">{keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {results.competitorAnalysis && (
                <div>
                  <h4 className="text-xl font-inter font-medium text-black mb-6">
                    Competitor Analysis
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700 font-inter">
                        {results.competitorAnalysis.totalCount} competitors found
                      </span>
                    </div>
                    {results.competitorAnalysis.competitors && results.competitorAnalysis.competitors.slice(0, 5).map((competitor, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-700 font-inter">{competitor}</span>
                      </div>
                    ))}
                    {results.competitorAnalysis.competitors && results.competitorAnalysis.competitors.length === 0 && (
                      <p className="text-gray-500 font-inter italic">No direct competitors identified</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* New Validation Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="text-center"
        >
          <button
            onClick={onNewValidation}
            className="bg-black text-white px-10 py-4 text-lg font-inter font-medium rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-105 transform"
          >
            Validate Another Idea
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ValidationResults;