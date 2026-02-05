import { Station, Brand, BrandStats, CityStats, SGPInsights, CoverageGap } from './types';
import { BRANDS, BRAND_COLORS } from './constants';

/**
 * Compute market share statistics for each brand
 */
export function computeMarketShare(stations: Station[]): BrandStats[] {
  const total = stations.length;
  if (total === 0) return [];

  const counts: Record<Brand, number> = {
    SGP: 0, Gulf: 0, Rompetrol: 0, Wissol: 0, Lukoil: 0
  };

  for (const s of stations) {
    if (counts[s.brand] !== undefined) {
      counts[s.brand]++;
    }
  }

  return BRANDS.map(b => ({
    brand: b.name,
    count: counts[b.name],
    percentage: Math.round((counts[b.name] / total) * 1000) / 10,
    color: b.color,
  })).sort((a, b) => b.count - a.count);
}

/**
 * Compute station counts by city
 */
export function computeCityStats(stations: Station[]): CityStats[] {
  const cityMap: Record<string, CityStats> = {};

  for (const s of stations) {
    const city = s.city || 'Unknown';
    if (!cityMap[city]) {
      cityMap[city] = {
        city,
        total: 0,
        byBrand: { SGP: 0, Gulf: 0, Rompetrol: 0, Wissol: 0, Lukoil: 0 },
      };
    }
    cityMap[city].total++;
    cityMap[city].byBrand[s.brand]++;
  }

  return Object.values(cityMap)
    .filter(c => c.city !== 'Unknown')
    .sort((a, b) => b.total - a.total);
}

/**
 * Count stations by brand that contain a specific fuel type
 */
export function countStationsWithFuel(
  stations: Station[],
  fuelSubstring: string
): Record<Brand, number> {
  const result: Record<Brand, number> = {
    SGP: 0, Gulf: 0, Rompetrol: 0, Wissol: 0, Lukoil: 0
  };

  for (const s of stations) {
    if (s.fuel_types.toLowerCase().includes(fuelSubstring.toLowerCase())) {
      result[s.brand]++;
    }
  }

  return result;
}

/**
 * Count stations by brand that contain a specific service
 */
export function countStationsWithService(
  stations: Station[],
  serviceSubstring: string
): Record<Brand, number> {
  const result: Record<Brand, number> = {
    SGP: 0, Gulf: 0, Rompetrol: 0, Wissol: 0, Lukoil: 0
  };

  for (const s of stations) {
    if (s.services.toLowerCase().includes(serviceSubstring.toLowerCase())) {
      result[s.brand]++;
    }
  }

  return result;
}

/**
 * Compute SGP-specific insights
 */
export function computeSGPInsights(stations: Station[]): SGPInsights {
  const sgpStations = stations.filter(s => s.brand === 'SGP');
  const sgpTotal = sgpStations.length;
  const totalStations = stations.length;

  const cngByBrand = countStationsWithFuel(stations, 'CNG');
  const lpgByBrand = countStationsWithFuel(stations, 'LPG');
  const waymartByBrand = countStationsWithService(stations, 'Way-Mart');
  const wcByBrand = countStationsWithService(stations, 'WC');
  const evByBrand = countStationsWithService(stations, 'Charger');
  const serviceCenterByBrand = countStationsWithService(stations, 'Service Center');

  // Find max competitor for CNG (excluding SGP)
  const cngCompetitorMax = Math.max(
    cngByBrand.Gulf,
    cngByBrand.Wissol,
    cngByBrand.Rompetrol,
    cngByBrand.Lukoil
  );

  const lpgCompetitorMax = Math.max(
    lpgByBrand.Gulf,
    lpgByBrand.Wissol,
    lpgByBrand.Rompetrol,
    lpgByBrand.Lukoil
  );

  return {
    totalStations: sgpTotal,
    marketShare: Math.round((sgpTotal / totalStations) * 1000) / 10,
    cngCount: cngByBrand.SGP,
    cngCompetitorMax,
    lpgCount: lpgByBrand.SGP,
    lpgCompetitorMax,
    waymartCount: waymartByBrand.SGP,
    waymartPercent: sgpTotal > 0 ? Math.round((waymartByBrand.SGP / sgpTotal) * 100) : 0,
    wcCount: wcByBrand.SGP,
    wcPercent: sgpTotal > 0 ? Math.round((wcByBrand.SGP / sgpTotal) * 100) : 0,
    evChargingCount: evByBrand.SGP,
    evChargingPercent: sgpTotal > 0 ? Math.round((evByBrand.SGP / sgpTotal) * 100) : 0,
    serviceCenterCount: serviceCenterByBrand.SGP,
    serviceCenterPercent: sgpTotal > 0 ? Math.round((serviceCenterByBrand.SGP / sgpTotal) * 100) : 0,
  };
}

/**
 * Compute coverage gaps - cities where competitors exist but SGP does not
 */
export function computeCoverageGaps(stations: Station[]): CoverageGap[] {
  const cityStats = computeCityStats(stations);

  return cityStats
    .filter(c => c.byBrand.SGP === 0 && c.total >= 2)
    .map(c => {
      const brands = (Object.entries(c.byBrand) as [Brand, number][])
        .filter(([, count]) => count > 0)
        .map(([brand]) => brand);

      let priority: 'high' | 'medium' | 'low' = 'low';
      if (c.total >= 10) priority = 'high';
      else if (c.total >= 5) priority = 'medium';

      return {
        city: c.city,
        competitorStations: c.total,
        brands,
        priority,
      };
    })
    .sort((a, b) => b.competitorStations - a.competitorStations);
}

/**
 * Get Tbilisi-specific breakdown
 */
export function getTbilisiStats(stations: Station[]): CityStats | null {
  const cityStats = computeCityStats(stations);
  return cityStats.find(c => c.city === 'Tbilisi') || null;
}

/**
 * Compute head-to-head comparison between SGP and Gulf
 */
export function computeSGPvsGulf(stations: Station[]) {
  const sgp = stations.filter(s => s.brand === 'SGP');
  const gulf = stations.filter(s => s.brand === 'Gulf');

  const sgpTbilisi = sgp.filter(s => s.city === 'Tbilisi').length;
  const gulfTbilisi = gulf.filter(s => s.city === 'Tbilisi').length;

  const cng = countStationsWithFuel(stations, 'CNG');
  const lpg = countStationsWithFuel(stations, 'LPG');
  const store = countStationsWithService(stations, 'Way-Mart');
  const serviceCenter = countStationsWithService(stations, 'Service Center');

  return {
    sgp: {
      total: sgp.length,
      tbilisi: sgpTbilisi,
      cng: cng.SGP,
      lpg: lpg.SGP,
      store: store.SGP,
      serviceCenter: serviceCenter.SGP,
    },
    gulf: {
      total: gulf.length,
      tbilisi: gulfTbilisi,
      cng: cng.Gulf,
      lpg: lpg.Gulf,
      store: store.Gulf,
      serviceCenter: serviceCenter.Gulf,
    },
  };
}
