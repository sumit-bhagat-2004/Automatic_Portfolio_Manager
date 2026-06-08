'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers } from 'lucide-react';

// ─── Icon Library ────────────────────────────────────────────────────────────
export function getSkillIcon(name, iconType, iconValue, size = 44) {
  let sz = size;
  let iType = iconType;
  let iValue = iconValue;

  if (typeof iconType === 'number') { sz = iconType; iType = undefined; iValue = undefined; }

  if (iType === 'custom' && iValue) {
    return (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
        <path d={iValue} fill="currentColor" />
      </svg>
    );
  }

  const key = (iType === 'preset' && iValue)
    ? iValue.toLowerCase()
    : name.toLowerCase().replace(/[\s\.\-_]/g, '');

  switch (key) {
    case 'javascript': case 'js':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#F7DF1E"/>
          <path d="M24.5 20c-.4-1-1.2-1.6-2.4-2-.9-.3-1.7-.5-1.7-1.1 0-.5.4-.8 1-.8.7 0 1.2.3 1.5.8l1.9-1.2c-.7-1.1-1.8-1.7-3.3-1.7-2 0-3.2 1.1-3.2 2.8 0 1.6 1.2 2.2 2.5 2.6 1.2.4 1.7.7 1.7 1.3 0 .6-.5.9-1.2.9-.9 0-1.5-.4-1.9-1.1l-1.9 1.3c.7 1.4 2 2 3.8 2 2.2 0 3.5-1.1 3.5-3v-1.2zM15.8 14H13.5v8.2c0 1.1-.5 1.6-1.4 1.6-.7 0-1.1-.3-1.3-.8l-1.9 1.3c.6 1.3 1.6 2 3.4 2 2.7 0 4-1.4 4-4V14h-2.5z" fill="#000"/>
        </svg>
      );
    case 'typescript': case 'ts':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#3178C6"/>
          <path d="M25.6 20.4c-.4-1-1.2-1.7-2.4-2-.9-.3-1.8-.5-1.8-1.2 0-.5.4-.8 1-.8.7 0 1.2.3 1.5.8l1.9-1.2c-.7-1.1-1.8-1.7-3.3-1.7-2 0-3.2 1.1-3.2 2.8 0 1.6 1.2 2.2 2.5 2.6 1.2.4 1.7.6 1.7 1.3 0 .6-.5.9-1.2.9-.9 0-1.5-.4-1.9-1.1l-1.9 1.3c.7 1.4 2 2 3.8 2 2.2 0 3.5-1.1 3.5-3v-1.7zM16.5 14H6v2.3h3.6V26h2.3V16.3h3.6V14h1z" fill="#fff"/>
        </svg>
      );
    case 'react': case 'reactjs':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#20232A"/>
          <ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61DAFB" strokeWidth="1.5"/>
          <ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 16 16)"/>
          <ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 16 16)"/>
          <circle cx="16" cy="16" r="2.5" fill="#61DAFB"/>
        </svg>
      );
    case 'nextjs': case 'next':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#000"/>
          <circle cx="16" cy="16" r="12" fill="#000"/>
          <path d="M22 22L13 10H11v12h2v-9l8 10h1z" fill="#fff"/>
          <path d="M20.5 10H22.5v10H20.5z" fill="#fff"/>
        </svg>
      );
    case 'nodejs': case 'node':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#333"/>
          <path d="M16 5l-10 5.8v11.4l10 5.8 10-5.8V10.8L16 5zm8 15.8l-8 4.6-8-4.6V11.2l8-4.6 8 4.6v9.6z" fill="#539E43"/>
          <path d="M16 9l-6 3.5v7l6 3.5 6-3.5v-7L16 9zm4.5 9.2L16 20.5l-4.5-2.3v-4.4l4.5-2.6 4.5 2.6v4.4z" fill="#539E43"/>
        </svg>
      );
    case 'python':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1e3a5f"/>
          <path d="M16.1 4c-4.2 0-3.9 1.8-3.9 1.8v2h4v.6H8.7S6 8 6 12.4s2.9 5.7 2.9 5.7h1.8v-2.4c0-3 2.4-5.3 5.3-5.3h4.9s1.8 0 1.8-1.8V7.2C22.7 5.5 21 4 16.1 4z" fill="#3776AB"/>
          <path d="M15.9 28c4.2 0 3.9-1.8 3.9-1.8v-2h-4v-.6h7.5s2.7-.4 2.7-4.8-2.9-5.7-2.9-5.7H21.4v2.4c0 3-2.4 5.3-5.3 5.3H11.2s-1.8 0-1.8 1.8v3.6C9.4 26.5 11 28 15.9 28z" fill="#FFD343"/>
          <circle cx="13.5" cy="7" r="1" fill="#fff"/>
          <circle cx="18.5" cy="25" r="1" fill="#fff"/>
        </svg>
      );
    case 'tailwind': case 'tailwindcss':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#0F172A"/>
          <path d="M16 9c-2.4 4-4 6-4 8s1.6 3 4 3c2.4 0 4-2 4-4 0-2-1.6-3-4-3-1.2 0-2 .4-2.8 1.2C14.4 11.2 16 9 16 9zM10 17c-2.4 4-4 6-4 8s1.6 3 4 3c2.4 0 4-2 4-4 0-2-1.6-3-4-3-1.2 0-2 .4-2.8 1.2C8.4 19.2 10 17 10 17z" fill="#38BDF8"/>
        </svg>
      );
    case 'prisma':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a2e"/>
          <path d="M16 4L6 26h20L16 4zm0 5.5l6.5 14H9.5L16 9.5z" fill="#5A67D8"/>
          <path d="M16 13L12 22H20L16 13z" fill="#7C3AED" opacity="0.8"/>
        </svg>
      );
    case 'docker':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#003f8a"/>
          <rect x="5" y="13" width="4" height="3" rx=".5" fill="#2496ED"/>
          <rect x="10" y="13" width="4" height="3" rx=".5" fill="#2496ED"/>
          <rect x="15" y="13" width="4" height="3" rx=".5" fill="#2496ED"/>
          <rect x="10" y="9" width="4" height="3" rx=".5" fill="#2496ED"/>
          <rect x="15" y="9" width="4" height="3" rx=".5" fill="#2496ED"/>
          <rect x="15" y="5" width="4" height="3" rx=".5" fill="#2496ED"/>
          <path d="M26 15.5c-.3-.9-1.2-1.5-2.5-1.5H23c-.2-1.5-1-2-1-2l-.5.5c.2.4.5.8.5 1.5H5.5C5.2 17 5 20 7 22c1.7 1.8 4.5 2.5 7.5 2.5h6c3 0 5-1.5 6-3 .5-1 .5-2.5-.5-6z" fill="#2496ED"/>
        </svg>
      );
    case 'git':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#F05032"/>
          <path d="M29 15l-12-12c-.6-.6-1.6-.6-2.2 0L12.6 5.2 15 7.6c.5-.2 1.2-.1 1.6.4.5.5.6 1.1.4 1.6l2.3 2.3c.5-.2 1.2-.1 1.6.4.6.6.6 1.6 0 2.2-.6.6-1.6.6-2.2 0-.5-.5-.6-1.2-.3-1.7l-2.1-2.1v5.6c.3.1.5.3.7.5.6.6.6 1.6 0 2.2-.6.6-1.6.6-2.2 0-.6-.6-.6-1.6 0-2.2.2-.2.5-.4.8-.5V11c-.3-.1-.6-.3-.8-.5-.5-.5-.6-1.2-.3-1.7L12 6.4 3 15.4c-.6.6-.6 1.6 0 2.2l12 12c.6.6 1.6.6 2.2 0l12-12c.6-.7.6-1.7-.2-2.6z" fill="#fff"/>
        </svg>
      );
    case 'github':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#24292e"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M16 4C9.37 4 4 9.37 4 16c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.57 0-.28-.01-1.04-.01-2.04-3.34.72-4.04-1.6-4.04-1.6-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02 0 2.04.14 3 .41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.82.57C24.56 25.8 28 21.3 28 16c0-6.63-5.37-12-12-12z" fill="#fff"/>
        </svg>
      );
    case 'html': case 'html5':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
          <path d="M5 5l2.5 22.5L16 30l8.5-2.5L27 5H5z" fill="#E44D26"/>
          <path d="M16 27.5V7.5h9l-2 18L16 27.5z" fill="#F16529"/>
          <path d="M16 13.5h-4l-.3-3.5h4.3V6.5H8L9 15.5h7V13.5zm0 7l-3.2-.9-.2-2.6H9.3l.4 5 6.3 1.7V20.5z" fill="#fff"/>
          <path d="M16 13.5v2h3.7l-.4 4.1-3.3.9v3.2l6.3-1.7 1-11.5H16v3z" fill="#ebebeb"/>
        </svg>
      );
    case 'css': case 'css3':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
          <path d="M5 5l2.5 22.5L16 30l8.5-2.5L27 5H5z" fill="#264DE4"/>
          <path d="M16 27.5V7.5h9l-2 18L16 27.5z" fill="#2965F1"/>
          <path d="M16 13.5h-4l-.3-3.5h4.3V6.5H8L9 18.5h7v-5zm0 7l-3.2-.9-.2-3.6H9.3l.4 7 6.3 1.7V20.5z" fill="#fff"/>
          <path d="M16 13.5v5h3.5l-.3 4-3.2.9v3.3l6.3-1.7 1.5-11.5H16z" fill="#ebebeb"/>
        </svg>
      );
    case 'postgresql': case 'postgres':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#336791"/>
          <path d="M25 12c-1-4.5-4.5-7-9-7-5 0-9 3.5-9 10s4 11 9 11c2.5 0 5-1 6.5-3 .5-.8.8-1.5 1-2.5.2-1.5 0-3-.5-4.5z" fill="#fff" opacity="0.2"/>
          <path d="M16 7c-3.5 0-6 2.5-6 7 0 3 1 5.5 3 7l3-7.5 3 7.5c2-1.5 3-4 3-7 0-4.5-2.5-7-6-7z" fill="#fff"/>
          <circle cx="14" cy="13" r="1" fill="#336791"/>
          <circle cx="18" cy="13" r="1" fill="#336791"/>
        </svg>
      );
    case 'mongodb': case 'mongo':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
          <path d="M16 4c-4 4.2-5.5 8.5-5.5 12.5 0 5.2 4 9.5 5.5 10.5 1.5-1 5.5-5.3 5.5-10.5 0-4-1.5-8.3-5.5-12.5z" fill="#10AA50"/>
          <path d="M16.5 24.5v-17c2.5 3 4 6.5 4 9 0 4-2 6.8-4 8z" fill="#B8C4C2" opacity="0.5"/>
        </svg>
      );
    case 'sqlite':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#0F4B8F"/>
          <path d="M22 6c-2 0-4 1-5 3-1-1-2-1-3-1-3 0-5 3-5 7s2 7 5 7c1 0 2-.4 3-1v5h2v-5.5c.5.3 1 .5 2 .5 3.5 0 5-2.5 5-6s-2-9-4-9z" fill="#fff" opacity="0.9"/>
        </svg>
      );
    case 'aws':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#232F3E"/>
          <path d="M9 18.5c-2.2-.8-3.5-2.5-3.5-4.5 0-2.5 2-4.5 5-4.5 1 0 2 .3 2.8.8" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 19.5c.8.3 1.7.5 2.5.5 3 0 5-1.5 5-4 0-2-1.5-3.5-4-3.5" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7 22.5C9 25 12 26.5 16 26.5s7-1.5 9-4" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M22 21l3.5 1.5-3.5 1.5v-3z" fill="#FF9900"/>
        </svg>
      );
    case 'gcp': case 'googlecloud':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a2e"/>
          <path d="M20.5 11h-9l-5 9h19l-5-9z" fill="#4285F4"/>
          <path d="M11.5 11l-5 9h8l5-9h-8z" fill="#EA4335"/>
          <path d="M6.5 20h19l-3 5H9.5l-3-5z" fill="#FBBC05"/>
          <path d="M25.5 20l-3 5h-5l5-9 3 4z" fill="#34A853"/>
        </svg>
      );
    case 'linux':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
          <path d="M16 3c-2.5 0-5 2-5 7 0 3 1 5.5 2.5 7-1 .5-3 1.5-3 3.5 0 1.5 1 2.5 5.5 2.5s5.5-1 5.5-2.5c0-2-2-3-3-3.5C20 14.5 21 12 21 10c0-5-2.5-7-5-7z" fill="#fff" opacity="0.9"/>
          <circle cx="13.5" cy="12" r="1.5" fill="#1a1a1a"/>
          <circle cx="18.5" cy="12" r="1.5" fill="#1a1a1a"/>
          <path d="M14 15.5c.7.5 1.5.7 2.5.5" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case 'figma':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1e1e1e"/>
          <path d="M12 4c-2.2 0-4 1.8-4 4s1.8 4 4 4h4V4h-4z" fill="#F24E1E"/>
          <path d="M16 12v4c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4h-4z" fill="#1ABCFE"/>
          <path d="M12 12c-2.2 0-4 1.8-4 4s1.8 4 4 4h4v-8h-4z" fill="#A259FF"/>
          <path d="M12 20c-2.2 0-4 1.8-4 4s1.8 4 4 4h4v-8h-4z" fill="#0ACF83"/>
          <path d="M16 8V4h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V8z" fill="#FF7262"/>
        </svg>
      );
    case 'java':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
          <path d="M13 19.5c-2 1-2 3 2 2.5s9-1 9-1-9 2.5-11 1z" fill="#E76F00"/>
          <path d="M12 21.5c-2 1.5 1 3 6 2.5S27 22 27 22s-10 3-15 -.5z" fill="#E76F00"/>
          <path d="M16 4c1 2-4 4-2 7s7 1 4 4-5 2-3 4c0 0 4-3 2-6s-7-1-4-4 5-4 3-5z" fill="#E76F00"/>
          <path d="M13 30c5.5.5 10-1 10-1s-2 1.5-10 1.5V30z" fill="#E76F00"/>
        </svg>
      );
    case 'nginx':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#009639"/>
          <path d="M16 4L6 10v12l10 6 10-6V10L16 4zm0 4.5l7.5 4.3v8.4L16 25.5 8.5 21.2v-8.4L16 8.5z" fill="#fff"/>
          <path d="M16 11.5v9l-5-5 5-4zm0 9l5-5-5-4v9z" fill="#fff"/>
        </svg>
      );
    case 'redis':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
          <path d="M27 18.5l-11 4.5L5 18.5V15l11 4.5L27 15v3.5z" fill="#A41E11"/>
          <path d="M27 13L16 17.5 5 13l11-4.5L27 13z" fill="#D82C20"/>
          <path d="M12 10.5l4-2 4 2-4 2-4-2z" fill="#fff"/>
        </svg>
      );
    case 'kubernetes': case 'k8s':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#326CE5"/>
          <path d="M16 4l-10 5.8v12.4L16 28l10-5.8V9.8L16 4zm0 3l7.5 4.3v8.4L16 24 8.5 19.7v-8.4L16 7z" fill="#fff"/>
          <circle cx="16" cy="12" r="2" fill="#fff"/>
          <circle cx="10" cy="16" r="2" fill="#fff"/>
          <circle cx="22" cy="16" r="2" fill="#fff"/>
          <circle cx="13" cy="21" r="2" fill="#fff"/>
          <circle cx="19" cy="21" r="2" fill="#fff"/>
        </svg>
      );
    case 'rust':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
          <circle cx="16" cy="16" r="10" stroke="#CE422B" strokeWidth="2"/>
          <circle cx="16" cy="16" r="4" fill="#CE422B"/>
          <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#CE422B" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'go': case 'golang':
      return (
        <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#00ACD7"/>
          <circle cx="12" cy="16" r="2.5" fill="#fff"/>
          <circle cx="20" cy="16" r="2.5" fill="#fff"/>
          <circle cx="12.8" cy="15.2" r=".8" fill="#00ACD7"/>
          <circle cx="20.8" cy="15.2" r=".8" fill="#00ACD7"/>
          <path d="M9 13.5c0-1 .5-2 1.5-2.5 2-1 7-1 9 0 1 .5 1.5 1.5 1.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    default: {
      const initials = name.slice(0, 2).toUpperCase();
      return (
        <div className="flex items-center justify-center font-black text-lg rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white" style={{ width: sz, height: sz }}>
          {initials}
        </div>
      );
    }
  }
}

