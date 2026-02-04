import requests
import re
import json
import csv
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

SERVICE_MAP = {
    "1": "Fill&Go",
    "2": "POS Terminal",
    "6": "Market",
    "9": "Parking",
    "10": "Water",
    "12": "Air Pump",
    "22": "Toilet",
    "27": "Efix Super 98",
    "28": "Euro Regular 92",
    "29": "Efix Euro Premium 95",
    "30": "Efix Euro Diesel",
    "31": "Euro Diesel",
    "33": "Rompetrol Card",
    "34": "Coupons",
    "35": "Quick Top-up Machine",
    "36": "ATM",
}

LIVE_URL = "https://www.rompetrol.ge/routeplanner/stations"
WAYBACK_URL = "https://web.archive.org/web/2024/https://www.rompetrol.ge/routeplanner/stations"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
}


def fetch_stations():
    # Try live site first
    try:
        r = requests.get(LIVE_URL, params={"language_id": 2}, headers=HEADERS, verify=False, timeout=10)
        r.raise_for_status()
        data = r.json()
        if isinstance(data, list) and len(data) > 0:
            print(f"Fetched from live site.")
            return data
    except Exception as e:
        print(f"Live site unavailable ({e}), trying Wayback Machine...")

    # Fallback to Wayback Machine
    r = requests.get(WAYBACK_URL, params={"language_id": 2}, headers=HEADERS, verify=False, timeout=30)
    r.raise_for_status()
    data = r.json()
    print("Fetched from Wayback Machine cache.")
    return data


def parse_program_phone(infowindow):
    program = ""
    phone = ""
    if infowindow:
        m = re.search(r"Program:</span>\s*(.*?)</p>", infowindow)
        if m:
            program = m.group(1).strip()
        m = re.search(r"Phone:</span>\s*(.*?)</p>", infowindow)
        if m:
            phone = m.group(1).strip()
    return program, phone


def parse_stations(stations):
    rows = []
    for s in stations:
        services = ", ".join(
            SERVICE_MAP.get(svc, svc) for svc in s.get("services", [])
        )
        fuel_types = ", ".join(
            SERVICE_MAP.get(svc, svc)
            for svc in s.get("services", [])
            if svc in ("27", "28", "29", "30", "31")
        )
        other_services = ", ".join(
            SERVICE_MAP.get(svc, svc)
            for svc in s.get("services", [])
            if svc not in ("27", "28", "29", "30", "31")
        )
        program, phone = parse_program_phone(s.get("infowindow", ""))
        rows.append({
            "id": s.get("id", ""),
            "name": s.get("name_en", "") or s.get("name", ""),
            "address": s.get("address_en", "") or s.get("address", ""),
            "city": s.get("city_en", "") or s.get("city", ""),
            "county": s.get("county_en", "") or s.get("county", ""),
            "latitude": s.get("lat", ""),
            "longitude": s.get("lng", ""),
            "fuel_types": fuel_types,
            "services": other_services,
            "program": program,
            "phone": phone,
        })
    return rows


def save_csv(rows, path):
    fieldnames = [
        "id", "name", "address", "city", "county",
        "latitude", "longitude", "fuel_types", "services",
        "program", "phone",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    print("Fetching Rompetrol gas station data...")
    stations = fetch_stations()
    print(f"Found {len(stations)} stations.")

    rows = parse_stations(stations)
    csv_path = "data/rompetrol.csv"
    save_csv(rows, csv_path)
    print(f"Saved {len(rows)} stations to {csv_path}")


if __name__ == "__main__":
    main()
