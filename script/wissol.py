import requests
import re
import json
import csv
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

URL = "https://wissol.ge/en/map"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}


def fetch_stations():
    r = requests.get(URL, headers=HEADERS, verify=False, timeout=30)
    r.raise_for_status()
    html = r.text

    match = re.search(r"const allLocations = JSON\.parse\('(.+?)'\)", html)
    if not match:
        raise ValueError("Could not find 'allLocations' data in the page source.")

    raw = match.group(1)
    raw = raw.encode().decode("unicode_escape")
    raw = raw.replace("/", "/")
    stations = json.loads(raw)
    return stations


def parse_stations(stations):
    rows = []
    for feat in stations:
        props = feat["properties"]
        coords = feat["geometry"]["coordinates"]
        services = ", ".join(
            s["name"]["en"] for s in props.get("services", [])
        )
        rows.append({
            "id": props.get("id", ""),
            "company_code": props.get("company_code", ""),
            "address": props.get("address", ""),
            "latitude": coords[1],
            "longitude": coords[0],
            "working_hours": props.get("working_hours", ""),
            "phone": props.get("office", ""),
            "hotline": props.get("hotline", ""),
            "services": services,
            "direction_link": props.get("direction_link", ""),
        })
    return rows


def save_csv(rows, path):
    fieldnames = [
        "id", "company_code", "address", "latitude", "longitude",
        "working_hours", "phone", "hotline", "services", "direction_link",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    print("Fetching Wissol gas station data from wissol.ge...")
    stations = fetch_stations()
    print(f"Found {len(stations)} stations.")

    rows = parse_stations(stations)
    csv_path = "data/wissol.csv"
    save_csv(rows, csv_path)
    print(f"Saved {len(rows)} stations to {csv_path}")


if __name__ == "__main__":
    main()
