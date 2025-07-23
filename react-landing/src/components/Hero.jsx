import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-6 sm:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
            <svg className="w-4 h-4 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-primary-700 font-inter font-medium text-sm">AI-Powered Startup Validation</span>
          </div>
          
          <h1 className="text-hero sm:text-hero-lg font-inter font-bold text-gray-900 mb-6">
            Validate your startup idea
            <br />
            <span className="text-primary-600">with AI in 30 seconds</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 font-inter font-light max-w-3xl mx-auto leading-relaxed mb-12">
            Get comprehensive analysis on market potential, competition, and viability using 
            GPT-4, Google Trends, and advanced B2B SaaS scoring algorithms.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <a 
            href="/validator"
            className="bg-black text-white px-8 py-4 text-lg font-inter font-medium rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 transform inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Try Free Validation
          </a>
          <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 text-lg font-inter font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v1.5M12 12l2 2m-2-2l2-2m-2 2l-2-2m2 2l-2 2" />
            </svg>
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">30s</div>
            <div className="text-sm text-gray-600 font-inter">Analysis Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">7</div>
            <div className="text-sm text-gray-600 font-inter">Scoring Dimensions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-sm text-gray-600 font-inter">Data Sources</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">97%</div>
            <div className="text-sm text-gray-600 font-inter">Accuracy Rate</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;