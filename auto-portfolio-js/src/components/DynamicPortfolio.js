'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AnimatedBackground } from './AnimatedBackground';
import { FloatingNavbar } from '@/components/ui/floating-navbar';

// Dynamically import section components
const HeroSection = dynamic(() => import('./sections/HeroSection'), { ssr: false });
const ProjectsSection = dynamic(() => import('./sections/ProjectsSection'), { ssr: false });
const TimelineSection = dynamic(() => import('./sections/TimelineSection'), { ssr: false });
const BentoSection = dynamic(() => import('./sections/BentoSection'), { ssr: false });
const ContactSection = dynamic(() => import('./sections/ContactSection'), { ssr: false });

const sectionComponents = {
  hero: HeroSection,
  projects: ProjectsSection,
  timeline: TimelineSection,
  bento: BentoSection,
  contact: ContactSection,
};

export default function DynamicPortfolio() {
  const [config, setConfig] = useState(null);
  const [layoutOrder, setLayoutOrder] = useState(['hero', 'projects', 'timeline', 'bento', 'contact']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch configuration
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        if (data.layoutOrder) {
          try {
            const parsed = typeof data.layoutOrder === 'string' 
              ? JSON.parse(data.layoutOrder) 
              : data.layoutOrder;
            if (Array.isArray(parsed)) {
              setLayoutOrder(parsed);
            }
          } catch (e) {
            console.error('Failed to parse layoutOrder:', e);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading config:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <AnimatedBackground />
      <FloatingNavbar sections={layoutOrder} />
      
      {layoutOrder.map((sectionName, index) => {
        const SectionComponent = sectionComponents[sectionName];
        if (!SectionComponent) return null;
        
        return (
          <div key={sectionName} id={sectionName}>
            <SectionComponent config={config} />
          </div>
        );
      })}
    </div>
  );
}
