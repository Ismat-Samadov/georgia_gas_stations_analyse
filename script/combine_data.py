import csv
import os

DATA_DIR = "data"
FINAL_PATH = os.path.join(DATA_DIR, "final.csv")

FIELDNAMES = [
    "station_id", "brand", "name", "address", "city",
    "latitude", "longitude", "fuel_types", "services",
    "working_hours", "phone", "station_type",
]


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

        # City: first segment before comma in address
        addr = r.get("address", "")
        city = addr.split(",")[0].strip() if "," in addr else ""

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
        # City: first segment before comma, or first word before district/highway
        city = addr.split(",")[0].strip() if "," in addr else ""

        kept.append({
            "station_id": f"WISSOL_{r['id']}",
            "brand": "Wissol",
            "name": addr,
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

        kept.append({
            "station_id": f"SGP_{r['id']}",
            "brand": "SGP",
            "name": r["name"],
            "address": r["address"],
            "city": r.get("region", ""),
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

    # City distribution (top 10)
    city_counts = {}
    for s in all_stations:
        c = s["city"] or "(unknown)"
        city_counts[c] = city_counts.get(c, 0) + 1
    print("\nTop 10 cities:")
    for city, count in sorted(city_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {city}: {count}")

    # Data completeness
    total = len(all_stations)
    has_fuel = sum(1 for s in all_stations if s["fuel_types"])
    has_svc = sum(1 for s in all_stations if s["services"])
    has_phone = sum(1 for s in all_stations if s["phone"])
    has_hours = sum(1 for s in all_stations if s["working_hours"])
    print(f"\nData completeness ({total} total):")
    print(f"  fuel_types:    {has_fuel} ({100*has_fuel//total}%)")
    print(f"  services:      {has_svc} ({100*has_svc//total}%)")
    print(f"  phone:         {has_phone} ({100*has_phone//total}%)")
    print(f"  working_hours: {has_hours} ({100*has_hours//total}%)")


if __name__ == "__main__":
    main()
