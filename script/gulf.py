import requests
import re
import json
import csv
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


FUEL_TYPE_MAP = {
    "ED": "Euro Diesel",
    "ER": "Euro Regular",
    "GFED": "G-Force Euro Diesel",
    "GFER": "G-Force Euro Regular",
    "GFP": "G-Force Premium",
    "GFS": "G-Force Super",
    "CNG": "CNG",
    "DE": "Diesel Euro",
}

POI_TYPE_MAP = {
    "GAS": "Gas Station",
    "SHP": "Shop",
    "SC": "Service Center",
    "OB": "Oil Terminal",
    "EXP": "Express",
    "CNG": "CNG Station",
}

FOOD_TYPE_MAP = {
    "CF": "Coffee",
    "SW": "Sandwich",
    "HD": "Hot Dog",
}

URL = "https://gulf.ge/en/map"


def fetch_stations():
    response = requests.get(URL, verify=False)
    response.raise_for_status()
    html = response.text

    match = re.search(r"var\s+pins\s*=\s*(\{.*?\})\s*;", html, re.DOTALL)
    if not match:
        raise ValueError("Could not find 'pins' data in the page source.")

    raw = match.group(1)
    stations = json.loads(raw)
    return stations


def parse_stations(stations):
    rows = []
    for station_id, data in stations.items():
        fuel_types = ", ".join(
            FUEL_TYPE_MAP.get(f, f) for f in data.get("fuel_types", [])
        )
        poi_types = ", ".join(
            POI_TYPE_MAP.get(p, p) for p in data.get("poi_types", [])
        )
        food_types = ", ".join(
            FOOD_TYPE_MAP.get(f, f) for f in data.get("food_types", [])
        )
        rows.append({
            "id": data.get("id", ""),
            "name": data.get("name", ""),
            "address": data.get("description", ""),
            "latitude": data.get("latitude", ""),
            "longitude": data.get("longitude", ""),
            "is_active": data.get("is_active", ""),
            "fuel_types": fuel_types,
            "poi_types": poi_types,
            "food_types": food_types,
        })
    return rows


def save_csv(rows, path):
    fieldnames = [
        "id", "name", "address", "latitude", "longitude",
        "is_active", "fuel_types", "poi_types", "food_types",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    print("Fetching Gulf gas station data from gulf.ge...")
    stations = fetch_stations()
    print(f"Found {len(stations)} stations.")

    rows = parse_stations(stations)
    csv_path = "data/gulf.csv"
    save_csv(rows, csv_path)
    print(f"Saved {len(rows)} stations to {csv_path}")


if __name__ == "__main__":
    main()
