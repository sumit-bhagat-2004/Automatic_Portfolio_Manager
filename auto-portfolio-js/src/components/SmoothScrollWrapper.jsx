'use client';
import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export default function SmoothScrollWrapper({ children }) {
  const pathname = usePathname();
  
  // Disable smooth scrolling on admin pages
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }
  
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true, smoothTouch: false }}>
      {children}
    </ReactLenis>
  );
}
