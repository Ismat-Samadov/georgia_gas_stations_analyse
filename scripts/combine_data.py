import csv
import math
import os

DATA_DIR = "data"
FINAL_PATH = os.path.join(DATA_DIR, "final.csv")

FIELDNAMES = [
    "station_id", "brand", "name", "address", "city",
    "latitude", "longitude", "fuel_types", "services",
    "working_hours", "phone", "station_type",
]

# ---------------------------------------------------------------------------
# Coordinate-based city lookup (for entries missing city in address)
# ---------------------------------------------------------------------------
CITY_CENTERS = {
    "Tbilisi":       (41.7151, 44.8271),
    "Batumi":        (41.6168, 41.6367),
    "Kutaisi":       (42.2679, 42.6946),
    "Rustavi":       (41.5549, 44.9900),
    "Gori":          (41.9815, 44.1135),
    "Zugdidi":       (42.5088, 41.8709),
    "Poti":          (42.1462, 41.6717),
    "Kobuleti":      (41.8217, 41.7810),
    "Ozurgeti":      (42.0081, 42.0183),
    "Telavi":        (41.9198, 45.4736),
    "Akhaltsikhe":   (41.6399, 42.9877),
    "Borjomi":       (41.8409, 43.4271),
    "Mtskheta":      (41.8437, 44.7185),
    "Samtredia":     (42.1569, 42.3403),
    "Zestafoni":     (42.1170, 43.0489),
    "Terjola":       (42.1700, 42.9340),
    "Marneuli":      (41.4717, 44.8081),
    "Sagarejo":      (41.7340, 45.3316),
    "Khashuri":      (41.9978, 43.5900),
    "Senaki":        (42.2691, 42.0655),
    "Chiatura":      (42.2897, 43.2884),
    "Sighnaghi":     (41.6192, 45.9226),
    "Mestia":        (43.0083, 42.7272),
    "Lanchkhuti":    (42.0863, 42.0189),
    "Chokhatauri":   (42.0206, 42.2434),
    "Kaspi":         (41.9200, 44.4300),
    "Sachkhere":     (42.3450, 43.4070),
    "Lagodekhi":     (41.8263, 46.2849),
    "Kvareli":       (41.9519, 45.8213),
    "Dedoplistskaro": (41.4618, 46.0976),
    "Gurjaani":      (41.7451, 45.8008),
    "Bolnisi":       (41.4472, 44.5443),
    "Khelvachauri":  (41.6101, 41.6300),
    "Tsalenjikha":   (42.6077, 42.0334),
    "Tkibuli":       (42.3320, 42.9730),
    "Ambrolauri":    (42.5175, 43.1535),
}

# Max distance in degrees (~15km) for city assignment
MAX_CITY_DISTANCE = 0.15

# Keywords indicating an address fragment, not a city name
NOT_CITY_KEYWORDS = [
    "street", "str.", "avenue", "ave.", "highway", "hwy",
    "beach", "square", "alley", "lane", "bridge",
    "village", "opposite", "near ", "next to", "adjacent",
    "gulf +", "right bank", "left bank", "cosmonauts",
    "monument", "metro", "airport", "winery",
]


def haversine_approx(lat1, lon1, lat2, lon2):
    """Approximate distance in degrees (sufficient for nearest-city matching)."""
    return math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)


def city_from_coords(lat, lon):
    """Find the nearest city center within MAX_CITY_DISTANCE."""
    best_city, best_dist = "", float("inf")
    for city, (clat, clon) in CITY_CENTERS.items():
        d = haversine_approx(lat, lon, clat, clon)
        if d < best_dist:
            best_dist = d
            best_city = city
    return best_city if best_dist <= MAX_CITY_DISTANCE else ""


def is_valid_city(name):
    """Check if parsed city name is likely a real city (not an address fragment)."""
    if not name:
        return False
    low = name.lower()
    for kw in NOT_CITY_KEYWORDS:
        if kw in low:
            return False
    # Reject if it contains "N" followed by a digit (like "N64", "N9")
    import re
    if re.search(r'\bN\s*\d', name):
        return False
    return True


