'use client';

import BentoGrid from '../BentoGrid';

export default function BentoSection({ config }) {
  return (
    <section id="bento" className="relative py-20">
      <BentoGrid config={config} />
    </section>
  );
}
