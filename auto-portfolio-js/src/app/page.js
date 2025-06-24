'use client';
import { useEffect, useState } from 'react';
import SkillChart from '../components/SkillChart';

export default function Home() {
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);

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

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">🚀 My Projects</h1>
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
              <h2 className="text-xl font-bold mb-2 text-blue-300">{repo.name}</h2>
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
    </main>
  );
}
