import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      title: "Describe Your Startup",
      description: "Simply enter your startup idea in plain English. No complex forms or lengthy questionnaires - just tell us about your business concept, target market, and key features.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      highlight: "Natural Language Input"
    },
    {
      number: "02", 
      title: "AI-Powered Analysis",
      description: "Our advanced AI processes your idea through GPT-4, analyzes market trends with Google Trends, performs competitive research, and applies specialized B2B SaaS scoring algorithms.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      highlight: "Multi-Source Intelligence"
    },
    {
      number: "03",
      title: "Comprehensive Results",
      description: "Receive detailed scores across 7 dimensions, AI-generated feedback, market trend analysis, competitive landscape insights, and actionable recommendations for your startup.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      highlight: "Actionable Insights"
    }
  ];

  const dimensions = [
    { name: "Problem Clarity", description: "How well-defined and urgent is the problem you're solving?" },
    { name: "Market Potential", description: "Size and growth potential of your target market" },
    { name: "Feasibility", description: "Technical and operational viability of your solution" },
    { name: "Technical Complexity", description: "For B2B: Higher complexity often means competitive advantage" },
    { name: "Monetization", description: "Clarity and potential of your revenue model" },
    { name: "Time to Market", description: "Speed of development and launch timeline" },
    { name: "Competition", description: "Competitive landscape and differentiation opportunities" }
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
          <div className="inline-flex items-center px-4 py-2 bg-accent-50 border border-accent-200 rounded-full mb-8">
            <svg className="w-4 h-4 text-accent-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-accent-700 font-inter font-medium text-sm">Simple 3-Step Process</span>
          </div>
          <h2 className="text-display lg:text-display-lg font-inter font-bold text-gray-900 mb-6">
            How Foundrly works
          </h2>
          <p className="text-xl text-gray-600 font-inter font-light max-w-3xl mx-auto leading-relaxed">
            Get comprehensive startup validation in three simple steps. Our AI-powered platform 
            does the heavy lifting while you focus on building your business.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2, 
                ease: "easeOut" 
              }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-12 h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform translate-x-6"></div>
              )}
              
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                    <div className="text-primary-600">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center font-inter font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-inter font-medium rounded-full mb-4">
                    {step.highlight}
                  </span>
                  <h3 className="text-2xl font-inter font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 font-inter font-light leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 7 Dimensions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-inter font-bold text-gray-900 mb-4">
              7-Dimension Scoring Framework
            </h3>
            <p className="text-gray-600 font-inter max-w-2xl mx-auto">
              Our comprehensive analysis evaluates your startup across these critical dimensions, 
              each weighted for maximum predictive accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dimensions.map((dimension, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1 + (index * 0.1), 
                  ease: "easeOut" 
                }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-inter font-semibold text-gray-900 mb-2">
                      {dimension.name}
                    </h4>
                    <p className="text-sm text-gray-600 font-inter font-light leading-relaxed">
                      {dimension.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="text-center mt-20"
        >
          <h3 className="text-2xl font-inter font-bold text-gray-900 mb-4">
            Ready to validate your startup idea?
          </h3>
          <p className="text-gray-600 font-inter mb-8 max-w-2xl mx-auto">
            Join hundreds of entrepreneurs who have already received comprehensive insights 
            about their startup ideas with Foundrly's AI-powered validation.
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
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;