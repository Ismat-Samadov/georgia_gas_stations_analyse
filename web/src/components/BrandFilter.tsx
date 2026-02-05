'use client';

import { Brand, BrandStats } from '@/lib/types';
import { BRANDS } from '@/lib/constants';
import { Check } from 'lucide-react';

interface BrandFilterProps {
  activeBrands: Set<Brand>;
  onToggleBrand: (brand: Brand) => void;
  marketShare: BrandStats[];
}

export default function BrandFilter({ activeBrands, onToggleBrand, marketShare }: BrandFilterProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Filter by Brand
      </h2>
      <div className="space-y-2">
        {BRANDS.map(brand => {
          const stats = marketShare.find(m => m.brand === brand.name);
          const isActive = activeBrands.has(brand.name);

          return (
            <button
              key={brand.name}
              onClick={() => onToggleBrand(brand.name)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer
                transition-all duration-200 border
                ${isActive
                  ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  : 'bg-slate-50 border-transparent opacity-60 hover:opacity-80'
                }
              `}
            >
              {/* Custom Checkbox */}
              <span
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  transition-all duration-200
                  ${isActive ? 'shadow-lg' : ''}
                `}
                style={{
                  borderColor: brand.color,
                  backgroundColor: isActive ? brand.color : 'transparent',
                  boxShadow: isActive ? `0 0 12px ${brand.color}40` : 'none',
                }}
              >
                {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>

              {/* Brand Label */}
              <span className="text-sm font-medium text-slate-700 flex-1 text-left">
                {brand.label}
              </span>

              {/* Stats */}
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800">{stats?.count ?? 0}</span>
                <span className="text-xs text-slate-400 ml-1">({stats?.percentage ?? 0}%)</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Select All / Clear All */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => BRANDS.forEach(b => !activeBrands.has(b.name) && onToggleBrand(b.name))}
          className="flex-1 text-xs text-slate-500 hover:text-sgp transition-colors py-1.5"
        >
          Select All
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => BRANDS.forEach(b => activeBrands.has(b.name) && onToggleBrand(b.name))}
          className="flex-1 text-xs text-slate-500 hover:text-red-500 transition-colors py-1.5"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
