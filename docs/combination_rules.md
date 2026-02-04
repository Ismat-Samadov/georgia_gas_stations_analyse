# Combination Rules: Georgia Gas Stations Dataset

## Overview

Five gas station brand datasets were combined into a single unified file (`data/final.csv`).

| Source | File | Raw Rows | Kept | Excluded |
|--------|------|----------|------|----------|
| Gulf | data/gulf.csv | 174 | 168 | 6 |
| Rompetrol | data/rompetrol.csv | 82 | 67 | 15 |
| Lukoil | data/lukoil.csv | 57 | 57 | 0 |
| Wissol | data/wissol.csv | 163 | 162 | 1 |
| SGP (SOCAR) | data/sgp.csv | 101 | 100 | 1 |
| **Total** | | **577** | **554** | **23** |

---

## Unified Schema (12 columns)

| Column | Type | Description | Coverage |
|--------|------|-------------|----------|
| station_id | string | Unique ID: `BRAND_originalId` | 100% |
| brand | string | Gulf / Rompetrol / Lukoil / Wissol / SGP | 100% |
| name | string | Station name | 100% |
| address | string | Full address | 100% |
| city | string | City or region | ~76% |
| latitude | float | GPS latitude | 100% |
| longitude | float | GPS longitude | 100% |
| fuel_types | string | Comma-separated fuel types | ~60% |
| services | string | Comma-separated services/amenities | ~86% |
| working_hours | string | Operating hours | ~41% |
| phone | string | Contact number | ~41% |
| station_type | string | Own / Franchise (Lukoil only) | ~10% |

---

## Exclusion Rules

### Gulf: 6 entries excluded

**Rule:** Exclude entries with **empty `fuel_types`** where `poi_types` is `"Oil Terminal"` or `"Service Center"`.

These are non-retail facilities that do not sell fuel to the public.

| ID | Name | Reason |
|----|------|--------|
| 5931 | Oil Terminal (Samtredia) | Oil storage facility, no retail fuel |
| 5932 | Oil Terminal (13) | Oil storage facility, no retail fuel |
| 5715 | Oil Terminal (13) | Oil storage facility, no retail fuel |
| 5716 | Oil Terminal (13) | Oil storage facility, no retail fuel |
| 5719 | Avchala, Tskalsadeni #11 | Service center only, no fuel |
| 5759 | Abashidze Str. 22 | Service center only, no fuel |

**Kept edge cases:**
- Entries with `poi_types="Shop"` were **kept** because they all have `fuel_types` filled (they are gas stations with convenience shops).
- Entries with `poi_types="Service Center, Shop"` were **kept** because they have fuel.
- Entries with `poi_types="CNG Station, Gas Station, Shop"` were **kept** (CNG is a fuel type).

### Rompetrol: 15 entries excluded

**Rule:** Exclude entries where **both `fuel_types` and `services` are empty**.

These are either a corporate office, under-construction locations, or not-yet-operational stations.

| ID | Name | Reason |
|----|------|--------|
| 56 | Head Office | Corporate office, not a station |
| 101 | Khashuri | No fuel/services (under construction) |
| 102 | Gori 4 | No fuel/services (under construction) |
| 103 | Tsalka | No fuel/services (under construction) |
| 104 | Napareuli | No fuel/services (under construction) |
| 105 | Bodbe | No fuel/services (under construction) |
| 106 | Tskhaltubo | No fuel/services (under construction) |
| 107 | Terjola 2 | No fuel/services (under construction) |
| 108 | Zugdidi 3 | No fuel/services (under construction) |
| 109 | Poti 4 | No fuel/services (under construction) |
| 110 | Batumi 8 | No fuel/services (under construction) |
| 111 | Rustavi 3 | No fuel/services (under construction) |
| 112 | EastPoint | No fuel/services (under construction) |
| 113 | Peikrebi 2 | No fuel/services (under construction) |
| 114 | Dighomi 4 | No fuel/services (under construction) |

### Lukoil: 0 entries excluded

No fuel_types or services metadata is available from the source website. All 57 entries are assumed to be operational gas stations (the source page is titled "station list").

### Wissol: 1 entry excluded

**Rule:** Exclude entries where `services == "Truck Service Center"`.

| ID | Address | Reason |
|----|---------|--------|
| 134 | Avchal St. N86 | Truck repair facility only, no fuel sales |

