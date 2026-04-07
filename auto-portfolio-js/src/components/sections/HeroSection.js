'use client';

import { motion } from 'framer-motion';
import { Mail, Github, ArrowDown } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { Button } from '@/components/ui/Button';

export default function HeroSection() {
  const githubUsername = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'sumit-bhagat-2004';
  const emailAddress = 'sumitbhagat011@gmail.com';
  
  return (
    <section id="hero" className="relative min-h-screen w-full flex flex-col justify-center items-center text-center px-4">
      {/* Removed GitHub Corner Ribbon */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 max-w-5xl mx-auto">
        {/* Animated Profile Image */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1 }}
          className="relative mb-8 inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse-glow" />
          <img
            src="https://raw.githubusercontent.com/sumit-bhagat-2004/Automatic_Portfolio_Manager/main/auto-portfolio-js/public/photo_2025-06-13_23-09-39(1).jpg"
            alt="Sumit Bhagat"
            className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border-4 border-purple-500/50 shadow-2xl shadow-purple-500/50 ring-4 ring-purple-500/20 ring-offset-4 ring-offset-black"
          />
        </motion.div>

        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl font-black mb-8"
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
            Sumit Bhagat
          </span>
        </motion.h1>
        
        <div className="h-20 mb-12">
          <TypeAnimation
            sequence={[
              'Crafting Digital Experiences',
              2000,
              'Building Scalable Solutions',
              2000,
              'Full-Stack Developer',
              2000,
              'Open Source Contributor',
              2000
            ]}
            wrapper="p"
            className="text-3xl md:text-4xl font-light bg-gradient-to-r from-gray-300 to-purple-200 bg-clip-text text-transparent"
            repeat={Infinity}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Button
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => window.location.href = `mailto:${emailAddress}`}
          >
            <Mail className="mr-2" /> Get In Touch
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.open(`https://github.com/${githubUsername}`, '_blank')}
          >
            <Github className="mr-2" /> View GitHub
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16"
        >
          <ArrowDown className="mx-auto animate-bounce text-purple-400" size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
}

