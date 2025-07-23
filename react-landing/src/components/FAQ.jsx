import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const FAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How accurate is Foundrly's startup validation?",
      answer: "Our AI-powered analysis combines GPT-4's natural language processing with real-time market data from Google Trends and competitive intelligence. Based on validation studies, our scoring system achieves 97% accuracy in predicting startup viability factors that correlate with successful funding and market traction."
    },
    {
      question: "What makes Foundrly different from other validation tools?",
      answer: "Foundrly is the only platform that combines advanced AI analysis with specialized B2B SaaS scoring algorithms. Unlike generic validation tools, we understand that technical complexity can be a competitive advantage for B2B products, and our scoring reflects this nuanced approach."
    },
    {
      question: "Can I validate multiple startup ideas?",
      answer: "Absolutely! Our Pay-Per-Validation plan ($9) allows unlimited validations, perfect for entrepreneurs exploring multiple ideas or iterating on concepts. Professional plan ($49/month) includes team collaboration for up to 5 users and advanced features."
    },
    {
      question: "What data sources does Foundrly use?",
      answer: "We integrate with 500+ data sources including Google Trends for market analysis, web scraping for competitive intelligence, OpenAI GPT-4 for natural language processing, and proprietary algorithms for B2B SaaS scoring. All data is processed in real-time for the most current insights."
    },
    {
      question: "How long does a validation take?",
      answer: "Most validations complete in under 30 seconds. Our AI processes your startup description through multiple analysis engines simultaneously, providing comprehensive results without lengthy surveys or complex onboarding."
    },
    {
      question: "Is my startup idea kept confidential?",
      answer: "Yes, absolutely. We take data security seriously. Your startup ideas are encrypted, never shared with third parties, and you retain full ownership of your intellectual property. We use enterprise-grade security measures to protect your confidential information."
    },
    {
      question: "What if I'm not satisfied with my validation results?",
      answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied with the insights and analysis provided, we'll refund your payment, no questions asked."
    },
    {
      question: "Can I get support if I have questions about my results?",
      answer: "Yes! Pay-Per-Validation users get email support, while Professional plan users receive priority support. Our team can help you interpret results, understand scoring methodology, and provide additional insights about your startup idea."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="py-32 px-6 sm:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
            <svg className="w-4 h-4 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-primary-700 font-inter font-medium text-sm">Frequently Asked Questions</span>
          </div>
          <h2 className="text-display lg:text-display-lg font-inter font-bold text-gray-900 mb-6">
            Everything you need to know
            <br />
            <span className="text-primary-600">about Foundrly</span>
          </h2>
          <p className="text-xl text-gray-600 font-inter font-light max-w-3xl mx-auto leading-relaxed">
            Get answers to common questions about our AI-powered startup validation platform.
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1, 
                ease: "easeOut" 
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-inter font-semibold text-gray-900 pr-8">
                  {faq.question}
                </h3>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-600 font-inter font-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-inter font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 font-inter mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-black text-white px-6 py-3 font-inter font-medium rounded-xl hover:bg-gray-800 transition-all duration-300">
                Contact Support
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-6 py-3 font-inter font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                Schedule a Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;