// ─── Category Config ─────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Languages:  { color: '#F59E0B', glow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.25)]',  border: 'hover:border-yellow-500/40',  tag: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  Frontend:   { color: '#06B6D4', glow: 'hover:shadow-[0_8px_40px_rgba(6,182,212,0.25)]',   border: 'hover:border-cyan-400/40',    tag: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  Backend:    { color: '#A855F7', glow: 'hover:shadow-[0_8px_40px_rgba(168,85,247,0.25)]',  border: 'hover:border-purple-400/40',  tag: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  DevOps:     { color: '#3B82F6', glow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)]',  border: 'hover:border-blue-400/40',    tag: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  Tools:      { color: '#10B981', glow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.25)]',  border: 'hover:border-emerald-400/40', tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  Database:   { color: '#F97316', glow: 'hover:shadow-[0_8px_40px_rgba(249,115,22,0.25)]',  border: 'hover:border-orange-400/40',  tag: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  Other:      { color: '#8B5CF6', glow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.25)]',  border: 'hover:border-violet-400/40',  tag: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
};

const getCatConfig = (cat) => CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.Other;

// Default skills for when no data is configured
const DEFAULT_SKILLS = [
  { name: 'JavaScript', category: 'Languages', level: 90 },
  { name: 'TypeScript', category: 'Languages', level: 85 },
  { name: 'Python', category: 'Languages', level: 75 },
  { name: 'React', category: 'Frontend', level: 90 },
  { name: 'Next.js', category: 'Frontend', level: 88 },
  { name: 'Tailwind CSS', category: 'Frontend', level: 95 },
  { name: 'HTML', category: 'Frontend', level: 95 },
  { name: 'CSS', category: 'Frontend', level: 90 },
  { name: 'Node.js', category: 'Backend', level: 82 },
  { name: 'Prisma', category: 'Backend', level: 80 },
  { name: 'Docker', category: 'DevOps', level: 75 },
  { name: 'Git', category: 'Tools', level: 92 },
  { name: 'GitHub', category: 'Tools', level: 90 },
  { name: 'Figma', category: 'Tools', level: 70 },
  { name: 'PostgreSQL', category: 'Database', level: 78 },
  { name: 'MongoDB', category: 'Database', level: 75 },
];

