'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FolderGit2, Calendar, Layout, Settings, LogOut, Upload, Plus, Trash2, Edit3, 
  Sparkles, RefreshCw, Image, FileText, Check, AlertCircle, Eye, EyeOff, Globe 
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  
  // Projects state
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    url: '',
    language: '',
    summary: '',
    tags: [],
    visible: true,
    featured: false
  });
  
  // Config state
  const [config, setConfig] = useState(null);
  const [layoutOrder, setLayoutOrder] = useState([]);
  
  // Dynamic AI settings state
  const [aiMethod, setAiMethod] = useState('official');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiProxyUrl, setGeminiProxyUrl] = useState('');
  const [geminiProxyKey, setGeminiProxyKey] = useState('');
  
  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    subtitle: '',
    dateRange: '',
    description: '',
    category: 'experience',
    orderIndex: 0
  });
  
  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/verify');
        if (res.ok) {
          setAuthenticated(true);
        } else {
          window.location.href = '/admin/login';
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        window.location.href = '/admin/login';
      }
    };
    checkAuth();
  }, []);
  
  // Load data when authenticated
  useEffect(() => {
    if (authenticated) {
      loadProjects();
      loadConfig();
      loadTimeline();
    }
  }, [authenticated]);
  
  const handleLogout = () => {
    document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem('admin-auth');
    window.location.href = '/admin/login';
  };
  
  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };
  
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
      setLayoutOrder(data.layoutOrder || ['hero', 'projects', 'timeline', 'bento', 'contact']);
      
      // Load AI settings into state
      setAiMethod(data.aiMethod || 'official');
      setGeminiApiKey(data.geminiApiKey || '');
      setGeminiProxyUrl(data.geminiProxyUrl || '');
      setGeminiProxyKey(data.geminiProxyKey || '');
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };
  
  const loadTimeline = async () => {
    try {
      const res = await fetch('/api/timeline');
      const data = await res.json();
      setTimelineEvents(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (err) {
      console.error('Failed to load timeline:', err);
    }
  };
  
  const handleProjectSave = async (e) => {
    e.preventDefault();
    try {
      const method = selectedProject ? 'PUT' : 'POST';
      const url = '/api/projects';
      
      const payload = {
        ...projectForm,
        tags: JSON.stringify(projectForm.tags || [])
      };
      
      if (selectedProject) {
        payload.id = selectedProject.id;
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await loadProjects();
        resetProjectForm();
        alert('Project saved successfully!');
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Failed to save project: ' + err.message);
    }
  };
  
  const resetProjectForm = () => {
    setSelectedProject(null);
    setProjectForm({
      name: '',
      url: '',
      language: '',
      summary: '',
      tags: [],
      visible: true,
      featured: false
    });
  };
  
  const handleProjectDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };
  
  const editProject = (project) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name || '',
      url: project.url || '',
      language: project.language || '',
      summary: project.summary || '',
      tags: Array.isArray(project.tags) ? project.tags : (project.tags ? safeParseJSON(project.tags, []) : []),
      visible: project.visible,
      featured: project.featured
    });
  };
  
  const safeParseJSON = (str, defaultValue = []) => {
    if (!str || str === 'null' || str === 'undefined') return defaultValue;
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error('JSON parse error:', e);
      return defaultValue;
    }
  };
  
  const handleTimelineSave = async (e) => {
    e.preventDefault();
    try {
      const method = selectedEvent ? 'PUT' : 'POST';
      const url = '/api/timeline';
      
      const payload = { ...eventForm };
      
      if (selectedEvent) {
        payload.id = selectedEvent.id;
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await loadTimeline();
        resetEventForm();
        alert('Timeline event saved successfully!');
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to save timeline event:', err);
      alert('Failed to save event: ' + err.message);
    }
  };
  
  const resetEventForm = () => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      subtitle: '',
      dateRange: '',
      description: '',
      category: 'experience',
      orderIndex: 0
    });
  };
  
  const handleEventDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetch(`/api/timeline?id=${id}`, { method: 'DELETE' });
      loadTimeline();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };
  
  const editEvent = (event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title || '',
      subtitle: event.subtitle || '',
      dateRange: event.dateRange || '',
      description: event.description || '',
      category: event.category || 'experience',
      orderIndex: event.orderIndex || 0
    });
  };
  
  const handleTimelineDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(timelineEvents);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    const updated = items.map((item, index) => ({
      ...item,
      orderIndex: index
    }));
    
    setTimelineEvents(updated);
    
    try {
      for (const item of updated) {
        await fetch('/api/timeline', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, orderIndex: item.orderIndex })
        });
      }
    } catch (err) {
      console.error('Failed to save timeline order:', err);
    }
  };
  
  const handleGenerateTimeline = async () => {
    if (!confirm('This will analyze your GitHub commits and generate timeline events. Continue?')) return;
    
    setGenerating(true);
    setSyncMessage('Analyzing GitHub activity...');
    
    try {
      const res = await fetch('/api/timeline/generate', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setSyncMessage(`✅ Generated ${data.count} timeline events!`);
        loadTimeline();
      } else {
        setSyncMessage('❌ Failed to generate timeline: ' + data.error);
      }
    } catch (err) {
      setSyncMessage('❌ Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };
  
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(layoutOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLayoutOrder(items);
    
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutOrder: items })
      });
    } catch (err) {
      console.error('Failed to save layout order:', err);
    }
  };
  
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrl: data.url })
      });
      
      loadConfig();
      alert('Resume uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload resume:', err);
      alert('Upload failed');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userImage: data.url })
      });
      
      loadConfig();
      alert('Avatar uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Avatar upload failed');
    }
  };

  const handleAISettingsSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiMethod,
          geminiApiKey,
          geminiProxyUrl,
          geminiProxyKey,
        }),
      });
      if (res.ok) {
        await loadConfig();
        alert('AI settings saved successfully!');
      } else {
        alert('Failed to save AI settings');
      }
    } catch (err) {
      console.error('Failed to save AI settings:', err);
      alert('Failed to save AI settings');
    }
  };
  
  const handleGitHubSync = async () => {
    setSyncing(true);
    setSyncMessage('Syncing with GitHub...');
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' });
      const data = await res.json();
      setSyncMessage(`✅ Synced! Added: ${data.added}, Updated: ${data.updated}`);
      loadProjects();
    } catch (err) {
      setSyncMessage('❌ Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };
  
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              CMS Dashboard
            </h1>
            <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Portfolio Management</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Split Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - Editor Controls */}
        <div className="w-1/2 overflow-y-auto border-r border-white/10 bg-gray-950/30">
          <div className="p-8">
            
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl mb-8">
              {[
                { id: 'projects', label: 'Projects', icon: FolderGit2 },
                { id: 'timeline', label: 'Timeline', icon: Calendar },
                { id: 'layout', label: 'Layout', icon: Layout },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Tab: Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black">Projects Catalog</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage project details, metadata, and visibility</p>
                  </div>
                  <button
                    onClick={handleGitHubSync}
                    disabled={syncing}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                    <span>{syncing ? 'Syncing...' : 'Sync GitHub'}</span>
                  </button>
                </div>

                {syncMessage && (
                  <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-purple-300 text-sm flex items-center gap-2">
                    <Sparkles size={16} className="shrink-0" />
                    <span>{syncMessage}</span>
                  </div>
                )}
                
                {/* Project Editor Form */}
                <form onSubmit={handleProjectSave} className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-xl space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-purple-300">
                    <Plus size={18} />
                    <span>{selectedProject ? 'Modify Project' : 'Register New Project'}</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Project Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. vertex-vault"
                          value={projectForm.name}
                          onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Primary Language</label>
                        <input
                          type="text"
                          placeholder="e.g. Python, TypeScript"
                          value={projectForm.language}
                          onChange={(e) => setProjectForm({...projectForm, language: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Project Live Link / URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={projectForm.url}
                        onChange={(e) => setProjectForm({...projectForm, url: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Project Description (Rich HTML Summary)</label>
                      <div className="bg-white text-black rounded-2xl overflow-hidden border border-white/10">
                        <ReactQuill
                          theme="snow"
                          value={projectForm.summary}
                          onChange={(value) => setProjectForm({...projectForm, summary: value})}
                          className="text-black"
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              ['link', 'code-block'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['clean']
                            ]
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Tags (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="react, tailwindcss, nextjs"
                        value={projectForm.tags.join(', ')}
                        onChange={(e) => setProjectForm({...projectForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-6 p-1 bg-white/5 rounded-2xl border border-white/5 justify-around py-3">
                      <label className="flex items-center cursor-pointer gap-2 hover:opacity-80 transition-opacity">
                        <input
                          type="checkbox"
                          checked={projectForm.visible}
                          onChange={(e) => setProjectForm({...projectForm, visible: e.target.checked})}
                          className="w-4.5 h-4.5 accent-purple-600 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-300 font-semibold flex items-center gap-1"><Eye size={14} /> Visible</span>
                      </label>
                      <label className="flex items-center cursor-pointer gap-2 hover:opacity-80 transition-opacity">
                        <input
                          type="checkbox"
                          checked={projectForm.featured}
                          onChange={(e) => setProjectForm({...projectForm, featured: e.target.checked})}
                          className="w-4.5 h-4.5 accent-purple-600 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-300 font-semibold flex items-center gap-1">⭐ Feature Spotlight</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all text-sm">
                      {selectedProject ? 'Save Changes' : 'Register Project'}
                    </button>
                    {selectedProject && (
                      <button
                        type="button"
                        onClick={resetProjectForm}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold rounded-2xl transition-all text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
                
                {/* Projects Grid List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>Registered Catalog</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-400">{projects.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        className="p-4 bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-2xl shadow-md transition-all flex justify-between items-center"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="font-bold text-white truncate text-base">{project.name}</h4>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {project.language && (
                              <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 font-medium">
                                {project.language}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-500 font-semibold">{project.stars} Stars</span>
                            {project.featured && (
                              <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-full font-bold">
                                Spotlight
                              </span>
                            )}
                            {project.visible ? (
                              <span className="text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-300 rounded-full font-bold">
                                Visible
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-full font-bold">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editProject(project)}
                            className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 rounded-xl transition-all"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleProjectDelete(project.id)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab: Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black">Timeline Events</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage experiences, certifications, and educational accomplishments</p>
                  </div>
                  <button
                    onClick={handleGenerateTimeline}
                    disabled={generating}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all flex items-center gap-2"
                  >
                    <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
                    <span>{generating ? 'Processing...' : 'AI Generate'}</span>
                  </button>
                </div>

                {syncMessage && (
                  <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-purple-300 text-sm flex items-center gap-2">
                    <Sparkles size={16} className="shrink-0" />
                    <span>{syncMessage}</span>
                  </div>
                )}
                
                {/* Timeline Event Form */}
                <form onSubmit={handleTimelineSave} className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-xl space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-purple-300">
                    <Plus size={18} />
                    <span>{selectedEvent ? 'Modify Timeline Event' : 'Create Timeline Event'}</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Event Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Software Engineer"
                          value={eventForm.title}
                          onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Subtitle / Institution</label>
                        <input
                          type="text"
                          placeholder="e.g. Oracle Corp, KIIT University"
                          value={eventForm.subtitle}
                          onChange={(e) => setEventForm({...eventForm, subtitle: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Date Range *</label>
                        <input
                          type="text"
                          placeholder="e.g. 2022 - Present, Jul 2021"
                          value={eventForm.dateRange}
                          onChange={(e) => setEventForm({...eventForm, dateRange: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Category</label>
                        <select
                          value={eventForm.category}
                          onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                          className="w-full bg-gray-900 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm cursor-pointer"
                        >
                          <option value="experience">💼 Professional Experience</option>
                          <option value="education">🎓 Academics / Certifications</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Event Description</label>
                      <textarea
                        placeholder="Detail key responsibilities, deliverables, and projects completed during this phase."
                        value={eventForm.description}
                        onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3.5 rounded-2xl outline-none transition-colors text-sm h-28 resize-none placeholder-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Order Index (Sort Weight)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={eventForm.orderIndex}
                        onChange={(e) => setEventForm({...eventForm, orderIndex: parseInt(e.target.value) || 0})}
                        className="w-24 bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all text-sm">
                      {selectedEvent ? 'Save Event' : 'Add Event'}
                    </button>
                    {selectedEvent && (
                      <button
                        type="button"
                        onClick={resetEventForm}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold rounded-2xl transition-all text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
                
                {/* Drag and drop reordering list */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Organized Timeline (Drag to Re-arrange)</h3>
                  <DragDropContext onDragEnd={handleTimelineDragEnd}>
                    <Droppable droppableId="timeline-events">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {timelineEvents.map((event, index) => (
                            <Draggable key={event.id} draggableId={event.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/30 flex items-start gap-4 transition-all ${
                                    snapshot.isDragging ? 'bg-purple-950/20 shadow-xl opacity-80 border-purple-500/40' : ''
                                  }`}
                                >
                                  <span className="text-2xl text-gray-600 cursor-grab select-none pt-1">☰</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{event.category === 'education' ? '🎓' : '💼'}</span>
                                      <h4 className="font-bold text-white truncate text-base">{event.title}</h4>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{event.subtitle}</p>
                                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{event.dateRange}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => editEvent(event)}
                                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 rounded-lg transition-all"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleEventDelete(event.id)}
                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            )}
            
            {/* Tab: Layout */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">Landing Page Blueprint</h2>
                  <p className="text-xs text-gray-400 mt-1">Re-arrange modules to adjust homepage flow</p>
                </div>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {layoutOrder.map((section, index) => (
                          <Draggable key={section} draggableId={section} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between transition-all ${
                                  snapshot.isDragging ? 'bg-purple-950/20 shadow-xl opacity-80 border-purple-500/40' : 'hover:border-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl text-gray-600 cursor-grab select-none">☰</span>
                                  <span className="text-lg capitalize font-bold text-gray-200">{section}</span>
                                </div>
                                <span className="text-[11px] font-mono bg-white/10 text-gray-400 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                                  Order #{index + 1}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
            
            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-black">Portfolio Settings</h2>
                  <p className="text-xs text-gray-400 mt-1">Configure user uploads, active theme, and database AI settings</p>
                </div>
                
                {/* Media & Uploads */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6 shadow-xl">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-purple-300">
                    <Upload size={18} />
                    <span>Uploads & Media</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Avatar Upload */}
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">
                        Profile Avatar / Photo
                      </label>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 overflow-hidden flex-shrink-0 bg-black/40 flex items-center justify-center">
                          {config?.userImage ? (
                            <img src={config.userImage} alt="Avatar Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Image size={24} className="text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            id="avatar-upload-input"
                          />
                          <label
                            htmlFor="avatar-upload-input"
                            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/10 cursor-pointer transition-all"
                          >
                            Upload Image
                          </label>
                          <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">PNG, JPG, or WEBP up to 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">
                        Resume / CV File
                      </label>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 overflow-hidden flex-shrink-0 bg-black/40 flex items-center justify-center">
                          <FileText size={24} className="text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            className="hidden"
                            id="resume-upload-input"
                          />
                          <label
                            htmlFor="resume-upload-input"
                            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/10 cursor-pointer transition-all"
                          >
                            Upload CV
                          </label>
                          {config?.resumeUrl ? (
                            <p className="text-[10px] text-green-400 mt-1.5 truncate max-w-[150px]">
                              📎 Active: {config.resumeUrl.substring(config.resumeUrl.lastIndexOf('/') + 1)}
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">PDF, DOCX up to 10MB</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Configuration Section */}
                <form onSubmit={handleAISettingsSave} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-purple-300">
                    <Sparkles size={18} />
                    <span>Dynamic AI Configuration (CMS)</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Gemini Method Type</label>
                      <select
                        value={aiMethod}
                        onChange={(e) => setAiMethod(e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 focus:border-purple-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors text-sm cursor-pointer"
                      >
                        <option value="official">🌐 Official Google Gemini API Endpoint</option>
                        <option value="proxy">⚡ OpenAI-compatible Gateway / Proxy Endpoint</option>
                      </select>
                    </div>

                    {aiMethod === 'official' ? (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Official Gemini API Key</label>
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3.5 rounded-2xl outline-none transition-colors text-sm font-mono placeholder-gray-600"
                        />
                        <p className="text-[10px] text-gray-500 mt-1.5">Direct official credentials to call Google Generative Language services.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Proxy Gateway Base URL</label>
                          <input
                            type="text"
                            placeholder="https://gemini.yourdomain.xyz/v1/chat/completions"
                            value={geminiProxyUrl}
                            onChange={(e) => setGeminiProxyUrl(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3.5 rounded-2xl outline-none transition-colors text-sm font-mono placeholder-gray-600"
                          />
                          <p className="text-[10px] text-gray-500 mt-1.5">Proxy server base path or endpoints mapping directly to Gemini LLMs.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Proxy Authorization Token / Key</label>
                          <input
                            type="password"
                            placeholder="sk-..."
                            value={geminiProxyKey}
                            onChange={(e) => setGeminiProxyKey(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-500 text-white px-4 py-3.5 rounded-2xl outline-none transition-colors text-sm font-mono placeholder-gray-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all text-sm flex items-center justify-center gap-1.5">
                    <Check size={16} />
                    <span>Apply AI Settings</span>
                  </button>
                </form>
                
                {/* Theme Settings */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-purple-300">
                    <Globe size={18} />
                    <span>Theme Customization</span>
                  </h3>
                  <div className="flex items-center gap-4 justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm text-gray-300 font-semibold">Application Theme</span>
                    <select
                      value={config?.theme || 'dark'}
                      onChange={async (e) => {
                        try {
                          const res = await fetch('/api/config', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ theme: e.target.value })
                          });
                          if (res.ok) {
                            await loadConfig();
                            alert('Theme updated successfully!');
                          }
                        } catch (err) {
                          alert('Failed to update theme');
                        }
                      }}
                      className="px-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-white text-sm outline-none cursor-pointer"
                    >
                      <option value="dark">Dark Theme</option>
                      <option value="light">Light Theme</option>
                      <option value="system">Follow System</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Live Preview Frame */}
        <div className="w-1/2 bg-gray-950 flex flex-col">
          <div className="p-4 bg-gray-950 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Preview</span>
            </div>
            <button
              onClick={() => {
                const iframe = document.getElementById('preview-iframe');
                if (iframe) iframe.src = iframe.src;
              }}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all flex items-center gap-1 text-xs"
            >
              <RefreshCw size={12} />
              <span>Refresh Frame</span>
            </button>
          </div>
          <iframe
            id="preview-iframe"
            src="/"
            className="flex-1 w-full bg-black border-0"
            title="Portfolio Live Preview"
          />
        </div>
      </div>
    </div>
  );
}
