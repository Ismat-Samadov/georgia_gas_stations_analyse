'use client';

import { Brand, BrandStats, CityStats, SGPInsights, CoverageGap } from '@/lib/types';
import BrandFilter from './BrandFilter';
import InsightsPanel from './InsightsPanel';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeBrands: Set<Brand>;
  onToggleBrand: (brand: Brand) => void;
  marketShare: BrandStats[];
  cityStats: CityStats[];
  sgpInsights: SGPInsights;
  coverageGaps: CoverageGap[];
  totalStations: number;
  tbilisiStats: CityStats | null;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeBrands,
  onToggleBrand,
  marketShare,
  cityStats,
  sgpInsights,
  coverageGaps,
  totalStations,
  tbilisiStats,
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 lg:z-auto
          w-[340px] max-w-[90vw] h-full
          bg-gradient-to-b from-slate-50 to-white
          border-r border-slate-200
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="font-bold text-slate-800">Filters & Insights</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Brand Filters */}
          <BrandFilter
            activeBrands={activeBrands}
            onToggleBrand={onToggleBrand}
            marketShare={marketShare}
          />

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Insights */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Strategic Insights
            </h2>
            <InsightsPanel
              marketShare={marketShare}
              cityStats={cityStats}
              sgpInsights={sgpInsights}
              coverageGaps={coverageGaps}
              totalStations={totalStations}
              tbilisiStats={tbilisiStats}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 mt-4 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs text-slate-400 text-center">
            Data: 5 brands • 554 stations • 2025
          </p>
        </div>
      </aside>
    </>
  );
}
