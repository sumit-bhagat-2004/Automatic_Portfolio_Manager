'use client';
import { useEffect, useState } from 'react';
// For client-side routing, use next/navigation's useRouter for Next.js
// If you want classic react-router-dom, you would use <BrowserRouter> and <Routes> in a CRA/Vite app

import SkillChart from '../components/SkillChart';

export default function Home() {
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);
  const [socials, setSocials] = useState({});

  useEffect(() => {
    async function loadRepos() {
      try {
        const res = await fetch('/api/summary-data');
        const data = await res.json();

        if (!data || typeof data !== 'object') {
          setError('Invalid summary data');
          return;
        }

        const repoList = Object.values(data).filter(repo => repo.visible !== false);
        setRepos(repoList);
      } catch (err) {
        console.error('Failed to load summary data:', err);
        setError('Failed to load project summaries');
      }
    }

    loadRepos();
  }, []);

  useEffect(() => {
    async function loadSocials() {
      const res = await fetch('/api/socials');
      const data = await res.json();
      setSocials(data);
    }
    loadSocials();
  }, []);

  // Simple navigation scroll (for demo, replace with Next.js routing for real pages)
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-0">
      {/* Navbar */}
      <nav className="w-full bg-gray-950/90 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-2xl font-bold text-blue-400 cursor-pointer" onClick={() => scrollToSection('home')}>
            Sumit Bhagat
          </span>
          <div className="flex gap-6 text-lg font-medium">
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-400 transition">About</button>
            <button onClick={() => scrollToSection('projects')} className="hover:text-blue-400 transition">Projects</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-blue-400 transition">Testimonials</button>
            <button onClick={() => scrollToSection('blog')} className="hover:text-blue-400 transition">Blog</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-blue-400 transition">Contact</button>
            {Object.entries(socials).map(([platform, url]) =>
              url ? (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline capitalize ml-2"
                >
                  {platform}
                </a>
              ) : null
            )}
          </div>
        </div>
      </nav>

      {/* Hero/About Section */}
      <section
        id="home"
        className="min-h-screen flex flex-col justify-start pt-24 px-4 bg-gradient-to-b from-gray-900 to-gray-800 snap-start"
      >
        <div className="flex flex-col items-center">
          <img
            src="https://avatars.githubusercontent.com/u/119393675?v=4"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-400 mb-4 shadow-lg"
          />
          <h1 className="text-4xl font-bold mb-2 text-center">Hi, I'm Sumit Bhagat</h1>
          <p className="text-lg text-gray-300 max-w-2xl text-center mb-4">
            Full-stack developer, cloud enthusiast, and open-source contributor. I love building web apps, exploring new tech, and sharing knowledge.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {Object.entries(socials).map(([platform, url]) =>
              url ? (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline capitalize text-lg font-medium transition-colors duration-150"
                >
                  {platform}
                </a>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="max-w-4xl mx-auto min-h-screen flex flex-col justify-start pt-24 px-4 snap-start"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-300">About Me</h2>
        <p className="text-gray-300 text-lg mb-2">
          I'm passionate about building scalable web applications and learning new technologies. My main stack includes JavaScript, Python, React, and cloud platforms like AWS and GCP.
        </p>
        <p className="text-gray-400">
          I enjoy collaborating on open-source projects, writing technical blogs, and helping others grow in tech. Let's connect!
        </p>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="max-w-7xl mx-auto min-h-screen flex flex-col justify-start pt-24 py-12 px-4 snap-start"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">🚀 My Projects</h2>
        {error && <div className="bg-red-700 text-white p-4 mb-6 rounded">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {repos.map((repo, idx) => (
            <div
              key={repo.id || repo.name}
              className={`
                flex flex-col justify-between h-full
                rounded-2xl shadow-lg transition
                p-6 mb-2
                ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}
                hover:scale-[1.03] hover:shadow-2xl
              `}
            >
              <div>
                <h3 className="text-xl font-bold mb-2 text-blue-300">{repo.name}</h3>
                {repo.description && (
                  <p className="text-gray-300 mb-2">{repo.description}</p>
                )}
                <p className="text-gray-400 mb-2">{repo.summary}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-2">
                  <span>⭐ {repo.stars}</span>
                  <span>• {repo.language}</span>
                </div>
                {repo.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-xs text-gray-400 mb-2">
                    {repo.tags.map(tag => (
                      <span key={tag} className="bg-gray-600 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500 mb-1">
                  Forks: {repo.forks} | Watchers: {repo.watchers} | Issues: {repo.open_issues}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Last updated: {repo.updated_at ? new Date(repo.updated_at).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <SkillChart repo={repo} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section (placeholder) */}
      <section
        id="testimonials"
        className="max-w-4xl mx-auto min-h-screen flex flex-col justify-start pt-24 py-12 px-4 snap-start"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-300">Testimonials</h2>
        <div className="bg-gray-800 rounded-xl p-6 text-gray-300 text-center">
          <p className="italic">"Sumit is a fantastic developer and team player!"</p>
          <p className="mt-2 text-sm text-gray-400">- Jane Doe, Senior Engineer</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-gray-300 text-center mt-4">
          <p className="italic">"Always delivers high-quality work on time."</p>
          <p className="mt-2 text-sm text-gray-400">- John Smith, Project Manager</p>
        </div>
      </section>

      {/* Blog Section (placeholder) */}
      <section
        id="blog"
        className="max-w-4xl mx-auto min-h-screen flex flex-col justify-start pt-24 py-12 px-4 snap-start"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-300">Blog</h2>
        <div className="bg-gray-800 rounded-xl p-6 text-gray-300 text-center">
          <p className="italic">Blog coming soon! Stay tuned for articles on web development, cloud, and more.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="max-w-2xl mx-auto min-h-screen flex flex-col justify-start pt-24 py-12 px-4 snap-start"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-300">Contact</h2>
        <p className="text-gray-300 mb-4">
          Want to work together or have a question? Reach out via email or connect on social media!
        </p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(socials).map(([platform, url]) =>
            url ? (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline capitalize text-lg font-medium transition-colors duration-150"
              >
                {platform}
              </a>
            ) : null
          )}
        </div>
      </section>
    </main>
  );
}

// Add this to your main CSS (e.g., globals.css) if not already present:
// html { scroll-behavior: smooth; }
// body, main { scroll-snap-type: y mandatory; }
// .snap-start { scroll-snap-align: start; }
