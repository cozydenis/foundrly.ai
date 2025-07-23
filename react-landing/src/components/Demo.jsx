import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Demo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 sm:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-accent-50 border border-accent-200 rounded-full mb-8">
            <svg className="w-4 h-4 text-accent-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-accent-700 font-inter font-medium text-sm">See Foundrly in Action</span>
          </div>
          <h2 className="text-display lg:text-display-lg font-inter font-bold text-gray-900 mb-6">
            From idea to insights
            <br />
            <span className="text-accent-600">in 30 seconds</span>
          </h2>
          <p className="text-xl text-gray-600 font-inter font-light max-w-3xl mx-auto leading-relaxed">
            Watch how Foundrly transforms a simple startup description into comprehensive, 
            actionable insights using advanced AI and real-time market data.
          </p>
        </motion.div>

        {/* Demo Screenshots/Flow */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1 - Input */}
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                <div className="bg-gray-50 rounded-xl p-6 mb-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <div className="text-left">
                      <div className="text-sm text-gray-500 mb-2">Startup Description</div>
                      <div className="text-gray-800 text-sm leading-relaxed">
                        "I want to build an AI-powered app that helps small restaurants optimize their delivery operations..."
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium">
                    Validate My Idea
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-lg font-inter font-semibold text-gray-900 mb-2">
                Describe Your Idea
              </h3>
              <p className="text-gray-600 font-inter text-sm">
                Simply describe your startup in plain English. No complex forms or lengthy questionnaires.
              </p>
            </div>

            {/* Step 2 - Processing */}
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 mb-4">
                  <div className="animate-float">
                    <svg className="w-12 h-12 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">🔍 Analyzing market trends...</div>
                    <div className="text-xs text-gray-600">🤖 Running AI analysis...</div>
                    <div className="text-xs text-gray-600">📊 Calculating scores...</div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="text-xs text-gray-500">Processing... 25s remaining</div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-lg font-inter font-semibold text-gray-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600 font-inter text-sm">
                Our AI processes your idea through 500+ data sources including Google Trends and competitive intelligence.
              </p>
            </div>

            {/* Step 3 - Results */}
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center">
                      <span className="text-lg font-bold">7.2</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-3">Good Startup Idea</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded p-2">
                      <div className="text-green-600 font-semibold">8.1</div>
                      <div className="text-gray-500">Market</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-blue-600 font-semibold">6.8</div>
                      <div className="text-gray-500">Feasibility</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-purple-600 font-semibold">7.5</div>
                      <div className="text-gray-500">Competition</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-orange-600 font-semibold">6.4</div>
                      <div className="text-gray-500">Technical</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-lg font-inter font-semibold text-gray-900 mb-2">
                Comprehensive Results
              </h3>
              <p className="text-gray-600 font-inter text-sm">
                Get detailed scores, AI feedback, market trends, and actionable recommendations for your startup.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <div className="bg-black rounded-3xl p-12 text-white">
            <h3 className="text-2xl font-inter font-bold mb-4">
              Ready to see your results?
            </h3>
            <p className="text-gray-300 font-inter mb-8 max-w-2xl mx-auto">
              Experience the power of AI-driven startup validation. Get comprehensive insights 
              that help you make confident decisions about your business idea.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/validator"
                className="bg-white text-black px-8 py-4 text-lg font-inter font-medium rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Validate Your Idea Now
              </a>
              <button className="border-2 border-gray-600 text-gray-300 px-8 py-4 text-lg font-inter font-medium rounded-xl hover:border-gray-400 hover:text-white transition-all duration-300 inline-flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Watch Full Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Demo;