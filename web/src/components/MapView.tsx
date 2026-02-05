'use client';

import dynamic from 'next/dynamic';
import { Station } from '@/lib/types';

const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-sgp border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-medium">Loading map...</span>
      </div>
    </div>
  ),
});

interface MapViewProps {
  stations: Station[];
}

export default function MapView({ stations }: MapViewProps) {
  return <MapContent stations={stations} />;
}
