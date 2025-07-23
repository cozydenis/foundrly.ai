import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const LoadingState = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Analyzing concept",
      description: "Breaking down your idea into key components"
    },
    {
      title: "Market research", 
      description: "Gathering intelligence from market trends and data"
    },
    {
      title: "Competitive analysis",
      description: "Identifying competitors and market positioning"
    },
    {
      title: "Calculating scores",
      description: "Running validation algorithms and final assessment"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white border border-gray-200 rounded-3xl p-16 shadow-sm"
        >
          {/* Loading Animation */}
          <div className="relative mb-12">
            <motion.div
              className="w-24 h-24 rounded-3xl bg-black mx-auto flex items-center justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-3xl lg:text-4xl font-inter font-medium text-black mb-6"
          >
            Analyzing your startup idea
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="text-xl text-gray-500 font-inter font-light mb-16"
          >
            This process takes 20-30 seconds as we analyze multiple data sources
          </motion.p>

          {/* Progress Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.3,
                  x: 0,
                  scale: index === currentStep ? 1.02 : 1
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className={`flex items-center justify-center space-x-4 p-4 rounded-2xl transition-all duration-500 ${
                  index === currentStep 
                    ? 'bg-gray-50 border border-gray-200' 
                    : ''
                }`}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    index <= currentStep 
                      ? 'bg-black text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-inter font-medium">{index + 1}</span>
                  )}
                </motion.div>
                <div className="text-left">
                  <div className={`font-inter font-medium transition-all duration-500 ${
                    index <= currentStep ? 'text-black' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-sm font-inter font-light transition-all duration-500 ${
                    index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-12 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-black rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-500 font-inter">
            Step {currentStep + 1} of {steps.length}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoadingState;