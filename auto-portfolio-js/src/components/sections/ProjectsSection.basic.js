'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Github } from 'lucide-react';

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api/projects?visible=true')
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  return (
    <section id="projects" className="relative min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black mb-16 text-center">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Projects
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div key={project.id} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-purple-500 transition-all">
              <h3 className="text-xl font-bold mb-2">{project.name}</h3>
              {project.summary && <p className="text-gray-400 text-sm mb-4">{project.summary}</p>}
              <div className="flex gap-2 flex-wrap">
                {project.language && <span className="px-2 py-1 bg-gray-800 rounded text-xs">{project.language}</span>}
                {project.stars > 0 && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs">{project.stars}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