export default function SkillsSection({ config }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const skills = (config?.skillsData && Array.isArray(config.skillsData) && config.skillsData.length > 0)
    ? config.skillsData
    : DEFAULT_SKILLS;

  const categories = ['All', ...new Set(skills.map(s => s.category).filter(Boolean))];

  const filteredSkills = activeFilter === 'All'
    ? skills
    : skills.filter(s => s.category === activeFilter);

  return (
    <section id="skills" className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Deep background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Layers size={12} />
            <span>Technical Expertise</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-5 leading-none">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent">
              Skills &
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent">
              Toolkit
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            A curated stack of tools and technologies I use to ship production-grade software.
          </p>
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2.5 justify-center mb-14"
        >
          {categories.map(cat => {
            const cfg = cat === 'All' ? null : getCatConfig(cat);
            const isActive = activeFilter === cat;
            return (
              <motion.button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg shadow-purple-500/30'
                    : 'bg-white/[0.04] text-gray-400 border-white/[0.06] hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, index) => {
              const cfg = getCatConfig(skill.category);
              const lvl = skill.level ?? 80;

              return (
                <motion.div
                  layout
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className={`group relative flex flex-col items-center gap-4 p-6 bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] rounded-3xl shadow-xl cursor-default transition-all duration-500 hover:-translate-y-2 ${cfg.glow} ${cfg.border}`}
                >
                  {/* Subtle category glow bg on hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${cfg.color}10 0%, transparent 70%)` }}
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 rounded-2xl overflow-hidden shadow-md"
                  >
                    {getSkillIcon(skill.name, skill.iconType, skill.iconValue, 56)}
                  </motion.div>

                  {/* Name */}
                  <div className="relative z-10 text-center w-full">
                    <h3 className="font-bold text-white text-sm leading-tight group-hover:text-white transition-colors">
                      {skill.name}
                    </h3>

                    {/* Category badge */}
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.tag}`}>
                      {skill.category}
                    </span>
                  </div>

                  {/* Proficiency bar */}
                  <div className="relative z-10 w-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">Proficiency</span>
                      <span className="text-[10px] font-black" style={{ color: cfg.color }}>{lvl}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cfg.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${lvl}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.03 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredSkills.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No skills in this category yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
