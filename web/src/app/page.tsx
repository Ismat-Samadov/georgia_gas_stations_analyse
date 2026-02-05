'use client';

import { useState, useEffect, useMemo } from 'react';
import { Station, Brand, BrandStats, CityStats, SGPInsights, CoverageGap } from '@/lib/types';
import { computeMarketShare, computeCityStats, computeSGPInsights, computeCoverageGaps } from '@/lib/stats';
import StatsBar from '@/components/StatsBar';
import Sidebar from '@/components/Sidebar';
import MapView from '@/components/MapView';

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBrands, setActiveBrands] = useState<Set<Brand>>(
    new Set(['SGP', 'Gulf', 'Wissol', 'Rompetrol', 'Lukoil'])
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch stations data
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch('/data/stations.json');
        if (!res.ok) throw new Error('Failed to load stations data');
        const data = await res.json();
        setStations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Compute stats from FULL dataset (not filtered)
  const marketShare = useMemo(() => computeMarketShare(stations), [stations]);
  const cityStats = useMemo(() => computeCityStats(stations), [stations]);
  const sgpInsights = useMemo(() => computeSGPInsights(stations), [stations]);
  const coverageGaps = useMemo(() => computeCoverageGaps(stations), [stations]);
  const tbilisiStats = useMemo(
    () => cityStats.find(c => c.city === 'Tbilisi') || null,
    [cityStats]
  );

  // Filter stations for map display
  const filteredStations = useMemo(
    () => stations.filter(s => activeBrands.has(s.brand)),
    [stations, activeBrands]
  );

  // Toggle brand filter
  const handleToggleBrand = (brand: Brand) => {
    setActiveBrands(prev => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-sgp border-t-transparent rounded-full animate-spin" />
          <div className="text-lg font-medium text-slate-600">Loading gas stations...</div>
          <div className="text-sm text-slate-400">Analyzing market data</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Failed to Load Data</h2>
          <p className="text-slate-600 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-sgp text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Top Stats Bar */}
      <StatsBar
        totalStations={stations.length}
        filteredCount={filteredStations.length}
        marketShare={marketShare}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeBrands={activeBrands}
          onToggleBrand={handleToggleBrand}
          marketShare={marketShare}
          cityStats={cityStats}
          sgpInsights={sgpInsights}
          coverageGaps={coverageGaps}
          totalStations={stations.length}
          tbilisiStats={tbilisiStats}
        />

        {/* Map */}
        <main className="flex-1 relative">
          <MapView stations={filteredStations} />

          {/* Mobile Brand Quick Filter */}
          <div className="lg:hidden absolute top-4 left-4 right-4 z-10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {marketShare.map(ms => (
                <button
                  key={ms.brand}
                  onClick={() => handleToggleBrand(ms.brand)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full
                    whitespace-nowrap text-xs font-medium
                    transition-all duration-200 shadow-md
                    ${activeBrands.has(ms.brand)
                      ? 'bg-white text-slate-700'
                      : 'bg-slate-200/80 text-slate-500'
                    }
                  `}
                  style={{
                    borderWidth: 2,
                    borderColor: activeBrands.has(ms.brand)
                      ? getBrandColor(ms.brand)
                      : 'transparent',
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getBrandColor(ms.brand) }}
                  />
                  {ms.brand}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Stats Card - Mobile */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-sgp">{filteredStations.length}</div>
                <div className="text-xs text-slate-500">stations visible</div>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 py-2 bg-sgp text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View Insights
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper function for brand colors
function getBrandColor(brand: Brand): string {
  const colors: Record<Brand, string> = {
    SGP: '#0072CE',
    Gulf: '#EE3124',
    Wissol: '#4CAF50',
    Rompetrol: '#F5A623',
    Lukoil: '#D32F2F',
  };
  return colors[brand];
}
