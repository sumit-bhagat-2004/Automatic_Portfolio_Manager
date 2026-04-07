'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ContactSection() {
  return (
    <section id="contact" className="relative min-h-screen w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Let's Build Something Amazing
          </span>
        </h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <a href="mailto:your.email@example.com">
            <Button 
              size="lg" 
              className="relative overflow-hidden group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 border-0 shadow-2xl shadow-purple-500/50 text-lg px-10 py-7"
            >
              <span className="relative z-10 flex items-center font-semibold">
                <Mail className="mr-3 h-6 w-6" /> Send Me an Email
              </span>
            </Button>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
