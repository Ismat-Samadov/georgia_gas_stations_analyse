'use client';

import { useState } from 'react';
import { BrandStats, CityStats, SGPInsights, CoverageGap } from '@/lib/types';
import { BRAND_COLORS } from '@/lib/constants';
import {
  ChevronDown,
  TrendingUp,
  MapPin,
  Fuel,
  Target,
  Award,
  Zap,
  Store,
  Car,
  Battery,
} from 'lucide-react';

interface InsightsPanelProps {
  marketShare: BrandStats[];
  cityStats: CityStats[];
  sgpInsights: SGPInsights;
  coverageGaps: CoverageGap[];
  totalStations: number;
  tbilisiStats: CityStats | null;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accentColor?: string;
}

function Section({ title, icon, defaultOpen = false, children, accentColor = '#0072CE' }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {icon}
        </span>
        <span className="flex-1 font-semibold text-slate-800">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, color }: { label: string; value: string | number; subtext?: string; color?: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color: color || '#1e293b' }}>{value}</div>
      {subtext && <div className="text-xs text-slate-400 mt-0.5">{subtext}</div>}
    </div>
  );
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = Math.round((value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500">{value} ({percent}%)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function InsightsPanel({
  marketShare,
  cityStats,
  sgpInsights,
  coverageGaps,
  totalStations,
  tbilisiStats,
}: InsightsPanelProps) {
  const topGaps = coverageGaps.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Market Overview */}
      <Section
        title="Market Overview"
        icon={<TrendingUp className="w-5 h-5 text-sgp" />}
        defaultOpen={true}
        accentColor="#0072CE"
      >
        {/* Hero Number */}
        <div className="text-center py-4 bg-gradient-to-br from-sgp/5 to-sgp/10 rounded-xl mb-4">
          <div className="text-4xl font-bold text-sgp">{totalStations}</div>
          <div className="text-sm text-slate-600 mt-1">Gas Stations Analyzed</div>
        </div>

        {/* Market Share Bars */}
        <div className="space-y-1">
          {marketShare.map(ms => (
            <ProgressBar
              key={ms.brand}
              label={ms.brand}
              value={ms.count}
              max={marketShare[0].count}
              color={BRAND_COLORS[ms.brand]}
            />
          ))}
        </div>

        {/* Tbilisi Callout */}
        {tbilisiStats && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-800">Tbilisi: The Battleground</span>
            </div>
            <div className="text-2xl font-bold text-amber-700">{tbilisiStats.total} stations</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(tbilisiStats.byBrand)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([brand, count]) => (
                  <span
                    key={brand}
                    className="text-xs px-2 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: BRAND_COLORS[brand as keyof typeof BRAND_COLORS] }}
                  >
                    {brand}: {count}
                  </span>
                ))}
            </div>
          </div>
        )}
      </Section>

      {/* SGP Strategic Position */}
      <Section
        title="SGP Strategic Advantages"
        icon={<Award className="w-5 h-5 text-sgp" />}
        accentColor="#0072CE"
      >
        {/* Position Card */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard
            label="Market Position"
            value="#3"
            subtext={`${sgpInsights.marketShare}% share`}
            color="#0072CE"
          />
          <StatCard
            label="Total Stations"
            value={sgpInsights.totalStations}
            subtext="nationwide"
            color="#0072CE"
          />
        </div>

        {/* CNG Leadership */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Fuel className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-emerald-800">CNG Leader</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">{sgpInsights.cngCount}</span>
            <span className="text-sm text-emerald-600">stations</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            {sgpInsights.cngCompetitorMax > 0
              ? `${Math.round(sgpInsights.cngCount / sgpInsights.cngCompetitorMax)}x more than nearest competitor (${sgpInsights.cngCompetitorMax})`
              : 'No competitor offers CNG'}
          </div>
        </div>

        {/* LPG Leadership */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-800">LPG Pioneer</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-700">{sgpInsights.lpgCount}</span>
            <span className="text-sm text-blue-600">stations</span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {sgpInsights.lpgCompetitorMax === 0
              ? 'Exclusive LPG provider — no competitor'
              : `vs ${sgpInsights.lpgCompetitorMax} competitor stations`}
          </div>
        </div>

        {/* Service Coverage */}
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Service Coverage
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <Store className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-sm font-bold text-slate-700">{sgpInsights.waymartPercent}%</div>
              <div className="text-xs text-slate-500">Way-Mart</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <Car className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-sm font-bold text-slate-700">{sgpInsights.wcPercent}%</div>
              <div className="text-xs text-slate-500">Restroom (WC)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <Battery className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-sm font-bold text-slate-700">{sgpInsights.evChargingPercent}%</div>
              <div className="text-xs text-slate-500">EV Charging</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <Car className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-sm font-bold text-slate-700">{sgpInsights.serviceCenterPercent}%</div>
              <div className="text-xs text-slate-500">Service Center</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Coverage Gaps */}
      <Section
        title="Coverage Gaps"
        icon={<Target className="w-5 h-5 text-red-500" />}
        accentColor="#EF4444"
      >
        <p className="text-xs text-slate-500 mb-3">
          Cities where competitors operate but SGP has no presence
        </p>

        <div className="space-y-2">
          {topGaps.map((gap, idx) => (
            <div
              key={gap.city}
              className={`
                p-3 rounded-lg border
                ${gap.priority === 'high' ? 'bg-red-50 border-red-200' : ''}
                ${gap.priority === 'medium' ? 'bg-amber-50 border-amber-200' : ''}
                ${gap.priority === 'low' ? 'bg-slate-50 border-slate-200' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">
                  {idx + 1}. {gap.city}
                </span>
                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full font-medium
                    ${gap.priority === 'high' ? 'bg-red-200 text-red-700' : ''}
                    ${gap.priority === 'medium' ? 'bg-amber-200 text-amber-700' : ''}
                    ${gap.priority === 'low' ? 'bg-slate-200 text-slate-600' : ''}
                  `}
                >
                  {gap.priority}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                {gap.competitorStations} competitor stations
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {gap.brands.map(brand => (
                  <span
                    key={brand}
                    className="text-xs px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: BRAND_COLORS[brand] }}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {coverageGaps.length > 5 && (
          <div className="text-xs text-slate-400 text-center mt-2">
            +{coverageGaps.length - 5} more gaps identified
          </div>
        )}
      </Section>

      {/* Expansion Roadmap */}
      <Section
        title="Expansion Priorities"
        icon={<MapPin className="w-5 h-5 text-emerald-500" />}
        accentColor="#10B981"
      >
        <p className="text-xs text-slate-500 mb-3">
          Top markets ranked by opportunity score (stations × brands)
        </p>

        <div className="space-y-2">
          {topGaps.slice(0, 3).map((gap, idx) => {
            const score = gap.competitorStations * gap.brands.length;
            return (
              <div
                key={gap.city}
                className="p-3 bg-gradient-to-r from-emerald-50 to-transparent border border-emerald-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-emerald-800">
                      #{idx + 1} {gap.city}
                    </div>
                    <div className="text-xs text-emerald-600 mt-0.5">
                      {gap.competitorStations} stations • {gap.brands.length} brands
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700">{score}</div>
                    <div className="text-xs text-emerald-500">score</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs font-medium text-slate-700 mb-1">Key Insight</div>
          <p className="text-xs text-slate-600">
            Mtskheta and Khelvachauri represent &ldquo;quick wins&rdquo; — they are adjacent to existing
            SGP strongholds (Tbilisi and Batumi) with proven market demand.
          </p>
        </div>
      </Section>
    </div>
  );
}
