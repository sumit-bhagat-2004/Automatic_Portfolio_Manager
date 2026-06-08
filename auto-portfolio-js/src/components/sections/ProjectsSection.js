import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, Code, ChevronDown, ChevronUp, X, Github, Layers } from 'lucide-react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Spotlight } from '@/components/ui/spotlight';
import dynamic from 'next/dynamic';

const SkillChart = dynamic(() => import('../SkillChart'), { ssr: false });

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [filter, setFilter] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [modalProject, setModalProject] = useState(null);

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

  const shouldShowAll = showAll || featured.length === 0;

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
                <ProjectCard3D key={project.id} project={project} index={idx} onOpen={() => setModalProject(project)} />
              ))}
            </div>
          </div>
        )}

        {/* View All Projects Button */}
        {!shouldShowAll && (
          <div className="flex justify-center mt-8">
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAll(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-200 hover:text-white border border-purple-500/30 hover:border-purple-500/60 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/10 backdrop-blur-md flex items-center gap-2"
            >
              <span>Explore More Projects</span>
              <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {shouldShowAll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              {/* All Projects Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 mt-12"
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
                      className={`px-3 py-1.5 rounded-full transition-all text-sm ${
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
                  <ProjectCard key={project.id} project={project} index={idx} onOpen={() => setModalProject(project)} />
                ))}
              </div>

              {/* Collapse Button */}
              {featured.length > 0 && (
                <div className="flex justify-center mt-12 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAll(false)}
                    className="group px-6 py-3 bg-gray-900/60 hover:bg-gray-800/80 text-gray-400 hover:text-gray-200 border border-gray-800 rounded-full font-medium transition-all duration-300 flex items-center gap-2"
                  >
                    <span>Show Less</span>
                    <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen Project Modal */}
      <AnimatePresence>
        {modalProject && (
          <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// Full-screen Project Modal
function ProjectModal({ project, onClose }) {
  const tags = typeof project.tags === 'string' ? JSON.parse(project.tags || '[]') : (project.tags || []);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 border border-white/10 rounded-3xl shadow-2xl shadow-purple-900/40 scrollbar-thin scrollbar-thumb-purple-900/40"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 bg-gray-950/90 backdrop-blur-lg border-b border-white/[0.06] rounded-t-3xl">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {project.language && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-500/25 text-purple-300 rounded-full text-xs font-bold">
                  <Code size={11} />
                  {project.language}
                </span>
              )}
              {project.stars > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold">
                  <Star size={11} fill="currentColor" />
                  {project.stars} stars
                </span>
              )}
              {project.forks > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs font-bold">
                  <Layers size={11} />
                  {project.forks} forks
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Full description */}
          {project.summary ? (
            <div
              className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-ul:text-gray-300 prose-li:marker:text-purple-400 prose-strong:text-white prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: project.summary }}
            />
          ) : (
            <p className="text-gray-400 italic text-sm">No description available for this project yet.</p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Topics & Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Language chart */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Language Distribution</p>
            <SkillChart repo={project} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold text-sm transition-all border border-white/10 hover:border-white/20"
              >
                <Github size={16} />
                View on GitHub
              </a>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-2xl font-bold text-sm transition-all border border-purple-500/30 hover:border-purple-500/50"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced 3D Project Card for Featured Projects
function ProjectCard3D({ project, index, onOpen }) {
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
                <div className="flex items-center gap-2">
                  {/* Full-screen read more button */}
                  <button
                    onClick={onOpen}
                    title="Read full description"
                    className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all duration-300 hover:scale-110 text-purple-300"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </button>
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
function ProjectCard({ project, index, onOpen }) {
  const tags = typeof project.tags === 'string' ? JSON.parse(project.tags || '[]') : project.tags;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden bg-gradient-to-br from-gray-950 to-gray-850 border border-gray-800 rounded-2xl p-6 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 ease-in-out flex flex-col"
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-50 group-hover:text-purple-300 transition-colors duration-300 flex-1 pr-2">
            {project.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Full description modal button */}
            <button
              onClick={onOpen}
              title="Read full description"
              className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all text-purple-300 hover:scale-110"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-gray-800/50 hover:bg-purple-800/20 rounded-lg transition-colors duration-300"
            >
              <ExternalLink size={14} className="text-gray-400 group-hover:text-purple-300 transition-colors duration-300" />
            </a>
          </div>
        </div>

        <div
          className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: project.summary || 'No description available.' }}
        />

        <div className="flex flex-wrap gap-2 mb-4">
          {project.language && (
            <span className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs">
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
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
