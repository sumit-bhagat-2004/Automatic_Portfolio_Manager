'use client';

import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ContactSection({ config }) {
  const emailAddress = config?.email || 'sumitbhagat011@gmail.com';
  const githubUrl = config?.githubUrl || 'https://github.com/sumit-bhagat-2004';
  const linkedinUrl = config?.linkedinUrl;
  const twitterUrl = config?.twitterUrl;

  return (
    <section id="contact" className="relative min-h-screen w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8">
      {/* Decorative gradient blur in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl" />
      </div>

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
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          I'm always open to new opportunities, collaborations, or simply talking about technology. Reach out and let's connect!
        </p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-8"
        >
          <a href={`mailto:${emailAddress}`}>
            <Button 
              size="lg" 
              className="relative overflow-hidden group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 border-0 shadow-2xl shadow-purple-500/30 text-lg px-10 py-7 rounded-2xl"
            >
              <span className="relative z-10 flex items-center font-semibold">
                <Mail className="mr-3 h-6 w-6" /> Send Me an Email
              </span>
            </Button>
          </a>

          {/* Dynamic Social Icons Row */}
          <div className="flex gap-4 mt-4">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-gray-400 hover:text-white rounded-xl transition-all duration-300 hover:-translate-y-1"
                title="GitHub Profile"
              >
                <Github size={20} />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-gray-400 hover:text-white rounded-xl transition-all duration-300 hover:-translate-y-1"
                title="LinkedIn Profile"
              >
                <Linkedin size={20} />
              </a>
            )}
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-gray-400 hover:text-white rounded-xl transition-all duration-300 hover:-translate-y-1"
                title="Twitter Profile"
              >
                <Twitter size={20} />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
