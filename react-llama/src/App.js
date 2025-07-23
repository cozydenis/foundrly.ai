import React from 'react';
import { motion } from 'framer-motion';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Testimonial from './components/Testimonial';
import './App.css';

function App() {
  return (
    <div className="App">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-white"
      >
        <Hero />
        <About />
        <Features />
        <Testimonial />
        
        {/* Final CTA Section */}
        <motion.section 
          className="py-32 px-6 sm:px-8 bg-black text-white text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-display lg:text-display-lg font-inter font-medium mb-8">
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-300 font-inter font-light mb-12 max-w-2xl mx-auto">
              Join thousands of creators, developers, and innovators already using our platform.
            </p>
            <motion.button 
              className="bg-white text-black px-10 py-4 text-lg font-inter font-medium rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start building today
            </motion.button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

export default App;