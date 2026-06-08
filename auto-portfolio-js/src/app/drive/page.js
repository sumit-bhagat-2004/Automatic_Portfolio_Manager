'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Download, 
  Trash2, 
  UploadCloud, 
  FileText, 
  FileImage, 
  FileArchive, 
  FileCode, 
  File as FileIcon, 
  Eye, 
  LogOut, 
  Search, 
  Plus, 
  ChevronRight, 
  FolderLock, 
  Share2,
  HardDrive
} from 'lucide-react';

export default function DrivePage() {
  const [files, setFiles] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('protected');
  const [activeTab, setActiveTab] = useState('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/drive');
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files || []);
        setAuthenticated(data.authorized);
        // If logged in, we default to protected tab or keep active tab
        if (data.authorized && activeTab === 'public') {
          // Keep it or let them switch
        }
      }
    } catch (err) {
      console.error('Failed to load drive files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/drive/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthenticated(true);
        setPassword('');
        setShowLoginModal(false);
        setActiveTab('protected');
        loadFiles();
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (err) {
      setLoginError('Authentication failed');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/drive/logout', { method: 'POST' });
      if (res.ok) {
        setAuthenticated(false);
        setActiveTab('public');
        loadFiles();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (!authenticated) {
      setShowLoginModal(true);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);

    try {
      const res = await fetch('/api/drive', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        loadFiles();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name, type) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch('/api/drive', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
      });
      if (res.ok) {
        loadFiles();
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const size = 20;
    
    switch (ext) {
      case 'pdf':
        return <FileText size={size} className="text-red-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return <FileImage size={size} className="text-blue-400" />;
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
      case '7z':
        return <FileArchive size={size} className="text-yellow-400" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'py':
      case 'go':
        return <FileCode size={size} className="text-purple-400" />;
      default:
        return <FileIcon size={size} className="text-gray-400" />;
    }
  };

  // Filter files based on search and active tab
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = file.type === activeTab;
    return matchesSearch && matchesTab;
  });

  // Calculate stats
  const publicCount = files.filter(f => f.type === 'public').length;
  const protectedCount = files.filter(f => f.type === 'protected').length;
  const totalDiskSpace = 32 * 1024 * 1024 * 1024; // 32 GB approximation
  const usedDiskSpace = files.reduce((acc, f) => acc + f.size, 0);
  const usedPercent = Math.min((usedDiskSpace / totalDiskSpace) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
              <HardDrive size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                Secure Document Vault
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Self-hosted file manager with password protection.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {authenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-sm font-semibold transition-all hover:text-red-400"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-600/10 transition-all hover:shadow-purple-600/20 active:scale-95"
              >
                <Lock size={16} />
                Admin Unlock
              </button>
            )}
          </div>
        </header>

        {/* Disk Stats (Only for Admins) */}
        {authenticated && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="text-slate-400 text-sm font-medium">Used Space</div>
              <div className="text-2xl font-bold mt-1 text-slate-100">{formatSize(usedDiskSpace)}</div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(usedPercent, 2)}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="text-slate-400 text-sm font-medium">Available Disk Space</div>
              <div className="text-2xl font-bold mt-1 text-slate-100">~32.0 GB</div>
              <p className="text-xs text-slate-500 mt-3">Approximate VPS storage allocation.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="text-slate-400 text-sm font-medium">Total Files Hosted</div>
              <div className="text-2xl font-bold mt-1 text-slate-100">{files.length} files</div>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="text-green-400 flex items-center gap-1"><Share2 size={12}/> {publicCount} Shared</span>
                <span className="text-purple-400 flex items-center gap-1"><FolderLock size={12}/> {protectedCount} Vaulted</span>
              </div>
            </div>
          </section>
        )}

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Upload Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Upload Zone */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center gap-2">
                <UploadCloud size={18} className="text-purple-400" />
                Upload Document
              </h3>

              {authenticated ? (
                <div className="space-y-4">
                  {/* Privacy Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Upload Target
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                      <button
                        onClick={() => setUploadType('protected')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          uploadType === 'protected'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Lock size={13} />
                        Private
                      </button>
                      <button
                        onClick={() => setUploadType('public')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          uploadType === 'public'
                            ? 'bg-green-600 text-black shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Share2 size={13} />
                        Public
                      </button>
                    </div>
                  </div>

                  {/* Drag area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      dragActive
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/20'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <UploadCloud size={32} className={`${uploading ? 'animate-bounce text-purple-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold text-slate-300">
                      {uploading ? 'Uploading...' : 'Drag files here or click'}
                    </span>
                    <span className="text-[10px] text-slate-500">PDF, images, zip files up to 100MB</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border border-slate-850 rounded-xl bg-slate-950/20 flex flex-col items-center justify-center gap-3">
                  <FolderLock size={32} className="text-slate-600" />
                  <p className="text-xs text-slate-400">
                    Unlock admin mode to upload new scans and manage documents.
                  </p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold rounded-lg transition-all"
                  >
                    Unlock Drive
                  </button>
                </div>
              )}
            </div>

            {/* Quick tips */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
              <h4 className="font-bold text-slate-300">💡 File Storage Tips</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Documents marked as <strong>Private</strong> require you to be logged in to download or view.</li>
                <li><strong>Public</strong> files can be shared with others by sending them the link directly.</li>
                <li>Files are saved directly on the VPS disk.</li>
              </ul>
            </div>

          </div>

          {/* Document Explorer Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search and Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Tabs */}
              <div className="flex gap-1.5 p-1 bg-slate-900/60 border border-slate-800 rounded-xl max-w-fit">
                <button
                  onClick={() => setActiveTab('public')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'public'
                      ? 'bg-slate-800 text-slate-100 border border-slate-700/50 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Share2 size={13} />
                  Shared Folder ({publicCount})
                </button>
                <button
                  onClick={() => {
                    if (!authenticated) {
                      setShowLoginModal(true);
                    } else {
                      setActiveTab('protected');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'protected'
                      ? 'bg-slate-850 text-purple-400 border border-purple-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FolderLock size={13} />
                  Protected Vault ({authenticated ? protectedCount : '🔐'})
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/40 hover:bg-slate-900/60 focus:bg-slate-900 border border-slate-800 rounded-xl text-xs outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 text-slate-200 placeholder-slate-500 transition-all"
                />
              </div>

            </div>

            {/* Document List Panel */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-md overflow-hidden">
              {loading ? (
                // Skeletons
                <div className="divide-y divide-slate-850/50">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-4 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800" />
                        <div className="space-y-2">
                          <div className="w-48 h-3.5 rounded bg-slate-800" />
                          <div className="w-24 h-2 rounded bg-slate-850" />
                        </div>
                      </div>
                      <div className="w-20 h-8 rounded bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : filteredFiles.length === 0 ? (
                // Empty state
                <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-slate-600">
                    {activeTab === 'protected' ? <FolderLock size={40} /> : <Share2 size={40} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-300">No documents found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {searchQuery 
                        ? 'No files match your current search query.' 
                        : activeTab === 'protected'
                          ? 'This protected vault folder is empty. Upload items here securely.'
                          : 'No files have been added to the public folder yet.'}
                    </p>
                  </div>
                </div>
              ) : (
                // Files list
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950/20">
                        <th className="py-3.5 px-5">Name</th>
                        <th className="py-3.5 px-5 hidden sm:table-cell">Size</th>
                        <th className="py-3.5 px-5 hidden md:table-cell">Uploaded Date</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/30 text-xs">
                      {filteredFiles.map((file) => (
                        <tr key={file.name} className="hover:bg-slate-900/10 transition-colors group">
                          {/* File Name & Icon */}
                          <td className="py-3.5 px-5 font-semibold text-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl group-hover:border-slate-800 transition-all">
                                {getFileIcon(file.name)}
                              </div>
                              <div className="truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                <span className="hover:text-purple-400 cursor-pointer block truncate" title={file.name}>
                                  {file.name}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* File Size */}
                          <td className="py-3.5 px-5 text-slate-400 font-medium hidden sm:table-cell">
                            {formatSize(file.size)}
                          </td>

                          {/* Upload Date */}
                          <td className="py-3.5 px-5 text-slate-500 font-medium hidden md:table-cell">
                            {formatDate(file.uploadedAt)}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open / View */}
                              <a
                                href={`/api/drive/download?name=${encodeURIComponent(file.name)}&type=${file.type}&view=true`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-all"
                                title="Open in New Tab"
                              >
                                <Eye size={15} />
                              </a>
                              
                              {/* Download */}
                              <a
                                href={`/api/drive/download?name=${encodeURIComponent(file.name)}&type=${file.type}`}
                                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-all"
                                title="Download File"
                              >
                                <Download size={15} />
                              </a>

                              {/* Delete (Admin only) */}
                              {authenticated && (
                                <button
                                  onClick={() => handleDelete(file.name, file.type)}
                                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-all"
                                  title="Delete File"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Login Overlay Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-3">
                <Lock size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Unlock Secure Vault</h3>
              <p className="text-slate-400 text-xs mt-1">
                Enter your password to access protected files.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter vault password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:border-purple-500 text-slate-200 placeholder-slate-600 transition-all"
                  autoFocus
                />
                {loginError && (
                  <p className="text-red-400 text-[11px] font-semibold mt-1.5 pl-1">
                    ⚠️ {loginError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError('');
                    setPassword('');
                  }}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/10 transition-all hover:shadow-purple-600/20"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
