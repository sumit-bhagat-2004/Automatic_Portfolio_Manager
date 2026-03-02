'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Toggle } from '@/components/ui/toggle';
import { Search, Save, RefreshCw, LogOut, Star, Eye, EyeOff, Github } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
        const reposList = Object.entries(data).map(([key, val]) => ({ 
          ...val, 
          name: key,
          featured: val.featured || false 
        }));
        setRepos(reposList);
        if (reposList.length > 0) {
          setSelectedRepo(reposList[0].name);
        }
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
          featured: r.featured || false,
        };
      });

      const res = await fetch('/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalObj),
      });

      if (res.ok) {
        toast.success('Changes saved successfully!', {
          description: 'Your project summaries have been updated.',
        });
      } else {
        toast.error('Failed to save changes', {
          description: 'Please try again or check the console for errors.',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Save operation failed', {
        description: 'An unexpected error occurred.',
      });
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
        toast.success('Summary reset successfully!', {
          description: `${repoName} summary has been regenerated.`,
        });
      }
    } catch (err) {
      toast.error('Failed to reset summary', {
        description: 'Please try again.',
      });
    }
  };

  // Reset githubData.json for a single repo
  const handleResetGithubRepo = async (repoName) => {
    try {
      const res = await fetch(`/api/github?refresh=1&repo=${repoName}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset GitHub data for repo');
      toast.success('GitHub data refreshed!', {
        description: `${repoName} has been updated from GitHub.`,
      });
      setResettingAll((prev) => !prev);
    } catch (err) {
      toast.error('Failed to reset GitHub data', {
        description: 'Please check your connection and try again.',
      });
    }
  };

  // Reset githubData.json for all repos
  const handleResetAllGithubData = async () => {
    if (!window.confirm("This will reset all GitHub data (githubData.json) to latest from GitHub. Proceed?")) return;
    setResettingAll(true);
    try {
      const res = await fetch('/api/github?refresh=1', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset all GitHub data');
      toast.success('All GitHub data reset!', {
        description: 'Reloading page...',
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError('Failed to reset all GitHub data');
      toast.error('Reset failed', {
        description: 'Could not reset GitHub data.',
      });
      setResettingAll(false);
    }
  };

  const handleLoadNewRepos = async () => {
    setGithubLoading(true);
    setError('');
    try {
      console.log('Fetching from GitHub API...');
      const githubRes = await fetch('/api/github?refresh=1');
      const githubData = await githubRes.json();
      
      console.log('GitHub response:', githubRes.status, githubData);
      
      if (!githubRes.ok) {
        throw new Error(githubData.error || 'Failed to fetch GitHub data');
      }
      
      const actualRepos = githubData.data || githubData;
      
      if (githubData.cached) {
        toast.warning('Using cached data', {
          description: 'GitHub API is unavailable, showing last saved data',
        });
      }
      
      console.log('Fetching summary data...');
      const summaryRes = await fetch('/api/summary-data');
      const summaryData = await summaryRes.json();
      console.log('Summary data:', summaryData);
      
      // Merge GitHub repos with existing summary data
      const mergedData = {};
      
      // Add all GitHub repos
      actualRepos.forEach(repo => {
        const existingSummary = summaryData[repo.name];
        mergedData[repo.name] = {
          id: repo.id,
          name: repo.name,
          url: repo.url,
          language: repo.language,
          stars: repo.stars,
          summary: existingSummary?.summary || 'No summary yet - edit to add one',
          tags: existingSummary?.tags || [],
          visible: existingSummary?.visible !== undefined ? existingSummary.visible : true,
          featured: existingSummary?.featured || false,
        };
      });
      
      // Save merged data
      const saveRes = await fetch('/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedData),
      });
      
      if (!saveRes.ok) {
        throw new Error('Failed to save merged data');
      }
      
      // Update UI
      const reposList = Object.entries(mergedData).map(([key, val]) => ({ 
        ...val, 
        name: key,
        featured: val.featured || false 
      }));
      
      setRepos(reposList);
      if (reposList.length > 0 && !selectedRepo) {
        setSelectedRepo(reposList[0].name);
      }
      
      toast.success('Repos loaded from GitHub!', {
        description: `${actualRepos.length} repositories synced successfully`,
      });
    } catch (err) {
      console.error('Load repos error:', err);
      const errorMsg = err.message || 'Failed to load new repos from GitHub';
      setError(errorMsg);
      toast.error('Failed to load repos', {
        description: errorMsg,
        duration: 5000,
      });
    }
    setGithubLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white text-xl">Loading admin panel...</div>
        <div className="text-gray-400 text-sm mt-2">Please wait</div>
      </div>
    </div>
  );

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentRepo = repos.find(r => r.name === selectedRepo);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-400">Manage your portfolio</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Project List - Scrollable */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {filteredRepos.map((repo) => (
            <button
              key={repo.name}
              onClick={() => setSelectedRepo(repo.name)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                selectedRepo === repo.name
                  ? 'bg-purple-600/20 border border-purple-500/50'
                  : 'bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{repo.name}</h3>
                    {repo.featured && (
                      <Star size={14} className="text-yellow-400 flex-shrink-0" fill="currentColor" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {repo.visible ? (
                      <Eye size={12} className="text-green-400" />
                    ) : (
                      <EyeOff size={12} className="text-gray-500" />
                    )}
                    <span>{repo.language || 'No language'}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sidebar Footer - Quick Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 flex-shrink-0">
          <button
            onClick={() => {
              localStorage.removeItem('admin-auth');
              document.cookie = 'admin-auth=; Max-Age=0; path=/';
              window.location.href = '/admin/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full" style={{ overflowY: 'auto' }}>
        <div className="max-w-5xl mx-auto p-8">
          {/* Top Actions Bar */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLoadNewRepos}
                disabled={githubLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 text-sm font-medium"
              >
                <Github size={16} />
                {githubLoading ? 'Loading...' : 'Load New Repos'}
              </button>
              <button
                onClick={handleResetAllGithubData}
                disabled={resettingAll}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-all disabled:opacity-50 text-sm font-medium"
              >
                <RefreshCw size={16} />
                {resettingAll ? 'Resetting...' : 'Reset All Data'}
              </button>
              <button
                onClick={async () => {
                  const confirm = window.confirm("This will regenerate summaries for all repos. Proceed?");
                  if (!confirm) return;
                  const res = await fetch('/api/regenerate-all', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    toast.success('Summaries regenerated!', {
                      description: 'All project summaries have been updated.',
                    });
                  } else {
                    toast.error('Failed to regenerate summaries');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all text-sm font-medium"
              >
                <RefreshCw size={16} />
                Regenerate All
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all disabled:opacity-50 text-sm font-medium ml-auto"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Project Editor */}
          {currentRepo && (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-700/50">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentRepo.name}</h2>
                  <a 
                    href={currentRepo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View on GitHub →
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{currentRepo.stars}</div>
                    <div className="text-xs text-gray-400">Stars</div>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">Visibility</h3>
                      <p className="text-sm text-gray-400">Show on portfolio</p>
                    </div>
                    <Toggle
                      enabled={currentRepo.visible !== false}
                      onChange={(val) => handleChange(currentRepo.name, 'visible', val)}
                      label="Visibility"
                    />
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">Featured</h3>
                      <p className="text-sm text-gray-400">Pin to top section</p>
                    </div>
                    <Toggle
                      enabled={currentRepo.featured || false}
                      onChange={(val) => handleChange(currentRepo.name, 'featured', val)}
                      label="Featured"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Editor */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Project Summary
                  <span className="text-gray-400 font-normal ml-2">(Describe your project)</span>
                </label>
                <textarea
                  value={currentRepo.summary || ''}
                  onChange={(e) => handleChange(currentRepo.name, 'summary', e.target.value)}
                  className="w-full p-4 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all min-h-[200px] text-base"
                  placeholder="Write a compelling summary of your project..."
                />
              </div>

              {/* Tags Editor */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Tags
                  <span className="text-gray-400 font-normal ml-2">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  value={currentRepo.tags?.join(', ') || ''}
                  onChange={(e) =>
                    handleChange(
                      currentRepo.name,
                      'tags',
                      e.target.value.split(',').map((t) => t.trim()).filter(t => t)
                    )
                  }
                  className="w-full p-4 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all text-base"
                  placeholder="React, TypeScript, Node.js, etc."
                />
                {currentRepo.tags && currentRepo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentRepo.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-700/50">
                <button
                  onClick={() => handleReset(currentRepo.name)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg transition-all text-sm font-medium"
                >
                  <RefreshCw size={16} />
                  Reset Summary
                </button>
                <button
                  onClick={() => handleResetGithubRepo(currentRepo.name)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium"
                >
                  <Github size={16} />
                  Reset GitHub Data
                </button>
              </div>
            </div>
          )}

          {!currentRepo && filteredRepos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No projects found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
