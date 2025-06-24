'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin-auth');
    if (isAuth !== 'yes') {
      router.push('/admin/login');
    } else {
      document.cookie = 'admin-auth=yes; path=/';
    }

    async function loadData() {
      try {
        const res = await fetch('/api/summary-data');
        const data = await res.json();
        setRepos(Object.entries(data).map(([key, val]) => ({ ...val, name: key })));
      } catch (err) {
        setError('Failed to load summaryData.json');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [resettingAll]);

  const handleChange = (repoName, field, value) => {
    setRepos((prev) =>
      prev.map((r) =>
        r.name === repoName ? { ...r, [field]: value } : r
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalObj = {};
      repos.forEach((r) => {
        finalObj[r.name] = {
          id: r.id,
          name: r.name,
          url: r.url,
          language: r.language,
          stars: r.stars,
          summary: r.summary || '',
          tags: r.tags || [],
          visible: r.visible !== false,
        };
      });

      const res = await fetch('/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalObj),
      });

      if (res.ok) alert('Saved!');
      else alert('Failed to save');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Reset summary for a single repo (already present)
  const handleReset = async (repoName) => {
    try {
      const res = await fetch(`/api/reset-summary?repo=${repoName}`);
      const data = await res.json();
      if (data?.summary) {
        handleChange(repoName, 'summary', data.summary);
      }
    } catch (err) {
      alert('Failed to reset');
    }
  };

  // Reset githubData.json for a single repo
  const handleResetGithubRepo = async (repoName) => {
    try {
      const res = await fetch(`/api/github?refresh=1&repo=${repoName}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset GitHub data for repo');
      alert(`GitHub data reset for ${repoName}`);
      setResettingAll((prev) => !prev); // reload data
    } catch (err) {
      alert('Failed to reset GitHub data for repo');
    }
  };

  // Reset githubData.json for all repos
  const handleResetAllGithubData = async () => {
    if (!window.confirm("This will reset all GitHub data (githubData.json) to latest from GitHub. Proceed?")) return;
    setResettingAll(true);
    try {
      const res = await fetch('/api/github?refresh=1', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset all GitHub data');
      alert('All GitHub data reset!');
      setResettingAll(false);
      window.location.reload();
    } catch (err) {
      setError('Failed to reset all GitHub data');
      setResettingAll(false);
    }
  };

  const handleLoadNewRepos = async () => {
    setGithubLoading(true);
    setError('');
    try {
      const githubRes = await fetch('/api/github?refresh=1');
      if (!githubRes.ok) throw new Error('Failed to fetch GitHub data');
      const summaryRes = await fetch('/api/summary-data');
      const data = await summaryRes.json();
      setRepos(Object.entries(data).map(([key, val]) => ({ ...val, name: key })));
    } catch (err) {
      setError('Failed to load new repos from GitHub');
    }
    setGithubLoading(false);
  };

  if (loading) return <div className="text-white p-4">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🔧 Admin Panel</h1>

      {error && <div className="bg-red-600 text-white p-3 mb-4">{error}</div>}

      <div className="flex gap-4 mb-6">
        <button
          className="bg-blue-700 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded"
          onClick={handleLoadNewRepos}
          disabled={githubLoading}
        >
          {githubLoading ? "Loading..." : "⬇️ Load New Repos from GitHub"}
        </button>
        <button
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
          onClick={handleResetAllGithubData}
          disabled={resettingAll}
        >
          {resettingAll ? "Resetting..." : "♻️ Reset All GitHub Data"}
        </button>
        <button
          className="bg-green-500 text-black font-bold py-2 px-4 rounded hover:bg-green-400"
          onClick={handleSave}
          disabled={saving}
        >
          💾 {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded"
          onClick={async () => {
            const confirm = window.confirm("This will regenerate summaries for all repos. Proceed?");
            if (!confirm) return;

            const res = await fetch('/api/regenerate-all', { method: 'POST' });
            const data = await res.json();
            if (data.success) alert('SummaryData regenerated!');
            else alert('Failed to regenerate.');
          }}
        >
          🔁 Regenerate All Summaries
        </button>
        <button
          className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-400"
          onClick={() => {
            localStorage.removeItem('admin-auth');
            document.cookie = 'admin-auth=; Max-Age=0; path=/';
            window.location.href = '/admin/login';
          }}
        >
          🚪 Logout
        </button>
      </div>

      <div className="space-y-6">
        {repos.map((repo) => (
          <div
            key={repo.id || repo.name}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>

            <textarea
              value={repo.summary || ''}
              onChange={(e) =>
                handleChange(repo.name, 'summary', e.target.value)
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Project summary..."
              rows={3}
            />

            <input
              type="text"
              value={repo.tags?.join(', ') || ''}
              onChange={(e) =>
                handleChange(
                  repo.name,
                  'tags',
                  e.target.value.split(',').map((t) => t.trim())
                )
              }
              className="w-full mt-2 p-2 rounded bg-gray-700 text-white"
              placeholder="Tags (comma separated)"
            />

            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={repo.visible !== false}
                  onChange={(e) =>
                    handleChange(repo.name, 'visible', e.target.checked)
                  }
                />
                Show this project
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReset(repo.name)}
                  className="bg-yellow-500 text-black px-3 py-1 rounded"
                >
                  🔁 Reset Summary
                </button>
                <button
                  onClick={() => handleResetGithubRepo(repo.name)}
                  className="bg-blue-400 text-black px-3 py-1 rounded"
                >
                  ♻️ Reset GitHub Data
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
