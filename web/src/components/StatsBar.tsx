'use client';

import { BrandStats } from '@/lib/types';
import { BRAND_COLORS } from '@/lib/constants';
import { Fuel, Filter } from 'lucide-react';

interface StatsBarProps {
  totalStations: number;
  filteredCount: number;
  marketShare: BrandStats[];
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function StatsBar({
  totalStations,
  filteredCount,
  marketShare,
  onToggleSidebar,
  isSidebarOpen,
}: StatsBarProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Filter className={`w-5 h-5 ${isSidebarOpen ? 'text-sgp' : 'text-slate-600'}`} />
        </button>

        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-sgp to-blue-600 rounded-xl shadow-lg">
            <Fuel className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Georgia Gas Stations
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Market Analysis Dashboard
            </p>
          </div>
        </div>

        {/* Station Counter */}
        <div className="ml-auto flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
          <span className="text-sm font-bold text-sgp">{filteredCount}</span>
          <span className="text-xs text-slate-500">
            of {totalStations} stations
          </span>
        </div>

        {/* Brand Legend - Desktop Only */}
        <div className="hidden xl:flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
          {marketShare.slice(0, 5).map(ms => (
            <div key={ms.brand} className="flex items-center gap-1.5 group cursor-default">
              <span
                className="w-3 h-3 rounded-full shadow-sm transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: BRAND_COLORS[ms.brand],
                  boxShadow: `0 0 6px ${BRAND_COLORS[ms.brand]}50`,
                }}
              />
              <span className="text-xs font-medium text-slate-600">{ms.brand}</span>
              <span className="text-xs text-slate-400">{ms.count}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
