'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import dynamic from 'next/dynamic';

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
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
        const res = await fetch('/api/admin/verify', { credentials: 'include' });
        if (res.ok) setAuthenticated(true);
      } catch (err) {
        console.error('Auth check failed:', err);
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
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });
      if (res.ok) {
        setAuthenticated(true);
        setPassword('');
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      alert('Login failed');
    }
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
      
      // Include ID for PUT requests in the body
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
        alert('Project saved!');
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
  
  // Safe JSON parser
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
      
      // Include ID for PUT requests
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
        alert('Timeline event saved!');
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
    
    // Update orderIndex for all items
    const updated = items.map((item, index) => ({
      ...item,
      orderIndex: index
    }));
    
    setTimelineEvents(updated);
    
    // Save new order to database
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
      alert('Resume uploaded!');
    } catch (err) {
      console.error('Failed to upload resume:', err);
      alert('Upload failed');
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold text-white mb-6">🔐 Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Split Screen Layout */}
      <div className="flex h-screen">
        {/* Left Panel - Editor */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-700">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              🚀 God-Mode Admin Console
            </h1>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 rounded transition-colors ${activeTab === 'projects' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                📁 Projects
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded transition-colors ${activeTab === 'timeline' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                📅 Timeline
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={`px-4 py-2 rounded transition-colors ${activeTab === 'layout' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                🎨 Layout
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded transition-colors ${activeTab === 'settings' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                ⚙️ Settings
              </button>
            </div>
            
            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Projects Management</h2>
                  <button
                    onClick={handleGitHubSync}
                    disabled={syncing}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 transition-colors"
                  >
                    {syncing ? '⏳ Syncing...' : '🔄 Sync GitHub'}
                  </button>
                </div>
                {syncMessage && (
                  <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">{syncMessage}</div>
                )}
                
                {/* Project Form with Rich Text Editor */}
                <form onSubmit={handleProjectSave} className="mb-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold mb-4">
                    {selectedProject ? '✏️ Edit Project' : '➕ Add New Project'}
                  </h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Project Name *"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                      required
                    />
                    
                    <input
                      type="url"
                      placeholder="Project URL (https://...)"
                      value={projectForm.url}
                      onChange={(e) => setProjectForm({...projectForm, url: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    
                    <input
                      type="text"
                      placeholder="Primary Language (e.g., JavaScript, Python)"
                      value={projectForm.language}
                      onChange={(e) => setProjectForm({...projectForm, language: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Project Summary (Rich Text)</label>
                      <ReactQuill
                        theme="snow"
                        value={projectForm.summary}
                        onChange={(value) => setProjectForm({...projectForm, summary: value})}
                        className="bg-white text-black rounded"
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
                    
                    <input
                      type="text"
                      placeholder="Tags (comma-separated: react, typescript, api)"
                      value={projectForm.tags.join(', ')}
                      onChange={(e) => setProjectForm({...projectForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={projectForm.visible}
                          onChange={(e) => setProjectForm({...projectForm, visible: e.target.checked})}
                          className="mr-2 w-4 h-4"
                        />
                        <span>👁️ Visible on Portfolio</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={projectForm.featured}
                          onChange={(e) => setProjectForm({...projectForm, featured: e.target.checked})}
                          className="mr-2 w-4 h-4"
                        />
                        <span>⭐ Featured Project</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                      {selectedProject ? '💾 Update' : '➕ Create'} Project
                    </button>
                    {selectedProject && (
                      <button
                        type="button"
                        onClick={resetProjectForm}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        ✖️ Cancel
                      </button>
                    )}
                  </div>
                </form>
                
                {/* Projects List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold mb-3">All Projects ({projects.length})</h3>
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{project.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {project.language} • {project.stars} ⭐ • {project.forks} 🍴
                          </p>
                          <div className="flex gap-2 mt-2">
                            {project.featured && <span className="text-xs bg-yellow-600 px-2 py-1 rounded">⭐ Featured</span>}
                            {project.visible && <span className="text-xs bg-green-600 px-2 py-1 rounded">👁️ Visible</span>}
                            {!project.visible && <span className="text-xs bg-gray-600 px-2 py-1 rounded">🔒 Hidden</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editProject(project)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleProjectDelete(project.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Timeline Management</h2>
                  <button
                    onClick={handleGenerateTimeline}
                    disabled={generating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 transition-colors"
                  >
                    {generating ? '⏳ Generating...' : '🤖 AI Generate from GitHub'}
                  </button>
                </div>
                {syncMessage && (
                  <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">{syncMessage}</div>
                )}
                
                {/* Timeline Event Form */}
                <form onSubmit={handleTimelineSave} className="mb-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold mb-4">
                    {selectedEvent ? '✏️ Edit Event' : '➕ Add Timeline Event'}
                  </h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title (e.g., Senior Software Engineer) *"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                      required
                    />
                    
                    <input
                      type="text"
                      placeholder="Subtitle (e.g., Company Name / University)"
                      value={eventForm.subtitle}
                      onChange={(e) => setEventForm({...eventForm, subtitle: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    
                    <input
                      type="text"
                      placeholder="Date Range (e.g., 2020 - 2023)"
                      value={eventForm.dateRange}
                      onChange={(e) => setEventForm({...eventForm, dateRange: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    
                    <textarea
                      placeholder="Description / Achievements"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none h-24"
                    />
                    
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    >
                      <option value="experience">💼 Experience</option>
                      <option value="education">🎓 Education</option>
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Order Index (0 = first)"
                      value={eventForm.orderIndex}
                      onChange={(e) => setEventForm({...eventForm, orderIndex: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                      {selectedEvent ? '💾 Update' : '➕ Create'} Event
                    </button>
                    {selectedEvent && (
                      <button
                        type="button"
                        onClick={resetEventForm}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        ✖️ Cancel
                      </button>
                    )}
                  </div>
                </form>
                
                {/* Timeline Events List with Drag-and-Drop */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Timeline Events (Drag to Reorder)</h3>
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
                                  className={`p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors ${
                                    snapshot.isDragging ? 'opacity-70 shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl cursor-grab">☰</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">{event.category === 'education' ? '🎓' : '💼'}</span>
                                        <h4 className="font-bold">{event.title}</h4>
                                      </div>
                                      <p className="text-sm text-gray-400 mt-1">{event.subtitle}</p>
                                      <p className="text-xs text-gray-500 mt-1">{event.dateRange}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => editEvent(event)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => handleEventDelete(event.id)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                                      >
                                        🗑️
                                      </button>
                                    </div>
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
            
            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Page Layout Order</h2>
                <p className="text-gray-400 mb-6">Drag sections to reorder them on your homepage</p>
                
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
                                className={`p-5 bg-gray-800 rounded-lg border border-gray-700 flex items-center gap-4 ${
                                  snapshot.isDragging ? 'opacity-70 shadow-lg' : 'hover:border-gray-600'
                                }`}
                              >
                                <span className="text-3xl cursor-grab">☰</span>
                                <div className="flex-1">
                                  <span className="text-lg capitalize font-medium">{section}</span>
                                </div>
                                <span className="text-gray-500 font-mono">#{index + 1}</span>
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
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Portfolio Settings</h2>
                
                {/* Resume Upload */}
                <div className="mb-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold mb-4">📄 Resume / CV</h3>
                  {config?.resumeUrl && (
                    <div className="mb-4 p-3 bg-gray-700 rounded">
                      <a href={config.resumeUrl} target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                        📎 Current Resume: {config.resumeUrl}
                      </a>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  <p className="text-sm text-gray-400 mt-2">Upload PDF, DOC, or DOCX (max 10MB)</p>
                </div>
                
                {/* Theme Settings */}
                <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold mb-4">🎨 Theme</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-gray-400">Select Theme:</label>
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
                              alert('Theme updated!');
                            }
                          } catch (err) {
                            alert('Failed to update theme');
                          }
                        }}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Live Preview */}
        <div className="w-1/2 bg-gray-950">
          <div className="h-full flex flex-col">
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-400">📺 Live Preview</span>
              <button
                onClick={() => {
                  const iframe = document.getElementById('preview-iframe');
                  if (iframe) iframe.src = iframe.src;
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                🔄 Refresh Preview
              </button>
            </div>
            <iframe
              id="preview-iframe"
              src="http://localhost:3000"
              className="flex-1 w-full border-0"
              title="Portfolio Live Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
