import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "first validation",
      description: "Perfect for testing Foundrly with your first startup idea",
      features: [
        "1 free startup validation",
        "Complete 7-dimension scoring",
        "AI-powered analysis with GPT-4",
        "Google Trends market data",
        "Basic competitive intelligence",
        "Downloadable PDF report"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50",
      popular: false
    },
    {
      name: "Pay-Per-Validation",
      price: "$9",
      period: "per validation",
      description: "Ideal for entrepreneurs validating multiple ideas or iterating on concepts",
      features: [
        "Unlimited startup validations",
        "Advanced AI analysis & feedback", 
        "Real-time market trend analysis",
        "Comprehensive competitor research",
        "B2B SaaS specialized scoring",
        "Priority processing (10s faster)",
        "Email support",
        "30-day result history"
      ],
      buttonText: "Validate Now",
      buttonStyle: "bg-black text-white hover:bg-gray-800",
      popular: true
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "For serious entrepreneurs, consultants, and small investment firms",
      features: [
        "Unlimited validations",
        "Premium AI analysis with GPT-4",
        "Advanced market intelligence",
        "Startup ecosystem insights",
        "White-label PDF reports",
        "API access for integrations",
        "Priority support",
        "Custom scoring weights",
        "Team collaboration (up to 5 users)"
      ],
      buttonText: "Start Professional",
      buttonStyle: "bg-primary-600 text-white hover:bg-primary-700",
      popular: false,
      badge: "Best Value"
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
          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-8">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-green-700 font-inter font-medium text-sm">Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-display lg:text-display-lg font-inter font-bold text-gray-900 mb-6">
            Choose your validation plan
          </h2>
          <p className="text-xl text-gray-600 font-inter font-light max-w-3xl mx-auto leading-relaxed">
            Start with a free validation to experience the power of AI-driven startup analysis. 
            No hidden fees, no long-term commitments.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2, 
                ease: "easeOut" 
              }}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-black shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-inter font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              {plan.badge && (
                <div className="absolute -top-4 right-8">
                  <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-inter font-medium">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-inter font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-inter font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 font-inter ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-600 font-inter font-light text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 font-inter text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-4 px-6 rounded-xl font-inter font-medium transition-all duration-300 hover:scale-105 transform ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl p-8">
            <h3 className="text-xl font-inter font-semibold text-gray-900 mb-4">
              Need a custom solution?
            </h3>
            <p className="text-gray-600 font-inter mb-6">
              We offer enterprise solutions for accelerators, investment firms, and large organizations. 
              Contact us for volume pricing and custom integrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="border-2 border-gray-300 text-gray-700 px-6 py-3 font-inter font-medium rounded-xl hover:border-gray-400 hover:bg-white transition-all duration-300">
                Contact Sales
              </button>
              <button className="text-primary-600 px-6 py-3 font-inter font-medium rounded-xl hover:bg-primary-50 transition-all duration-300">
                View Enterprise Features
              </button>
            </div>
          </div>
        </motion.div>

        {/* Money-back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center text-sm text-gray-600 font-inter">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            30-day money-back guarantee on all paid plans
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;