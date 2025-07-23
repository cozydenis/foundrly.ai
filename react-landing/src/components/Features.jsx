import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "GPT-4 AI Analysis",
      description: "Advanced natural language processing extracts insights from your startup description, identifying strengths, weaknesses, and opportunities.",
      highlight: "OpenAI GPT-4o-mini"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Real-Time Market Trends",
      description: "Google Trends integration provides live market data, search volumes, and trend analysis for your industry and keywords.",
      highlight: "Google Trends API"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "B2B SaaS Optimization",
      description: "Specialized scoring algorithms designed for B2B, SaaS, and developer tools. Technical complexity becomes a competitive advantage.",
      highlight: "Enhanced B2B Scoring"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Competitive Intelligence",
      description: "Automated competitor research using web scraping and market analysis to identify your competitive landscape and positioning.",
      highlight: "Web Intelligence"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "7-Dimension Scoring",
      description: "Comprehensive analysis across Problem Clarity, Market Potential, Feasibility, Technical Complexity, Monetization, Time to Market, and Competition.",
      highlight: "Holistic Assessment"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Results",
      description: "Get comprehensive validation results in under 30 seconds. No lengthy surveys or complex onboarding processes required.",
      highlight: "Lightning Fast"
    }
  ];

  return (
    <section ref={ref} className="py-32 px-6 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
            <span className="text-primary-700 font-inter font-medium text-sm">Powered by Advanced AI</span>
          </div>
          <h2 className="text-display lg:text-display-lg font-inter font-bold text-gray-900 mb-6">
            Everything you need to validate
            <br />
            <span className="text-primary-600">your startup idea</span>
          </h2>
          <p className="text-xl text-gray-600 font-inter font-light max-w-3xl mx-auto leading-relaxed">
            Our AI-powered platform combines multiple data sources and advanced algorithms 
            to give you the most comprehensive startup validation available.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1, 
                ease: "easeOut" 
              }}
              className="group hover:bg-gray-50 p-8 rounded-2xl transition-all duration-300"
            >
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors duration-300">
                {feature.icon}
              </div>
              
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-inter font-medium rounded-full mb-3">
                  {feature.highlight}
                </span>
                <h3 className="text-xl font-inter font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
              </div>
              
              <p className="text-gray-600 font-inter font-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-3xl p-12">
            <h3 className="text-2xl font-inter font-semibold text-gray-900 mb-4">
              Ready to validate your idea?
            </h3>
            <p className="text-gray-600 font-inter mb-8 max-w-2xl mx-auto">
              Join hundreds of entrepreneurs who have already validated their startup ideas with Foundrly's AI-powered analysis.
            </p>
            <a 
              href="/validator"
              className="bg-black text-white px-8 py-4 text-lg font-inter font-medium rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 transform inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Free Validation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;