# ---------------------------------------------------------------------------
# SGP district name normalization
# ---------------------------------------------------------------------------
SGP_DISTRICT_MAP = {
    "D.Tskharo":     "Dedoplistskaro",
    "Keda/Tskhemna": "Keda",
    "Lanchkhti":     "Lanchkhuti",
    "Dafnari":       "Samtredia",
    "Kizilajlo":     "Marneuli",
    "Parkhalo":      "Bolnisi",
    "Sadakhlo":      "Marneuli",
    "Shulaveri":     "Marneuli",
    "Tsalaskuri":    "Gardabani",
    "Urbnisi":       "Kareli",
    "Martkopi":      "Gardabani",
    "Ianeti":        "Samtredia",
    "Agara":         "Kareli",
    "Kakheti":       "Kakheti",
    "telavi":        "Telavi",
}


def load_csv(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ---------------------------------------------------------------------------
# Gulf
# ---------------------------------------------------------------------------
def process_gulf(rows):
    kept, excluded = [], []
    for r in rows:
        fuel = r.get("fuel_types", "").strip()
        poi = r.get("poi_types", "").strip()

        # Exclude Oil Terminals and Service-Centers that sell no fuel
        if not fuel and poi in ("Oil Terminal", "Service Center"):
            excluded.append((r["id"], r["name"], f"No fuel, poi_types={poi}"))
            continue

        # Build services from poi_types + food_types, dropping noise labels
        svc_parts = []
        for p in poi.split(", "):
            if p and p not in ("Gas Station", "Shop"):
                svc_parts.append(p)
        food = r.get("food_types", "").strip()
        if food:
            svc_parts.extend(food.split(", "))

        # Clean newlines from address before parsing
        addr = r.get("address", "").replace("\n", " ").replace("\r", " ").strip()
        addr = " ".join(addr.split())  # collapse multiple spaces

        # City: first segment before comma in address
        city = addr.split(",")[0].strip() if "," in addr else ""

        # Validate: reject address fragments parsed as city names
        if not is_valid_city(city):
            city = ""

        # Fallback: coordinate-based city lookup
        if not city:
            try:
                city = city_from_coords(float(r["latitude"]), float(r["longitude"]))
            except (ValueError, KeyError):
                pass

        kept.append({
            "station_id": f"GULF_{r['id']}",
            "brand": "Gulf",
            "name": r["name"],
            "address": addr,
            "city": city,
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "fuel_types": fuel,
            "services": ", ".join(svc_parts),
            "working_hours": "",
            "phone": "",
            "station_type": "",
        })
    return kept, excluded


# ---------------------------------------------------------------------------
# Rompetrol
# ---------------------------------------------------------------------------
def process_rompetrol(rows):
    kept, excluded = [], []
    for r in rows:
        fuel = r.get("fuel_types", "").strip()
        services = r.get("services", "").strip()

        # Exclude Head Office and entries with no fuel AND no services
        if not fuel and not services:
            excluded.append((r["id"], r["name"], "No fuel_types and no services"))
            continue

        kept.append({
            "station_id": f"ROMPETROL_{r['id']}",
            "brand": "Rompetrol",
            "name": r["name"],
            "address": r["address"],
            "city": r.get("city", ""),
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "fuel_types": fuel,
            "services": services,
            "working_hours": "24/7",
            "phone": r.get("phone", ""),
            "station_type": "",
        })
    return kept, excluded


# ---------------------------------------------------------------------------
# Lukoil
# ---------------------------------------------------------------------------
def process_lukoil(rows):
    kept, excluded = [], []
    for r in rows:
        city = r.get("city", "")
        addr = r.get("address", "")
        name = f"{city}, {addr}" if city else addr

        kept.append({
            "station_id": f"LUKOIL_{r['id']}",
            "brand": "Lukoil",
            "name": name,
            "address": addr,
            "city": city,
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "fuel_types": "",
            "services": "",
            "working_hours": "",
            "phone": "",
            "station_type": r.get("type", ""),
        })
    return kept, excluded


# ---------------------------------------------------------------------------
# Wissol
# ---------------------------------------------------------------------------
def process_wissol(rows):
    kept, excluded = [], []
    for r in rows:
        svc = r.get("services", "").strip()

        # Exclude Truck Service Center (repair-only, no fuel)
        if svc == "Truck Service Center":
            excluded.append((r["id"], r["address"], "Truck Service Center (no fuel)"))
            continue

        addr = r.get("address", "").strip()

        # City: first segment before comma
        city = addr.split(",")[0].strip() if "," in addr else ""

        # Validate: reject address fragments parsed as city names
        if not is_valid_city(city):
            city = ""

        # Fallback: coordinate-based city lookup
        if not city:
            try:
                city = city_from_coords(float(r["latitude"]), float(r["longitude"]))
            except (ValueError, KeyError):
                pass

        kept.append({
            "station_id": f"WISSOL_{r['id']}",
            "brand": "Wissol",
            "name": addr if addr else city,
            "address": addr,
            "city": city,
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "fuel_types": "",
            "services": svc,
            "working_hours": r.get("working_hours", ""),
            "phone": r.get("phone", ""),
            "station_type": "",
        })
    return kept, excluded


# ---------------------------------------------------------------------------
# SGP (SOCAR Georgia Petroleum)
# ---------------------------------------------------------------------------
def process_sgp(rows):
    kept, excluded = [], []
    for r in rows:
        fuel = r.get("fuel_types", "").strip()
        svc = r.get("services", "").strip()

        # Exclude EV-charger-only entries (no fuel)
        if not fuel and "Charger" in svc:
            excluded.append((r["id"], r["name"], "EV Charger only (no fuel)"))
            continue

        # Use district (specific city/town) instead of region
        district = r.get("district", "").strip()
        city = SGP_DISTRICT_MAP.get(district, district)
        # Title-case fix for lowercase entries
        if city and city[0].islower():
            city = city.title()

        kept.append({
            "station_id": f"SGP_{r['id']}",
            "brand": "SGP",
            "name": r["name"],
            "address": r["address"],
            "city": city,
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "fuel_types": fuel,
            "services": svc,
            "working_hours": "",
            "phone": "",
            "station_type": "",
        })
    return kept, excluded


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def save_csv(rows, path):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


def main():
    processors = [
        ("gulf.csv",      "Gulf",      process_gulf),
        ("rompetrol.csv", "Rompetrol", process_rompetrol),
        ("lukoil.csv",    "Lukoil",    process_lukoil),
        ("wissol.csv",    "Wissol",    process_wissol),
        ("sgp.csv",       "SGP",       process_sgp),
    ]

    all_stations = []
    total_excluded = 0

    print("=" * 60)
    print("Combining Georgia gas station datasets")
    print("=" * 60)

    for filename, brand, processor in processors:
        raw = load_csv(filename)
        kept, excluded = processor(raw)
        all_stations.extend(kept)
        total_excluded += len(excluded)

        print(f"\n{brand}:")
        print(f"  Loaded:   {len(raw)}")
        print(f"  Kept:     {len(kept)}")
        print(f"  Excluded: {len(excluded)}")
        for eid, ename, reason in excluded:
            print(f"    - ID {eid} ({ename}): {reason}")

    # Sort by brand, then name
    all_stations.sort(key=lambda s: (s["brand"], s["name"]))

    save_csv(all_stations, FINAL_PATH)

    # Summary
    print("\n" + "=" * 60)
    print(f"FINAL: {len(all_stations)} gas stations saved to {FINAL_PATH}")
    print(f"Excluded: {total_excluded} non-station entries")
    print("=" * 60)

    # Per-brand counts
    brand_counts = {}
    for s in all_stations:
        brand_counts[s["brand"]] = brand_counts.get(s["brand"], 0) + 1
    print("\nBy brand:")
    for brand, count in sorted(brand_counts.items()):
        print(f"  {brand}: {count}")

    # City distribution (top 15)
    city_counts = {}
    for s in all_stations:
        c = s["city"] or "(unknown)"
        city_counts[c] = city_counts.get(c, 0) + 1
    print("\nTop 15 cities:")
    for city, count in sorted(city_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"  {city}: {count}")

    # Data completeness
    total = len(all_stations)
    has_city = sum(1 for s in all_stations if s["city"])
    has_fuel = sum(1 for s in all_stations if s["fuel_types"])
    has_svc = sum(1 for s in all_stations if s["services"])
    has_phone = sum(1 for s in all_stations if s["phone"])
    has_hours = sum(1 for s in all_stations if s["working_hours"])
    print(f"\nData completeness ({total} total):")
    print(f"  city:          {has_city} ({100*has_city//total}%)")
    print(f"  fuel_types:    {has_fuel} ({100*has_fuel//total}%)")
    print(f"  services:      {has_svc} ({100*has_svc//total}%)")
    print(f"  phone:         {has_phone} ({100*has_phone//total}%)")
    print(f"  working_hours: {has_hours} ({100*has_hours//total}%)")


if __name__ == "__main__":
    main()
