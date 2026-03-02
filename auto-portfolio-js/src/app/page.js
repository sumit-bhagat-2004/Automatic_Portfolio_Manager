'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, ExternalLink, Star, ArrowDown } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Spotlight } from '@/components/ui/spotlight';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { FloatingNavbar } from '@/components/ui/floating-navbar';
import { Particles } from '@/components/ui/particles';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { cn } from '@/lib/utils';
import { useAutoAnimate } from '@formkit/auto-animate/react';

// Dynamically import SkillChart to prevent SSR issues with recharts
const SkillChart = dynamic(() => import('../components/SkillChart'), { 
    ssr: false,
    loading: () => <div className="h-[200px] w-full flex items-center justify-center"><p>Loading chart...</p></div>
});


// Background component with animated grid
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 h-full w-full">
    <BackgroundBeams />
    <Particles />
    {/* Additional gradient overlays */}
    <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
    <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
  </div>
);

// Project Card with enhanced 3D effect
const ProjectCard = ({ repo }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 w-full sm:w-auto group"
        >
            <CardContainer className="w-full">
                <CardBody className="relative group/card w-full sm:w-[28rem] h-auto rounded-2xl p-6 border border-white/[0.1] bg-gradient-to-br from-gray-900/90 via-purple-900/30 to-gray-900/90 backdrop-blur-xl">
                    {/* Animated gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover/card:opacity-20 blur-xl transition-opacity duration-500" />
                    
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover/card:opacity-30 blur transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                        <CardItem translateZ="60" className="w-full mb-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent group-hover/card:from-purple-400 group-hover/card:via-pink-400 group-hover/card:to-blue-400 transition-all duration-300">
                                        {repo.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                            <Star size={12} className="text-yellow-400" fill="currentColor" />
                                            <span className="text-xs text-yellow-300 font-medium">{repo.stars}</span>
                                        </span>
                                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                                            {repo.language}
                                        </span>
                                    </div>
                                </div>
                                <CardItem translateZ="80">
                                    <a 
                                        href={repo.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center"
                                    >
                                        <ExternalLink size={18} className="text-gray-300 group-hover:text-white" />
                                    </a>
                                </CardItem>
                            </div>
                        </CardItem>
                        
                        <CardItem as="p" translateZ="50" className="text-sm text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                            {repo.description || repo.summary || 'No description available.'}
                        </CardItem>
                        
                        <CardItem translateZ="70" className="w-full">
                            <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-4">
                                <SkillChart repo={repo} />
                            </div>
                        </CardItem>
                        
                        {/* Tags if available */}
                        {repo.tags && repo.tags.length > 0 && (
                            <CardItem translateZ="40" className="flex flex-wrap gap-2 mt-4">
                                {repo.tags.slice(0, 3).map((tag, idx) => (
                                    <span 
                                        key={idx}
                                        className="px-2.5 py-1 bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-md text-xs"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </CardItem>
                        )}
                    </div>
                </CardBody>
            </CardContainer>
        </motion.div>
    );
};


export default function Home() {
  const [repos, setRepos] = useState([]);
  const [socials, setSocials] = useState({});
  const [error, setError] = useState(null);
  const [parentFeatured] = useAutoAnimate();
  const [parentAll] = useAutoAnimate();

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    async function loadData() {
      try {
        const [repoRes, socialRes] = await Promise.all([
          fetch('/api/summary-data'),
          fetch('/api/socials'),
        ]);
        const repoData = await repoRes.json();
        const socialData = await socialRes.json();

        if (repoData && typeof repoData === 'object') {
          setRepos(Object.values(repoData).filter(repo => repo.visible !== false));
        } else {
          setError('Invalid summary data');
        }
        setSocials(socialData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    }
    loadData();
  }, []);
  
  const featuredRepos = repos.filter(repo => repo.featured);
  const allRepos = repos;
  
  const socialIcons = {
    github: <Github />,
    linkedin: <Linkedin />,
    twitter: <Twitter />,
  };

  return (
    <div className="w-full overflow-x-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 z-50 shadow-lg shadow-purple-500/50" />
      <AnimatedBackground />
      <FloatingNavbar />

      {/* Hero Section - Completely Redesigned */}
      <section id="home" className="relative min-h-screen w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-7xl mx-auto w-full"
        >
          {/* Animated Profile Image */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="relative mb-8 inline-block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse-glow" />
            <img
              src="https://avatars.githubusercontent.com/u/119393675?v=4"
              alt="Sumit Bhagat"
              className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border-4 border-purple-500/50 shadow-2xl shadow-purple-500/50 ring-4 ring-purple-500/20 ring-offset-4 ring-offset-black"
            />
          </motion.div>

          {/* Main Heading with Gradient Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-4 leading-tight">
              <AnimatedGradientText>Sumit Bhagat</AnimatedGradientText>
            </h1>
          </motion.div>

          {/* Subtitle with Typewriter Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="h-16 sm:h-20 md:h-24 mb-8 sm:mb-12"
          >
            <TypeAnimation
              sequence={[
                'Crafting Digital Experiences',
                2000,
                'Building Scalable Solutions',
                2000,
                'Transforming Ideas Into Reality',
                2000,
              ]}
              wrapper="p"
              speed={50}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-gray-300 via-purple-200 to-pink-200 bg-clip-text text-transparent"
              repeat={Infinity}
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4 items-center mb-12"
          >
            <a href={socials.email} className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 border-0 shadow-2xl shadow-purple-500/50 text-base sm:text-lg px-8 py-6"
              >
                <span className="relative z-10 flex items-center">
                  <Mail className="mr-2 h-5 w-5" /> Get In Touch
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </a>
            <a href={socials.github} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-2 border-purple-500/50 bg-black/30 backdrop-blur-sm hover:bg-purple-500/10 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 text-base sm:text-lg px-8 py-6 group"
              >
                <Github className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" /> View Work
              </Button>
            </a>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-gray-400"
            >
              <span className="text-sm">Scroll to explore</span>
              <ArrowDown size={20} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Projects Section */}
      {featuredRepos.length > 0 && (
        <section id="featured" className="relative min-h-screen w-full flex flex-col justify-center py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16 md:mb-20"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm font-medium flex items-center gap-2">
                  <Star size={16} fill="currentColor" />
                  Featured
                </span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Spotlight Projects
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4 leading-relaxed">
                My most impactful and noteworthy projects that showcase expertise and innovation.
              </p>
            </motion.div>
            
            {/* Desktop: Horizontal scroll */}
            <div className="hidden md:block w-full overflow-x-auto pb-8 scrollbar-hide">
                <motion.div 
                    ref={parentFeatured}
                    className="flex gap-6 lg:gap-8 px-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {featuredRepos.map((repo, index) => (
                        <motion.div
                            key={repo.id || repo.name}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <ProjectCard repo={repo} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
            
            {/* Mobile: Vertical grid */}
            <div className="md:hidden grid grid-cols-1 gap-6 px-4 max-w-md mx-auto" ref={parentFeatured}>
                {featuredRepos.map((repo) => (
                    <ProjectCard key={repo.id || repo.name} repo={repo} />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects Section */}
      <section id="projects" className="relative min-h-screen w-full flex flex-col justify-center py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium">
                Portfolio
              </span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                All Projects
              </span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4 leading-relaxed">
              Explore my complete collection of work showcasing modern web development, cloud architecture, and innovative solutions.
            </p>
          </motion.div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          
          {/* Desktop: Grid layout for all projects */}
          <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8" ref={parentAll}>
              {allRepos.map((repo, index) => (
                  <motion.div
                      key={repo.id || repo.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  >
                      <ProjectCard repo={repo} />
                  </motion.div>
              ))}
          </div>
          
          {/* Mobile: Vertical grid */}
          <div className="md:hidden grid grid-cols-1 gap-6 px-4 max-w-md mx-auto" ref={parentAll}>
              {allRepos.map((repo) => (
                  <ProjectCard key={repo.id || repo.name} repo={repo} />
              ))}
          </div>
        </div>
      </section>

       {/* Contact Section - Redesigned */}
      <section id="contact" className="relative min-h-screen w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium">
              Get In Touch
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Let's Build Something Amazing
            </span>
          </h2>
          
          <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-12 sm:mb-16 px-4 max-w-2xl mx-auto leading-relaxed">
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
          </p>

          {/* Social Links with Cards */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
              {Object.entries(socials).map(([platform, url]) =>
                url && socialIcons[platform] ? (
                  <motion.a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative"
                    whileHover={{ y: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                    <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 transition-all duration-300">
                      <div className="text-gray-400 group-hover:text-white transition-colors">
                        {React.cloneElement(socialIcons[platform], { size: 32 })}
                      </div>
                    </div>
                  </motion.a>
                ) : null
              )}
          </div>

          {/* Email Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <a href={socials.email}>
              <Button 
                size="lg" 
                className="relative overflow-hidden group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 border-0 shadow-2xl shadow-purple-500/50 text-lg px-10 py-7"
              >
                <span className="relative z-10 flex items-center font-semibold">
                  <Mail className="mr-3 h-6 w-6" /> Send Me an Email
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </a>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-gray-500 text-sm"
          >
            © 2026 Sumit Bhagat. Crafted with passion and code.
          </motion.p>
        </motion.div>

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}