**Kept edge cases:**
- `"Service Center"` entries (9 stations) were **kept** — these are Wissol gas stations that also have vehicle service centers.
- `"CNG"` entries (13 stations) were **kept** — CNG (compressed natural gas) is a fuel type.
- `"Booth"` entries were **kept** — small fuel kiosks.

### SGP (SOCAR): 1 entry excluded

**Rule:** Exclude entries where **`fuel_types` is empty** and `services` contains `"Charger"`.

| ID | Name | Reason |
|----|------|--------|
| 1112 | Beliashvili 2 | EV charging station only, no fuel |

---

## Column Mapping (Source -> Unified)

### Gulf
| Source Column | Maps To | Transformation |
|---------------|---------|----------------|
| id | station_id | Prefix with `GULF_` |
| _(hardcoded)_ | brand | `"Gulf"` |
| name | name | Direct |
| address | address | Direct |
| address | city | First segment before comma |
| latitude | latitude | Direct |
| longitude | longitude | Direct |
| fuel_types | fuel_types | Direct |
| poi_types + food_types | services | Merge; drop "Gas Station" and "Shop" labels |
| _(not available)_ | working_hours | Empty |
| _(not available)_ | phone | Empty |

### Rompetrol
| Source Column | Maps To | Transformation |
|---------------|---------|----------------|
| id | station_id | Prefix with `ROMPETROL_` |
| _(hardcoded)_ | brand | `"Rompetrol"` |
| name | name | Direct |
| address | address | Direct |
| city | city | Direct |
| latitude | latitude | Direct |
| longitude | longitude | Direct |
| fuel_types | fuel_types | Direct |
| services | services | Direct |
| program | working_hours | `"24/7"` (all identical) |
| phone | phone | Direct |

### Lukoil
| Source Column | Maps To | Transformation |
|---------------|---------|----------------|
| id | station_id | Prefix with `LUKOIL_` |
| _(hardcoded)_ | brand | `"Lukoil"` |
| city + address | name | `"City, Address"` |
| address | address | Direct |
| city | city | Direct |
| latitude | latitude | Direct |
| longitude | longitude | Direct |
| _(not available)_ | fuel_types | Empty |
| _(not available)_ | services | Empty |
| type | station_type | Direct (Own / Franchise) |

### Wissol
| Source Column | Maps To | Transformation |
|---------------|---------|----------------|
| id | station_id | Prefix with `WISSOL_` |
| _(hardcoded)_ | brand | `"Wissol"` |
| address | name | Uses address as name |
| address | address | Direct |
| address | city | First segment before comma |
| latitude | latitude | Direct |
| longitude | longitude | Direct |
| _(not available)_ | fuel_types | Empty |
| services | services | Direct |
| working_hours | working_hours | Direct |
| phone | phone | Direct |

### SGP (SOCAR)
| Source Column | Maps To | Transformation |
|---------------|---------|----------------|
| id | station_id | Prefix with `SGP_` |
| _(hardcoded)_ | brand | `"SGP"` |
| name | name | Direct |
| address | address | Direct |
| region | city | Direct |
| latitude | latitude | Direct |
| longitude | longitude | Direct |
| fuel_types | fuel_types | Direct |
| services | services | Direct |
| _(not available)_ | phone | Empty |

---

## Dropped Source Columns

| Column | Source | Why Dropped |
|--------|-------|-------------|
| is_active | Gulf | All values = 1 (all active) |
| poi_types | Gulf | Absorbed into `services` |
| food_types | Gulf | Absorbed into `services` |
| county | Rompetrol | Redundant with city for analysis |
| program | Rompetrol | All identical ("Sunday - Monday - 24 Hours") |
| company_code | Wissol | Internal business identifier |
| hotline | Wissol | All identical (*1000) |
| direction_link | Wissol | External Google Maps link |
| district | SGP | Redundant with region/city |
| payments | SGP | Nearly all identical across stations |

---

## Data Limitations

1. **Lukoil** has no fuel_types or services data — the source website only provides location info.
2. **Wissol** has no fuel_types data — only service categories (Standard, CNG, etc.).
3. **Rompetrol** data was sourced from Wayback Machine (Feb 2025 cache) due to WAF blocking.
4. **Lukoil** data was sourced from Wayback Machine (Nov 2025 cache) due to SSL certificate issues.
5. **City parsing** from address strings is approximate (first segment before comma).

---

## How to Reproduce

```bash
# 1. Scrape all individual datasets
python script/gulf.py
python script/rompetrol.py
python script/lukoil.py
python script/wissol.py
python script/sgp.py

# 2. Combine into final.csv
python script/combine_data.py
```
