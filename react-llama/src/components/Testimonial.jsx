import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Testimonial = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <blockquote className="text-display lg:text-display-lg font-inter font-light text-black leading-tight mb-12">
            "This is the first AI that truly understands context and nuance. 
            It's not just a tool—it's a creative partner."
          </blockquote>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl font-inter font-medium text-gray-600">AK</span>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-inter font-medium text-black text-lg">
                Alex Kim
              </div>
              <div className="font-inter font-light text-gray-500">
                Creative Director, Design Studio
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="w-24 h-px bg-gray-300 mx-auto mt-16"
        />
      </div>
    </section>
  );
};

export default Testimonial;