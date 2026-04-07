'use client';

import { BackgroundBeams } from './ui/background-beams';
import { Particles } from './ui/particles';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <BackgroundBeams />
      <Particles />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
    </div>
  );
}
