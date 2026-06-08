'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getSkillIcon } from './sections/SkillsSection';

// Dynamically import ActivityCalendar (named export, not default!)
const ActivityCalendar = dynamic(
  () => import('react-activity-calendar').then((mod) => mod.ActivityCalendar),
  {
    ssr: false,
    loading: () => <div className="text-gray-500 text-sm">Loading calendar...</div>
  }
);

// Dynamically import Recharts components
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

export default function BentoGrid({ config }) {
  const [bentoItems, setBentoItems] = useState([]);

  useEffect(() => {
    if (config?.bentoData?.items) {
      setBentoItems(config.bentoData.items);
    }
  }, [config]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl font-bold mb-12 text-center"
      >
        About Me
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
        {bentoItems.map((item, index) => (
          <BentoItem key={item.id} item={item} index={index} config={config} />
        ))}
      </div>
    </section>
  );
}

function BentoItem({ item, index, config }) {
  const sizeClasses = {
    small: 'md:col-span-1 md:row-span-1',
    medium: 'md:col-span-1 md:row-span-2',
    large: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2 md:row-span-1',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`${sizeClasses[item.size]} rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-6 hover:border-gray-600 transition-all overflow-hidden`}
    >
      {item.type === 'github-calendar' && <GitHubCalendarWidget />}
      {item.type === 'stats' && <StatsWidget />}
      {item.type === 'skills' && <SkillsWidget config={config} />}
      {item.type === 'pie-chart' && <TechStackPieChart />}
      {item.type === 'bio' && <BioWidget content={item.content} />}
    </motion.div>
  );
}

function GitHubCalendarWidget() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'sumit-bhagat-2004';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch GitHub contribution data
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        // Use GitHub's public API to get contribution data
        const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        const result = await response.json();
        
        if (result.contributions) {
          // Transform data to the format ActivityCalendar expects
          const activities = result.contributions.map(day => ({
            date: day.date,
            count: day.count,
            level: day.level
          }));
          setData(activities);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch GitHub data:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchGitHubData();
  }, [username]);
  
  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold mb-4">GitHub Activity</h3>
        <div className="text-gray-500 text-sm">Loading contributions...</div>
      </div>
    );
  }
  
  if (error || data.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold mb-4">GitHub Activity</h3>
        <div className="text-gray-500 text-sm">Unable to load calendar</div>
        <a 
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
        >
          View on GitHub →
        </a>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">GitHub Activity</h3>
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <ActivityCalendar
          data={data}
          theme={{
            dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
          }}
          colorScheme="dark"
          blockSize={10}
          blockMargin={4}
          fontSize={12}
        />
      </div>
    </div>
  );
}

function StatsWidget() {
  const [stats, setStats] = useState({ projects: 0, stars: 0, repos: 0 });

  useEffect(() => {
    fetch('/api/projects?visible=true')
      .then(res => res.json())
      .then(projects => {
        const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);
        setStats({
          projects: projects.filter(p => p.featured).length,
          stars: totalStars,
          repos: projects.length,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="h-full flex flex-col justify-center">
      <h3 className="text-lg font-semibold mb-6">Quick Stats</h3>
      <div className="space-y-4">
        <StatItem label="Featured Projects" value={stats.projects} />
        <StatItem label="Total Stars" value={stats.stars} />
        <StatItem label="Repositories" value={stats.repos} />
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}

function SkillsWidget({ config }) {
  const skills = (config?.skillsData && Array.isArray(config.skillsData) && config.skillsData.length > 0)
    ? config.skillsData 
    : [
        { name: 'JavaScript', category: 'Languages', level: 90 },
        { name: 'TypeScript', category: 'Languages', level: 85 },
        { name: 'Python', category: 'Languages', level: 75 },
        { name: 'React', category: 'Frontend', level: 90 },
        { name: 'Next.js', category: 'Frontend', level: 85 },
        { name: 'Tailwind CSS', category: 'Frontend', level: 95 },
        { name: 'Node.js', category: 'Backend', level: 80 },
        { name: 'Prisma', category: 'Backend', level: 80 },
      ];

  // Group skills by category
  const categories = skills.reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col justify-start text-left">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-1.5">
        <Sparkles size={16} className="text-purple-400" />
        <span>Skills Overview</span>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-purple-900/40">
        {Object.entries(categories).map(([catName, catSkills]) => (
          <div key={catName} className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-wider text-gray-500 pl-0.5">{catName}</span>
            <div className="flex flex-wrap gap-1.5">
              {catSkills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 hover:border-purple-500/30 text-gray-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="shrink-0">{getSkillIcon(skill.name, skill.iconType, skill.iconValue, 12)}</span>
                  <span>{skill.name}</span>
                  {skill.level && (
                    <span className="text-[8.5px] text-purple-400 font-black">{skill.level}%</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechStackPieChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/projects?visible=true')
      .then(res => res.json())
      .then(data => {
        const langCount = {};
        data.forEach(p => {
          if (p.language) {
            langCount[p.language] = (langCount[p.language] || 0) + 1;
          }
        });
        
        const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        const chartData = Object.entries(langCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([lang, count], idx) => ({
            name: lang,
            value: count,
            color: colors[idx]
          }));
        
        setChartData(chartData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load chart data:', err);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-500">Loading chart...</div>;
  }

  if (chartData.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500">No data available</div>;
  }

  return (
    <div className="h-full flex flex-col justify-center">
      <h3 className="text-lg font-semibold mb-4 text-center">Tech Distribution</h3>
      <div className="flex-1 flex items-center justify-center">
        <PieChart width={220} height={220}>
          <Pie
            data={chartData}
            cx={110}
            cy={110}
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px' 
            }}
          />
        </PieChart>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
            <span className="text-xs text-gray-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BioWidget({ content }) {
  return (
    <div className="h-full flex flex-col justify-center">
      <h3 className="text-lg font-semibold mb-4">About</h3>
      <p className="text-gray-300 leading-relaxed">
        {content || 'Full-stack developer passionate about building innovative web applications. I love working with modern technologies and creating seamless user experiences.'}
      </p>
    </div>
  );
}
