'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Github, Code, TrendingUp } from 'lucide-react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Spotlight } from '@/components/ui/spotlight';
import dynamic from 'next/dynamic';

const SkillChart = dynamic(() => import('../SkillChart'), { ssr: false });

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [filter, setFilter] = useState('all');
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    fetch('/api/projects?visible=true')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setFeatured(data.filter(p => p.featured));
        
        // Extract unique languages for filter
        const langs = [...new Set(data.map(p => p.language).filter(Boolean))];
        setLanguages(langs);
      })
      .catch(console.error);
  }, []);

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.language === filter);

  return (
    <section id="projects" className="relative min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Featured Spotlight Section */}
        {featured.length > 0 && (
          <div className="mb-24 relative">
            <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="purple" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  ⭐ Featured Projects
                </span>
              </h2>
              <p className="text-gray-400 text-lg">Spotlight on my best work</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {featured.slice(0, 4).map((project, idx) => (
                <ProjectCard3D key={project.id} project={project} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* All Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-5xl font-black mb-6 text-center">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              All Projects
            </span>
          </h2>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All ({projects.length})
            </button>
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setFilter(lang)}
                className={`px-4 py-2 rounded-full transition-all ${
                  filter === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Enhanced 3D Project Card for Featured Projects
function ProjectCard3D({ project, index }) {
  const tags = typeof project.tags === 'string' ? JSON.parse(project.tags || '[]') : project.tags;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <CardContainer className="w-full">
        <CardBody className="relative group/card w-full h-auto rounded-2xl p-6 border border-white/[0.1] bg-gradient-to-br from-gray-900/90 via-purple-900/30 to-gray-900/90 backdrop-blur-xl">
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover/card:opacity-20 blur-xl transition-opacity duration-500" />
          
          {/* Glow effect on hover */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover/card:opacity-30 blur transition-opacity duration-500" />
          
          <div className="relative z-10">
            <CardItem translateZ="60" className="w-full mb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent group-hover/card:from-purple-400 group-hover/card:via-pink-400 group-hover/card:to-blue-400 transition-all duration-300">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                      <Star size={12} className="text-yellow-400" fill="currentColor" />
                      <span className="text-xs text-yellow-300 font-medium">{project.stars || 0}</span>
                    </span>
                    {project.language && (
                      <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                        {project.language}
                      </span>
                    )}
                  </div>
                </div>
                <CardItem translateZ="80">
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center"
                  >
                    <ExternalLink size={18} className="text-gray-300 group-hover:text-white" />
                  </a>
                </CardItem>
              </div>
            </CardItem>
            
            <CardItem as="div" translateZ="50" className="text-sm text-gray-300 mb-4 line-clamp-3 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: project.summary || 'No description available.' }} />
            </CardItem>
            
            {/* SkillChart */}
            <CardItem translateZ="70" className="w-full mb-4">
              <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-4">
                <SkillChart repo={project} />
              </div>
            </CardItem>
            
            {/* Tags */}
            {tags && tags.length > 0 && (
              <CardItem translateZ="40" className="flex flex-wrap gap-2">
                {tags.slice(0, 4).map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded text-xs"
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
}

// Regular Project Card
function ProjectCard({ project, index }) {
  const tags = typeof project.tags === 'string' ? JSON.parse(project.tags || '[]') : project.tags;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">
          {project.name}
        </h3>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ExternalLink size={16} className="text-gray-400" />
        </a>
      </div>

      <div 
        className="text-gray-400 text-sm mb-4 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: project.summary || 'No description available.' }}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {project.language && (
          <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
            <Code size={12} className="inline mr-1" />
            {project.language}
          </span>
        )}
        {project.stars > 0 && (
          <div className="flex items-center gap-1 text-yellow-400 px-2 py-1 bg-yellow-500/10 rounded">
            <Star size={12} fill="currentColor" />
            <span className="text-xs">{project.stars}</span>
          </div>
        )}
        {project.forks > 0 && (
          <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
            {project.forks} forks
          </span>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
