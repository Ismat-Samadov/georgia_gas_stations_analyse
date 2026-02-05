import { Brand, BrandConfig } from './types';

export const BRANDS: BrandConfig[] = [
  { name: 'SGP', color: '#0072CE', label: 'SGP (SOCAR)' },
  { name: 'Gulf', color: '#EE3124', label: 'Gulf' },
  { name: 'Wissol', color: '#4CAF50', label: 'Wissol' },
  { name: 'Rompetrol', color: '#F5A623', label: 'Rompetrol' },
  { name: 'Lukoil', color: '#D32F2F', label: 'Lukoil' },
];

export const BRAND_COLORS: Record<Brand, string> = {
  SGP: '#0072CE',
  Gulf: '#EE3124',
  Wissol: '#4CAF50',
  Rompetrol: '#F5A623',
  Lukoil: '#D32F2F',
};

// Georgia map center and zoom
export const MAP_CENTER: [number, number] = [42.0, 43.5];
export const MAP_ZOOM = 8;

// Tbilisi coordinates
export const TBILISI_CENTER: [number, number] = [41.7151, 44.8271];

// Region mapping for Georgian cities
export const CITY_TO_REGION: Record<string, string> = {
  'Tbilisi': 'Tbilisi',
  'Rustavi': 'Kvemo Kartli',
  'Marneuli': 'Kvemo Kartli',
  'Gardabani': 'Kvemo Kartli',
  'Bolnisi': 'Kvemo Kartli',
  'Dmanisi': 'Kvemo Kartli',
  'Kutaisi': 'Imereti',
  'Zestafoni': 'Imereti',
  'Sachkhere': 'Imereti',
  'Chiatura': 'Imereti',
  'Tkibuli': 'Imereti',
  'Samtredia': 'Imereti',
  'Terjola': 'Imereti',
  'Kharagauli': 'Imereti',
  'Batumi': 'Adjara',
  'Kobuleti': 'Adjara',
  'Khelvachauri': 'Adjara',
  'Gonio': 'Adjara',
  'Keda': 'Adjara',
  'Gori': 'Shida Kartli',
  'Kaspi': 'Shida Kartli',
  'Khashuri': 'Shida Kartli',
  'Kareli': 'Shida Kartli',
  'Zugdidi': 'Samegrelo',
  'Poti': 'Samegrelo',
  'Senaki': 'Samegrelo',
  'Tsalenjikha': 'Samegrelo',
  'Jvari': 'Samegrelo',
  'Telavi': 'Kakheti',
  'Gurjaani': 'Kakheti',
  'Sagarejo': 'Kakheti',
  'Akhmeta': 'Kakheti',
  'Sighnaghi': 'Kakheti',
  'Lagodekhi': 'Kakheti',
  'Dedoplistskaro': 'Kakheti',
  'Kvareli': 'Kakheti',
  'Akhaltsikhe': 'Samtskhe-Javakheti',
  'Borjomi': 'Samtskhe-Javakheti',
  'Bakuriani': 'Samtskhe-Javakheti',
  'Ozurgeti': 'Guria',
  'Lanchkhuti': 'Guria',
  'Chokhatauri': 'Guria',
  'Ambrolauri': 'Racha-Lechkhumi',
  'Mtskheta': 'Mtskheta-Mtianeti',
  'Kazbegi': 'Mtskheta-Mtianeti',
  'Mestia': 'Svaneti',
};
