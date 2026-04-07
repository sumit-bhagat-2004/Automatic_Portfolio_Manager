'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Timeline() {
  const [events, setEvents] = useState({ education: [], experience: [] });

  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => {
        const education = data.filter(e => e.category === 'education');
        const experience = data.filter(e => e.category === 'experience');
        setEvents({ education, experience });
      })
      .catch(console.error);
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl font-bold mb-16 text-center"
      >
        My Journey
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Education */}
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-gray-200">Education</h3>
          <TimelineColumn events={events.education} />
        </div>

        {/* Experience */}
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-gray-200">Experience</h3>
          <TimelineColumn events={events.experience} />
        </div>
      </div>
    </section>
  );
}

function TimelineColumn({ events }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

      <div className="space-y-8 ml-8">
        {events.map((event, index) => (
          <TimelineEvent key={event.id} event={event} index={index} />
        ))}
      </div>
    </div>
  );
}

function TimelineEvent({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Dot */}
      <div className="absolute -left-9 top-2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-900" />

      {/* Content card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-xl font-semibold text-white">{event.title}</h4>
          <span className="text-sm text-gray-400 whitespace-nowrap ml-4">{event.dateRange}</span>
        </div>
        
        {event.subtitle && (
          <p className="text-gray-300 font-medium mb-2">{event.subtitle}</p>
        )}
        
        {event.description && (
          <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
        )}
      </div>
    </motion.div>
  );
}
