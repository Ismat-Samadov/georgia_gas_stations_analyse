export type Brand = 'SGP' | 'Gulf' | 'Rompetrol' | 'Wissol' | 'Lukoil';

export interface Station {
  station_id: string;
  brand: Brand;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  fuel_types: string;
  services: string;
  working_hours: string;
  phone: string;
  station_type: string;
}

export interface BrandConfig {
  name: Brand;
  color: string;
  label: string;
}

export interface BrandStats {
  brand: Brand;
  count: number;
  percentage: number;
  color: string;
}

export interface CityStats {
  city: string;
  total: number;
  byBrand: Record<Brand, number>;
}

export interface SGPInsights {
  totalStations: number;
  marketShare: number;
  cngCount: number;
  cngCompetitorMax: number;
  lpgCount: number;
  lpgCompetitorMax: number;
  waymartCount: number;
  waymartPercent: number;
  wcCount: number;
  wcPercent: number;
  evChargingCount: number;
  evChargingPercent: number;
  serviceCenterCount: number;
  serviceCenterPercent: number;
}

export interface CoverageGap {
  city: string;
  competitorStations: number;
  brands: Brand[];
  priority: 'high' | 'medium' | 'low';
}
