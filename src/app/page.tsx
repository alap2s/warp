'use client';

import dynamic from 'next/dynamic';

const InteractiveGrid = dynamic(() => import('@/components/InteractiveGrid'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative w-screen h-screen">
      <InteractiveGrid />
    </div>
  );
}
