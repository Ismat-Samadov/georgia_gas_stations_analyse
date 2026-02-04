import requests
import re
import csv
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

LIVE_URL = "https://www.lukoil.ge/stations"
WAYBACK_URL = "https://web.archive.org/web/2025/https://www.lukoil.ge/stations"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

TYPE_MAP = {
    "საკუთარი": "Own",
    "ფრენჩაიზი": "Franchise",
    "ფრენჩაიზინგი": "Franchise",
}


def fetch_page():
    # Try live site first
    try:
        r = requests.get(LIVE_URL, headers=HEADERS, verify=False, timeout=10)
        r.raise_for_status()
        if "L.marker" in r.text:
            print("Fetched from live site.")
            return r.text
    except Exception as e:
        print(f"Live site unavailable ({e}), trying Wayback Machine...")

    # Fallback to Wayback Machine
    r = requests.get(WAYBACK_URL, headers=HEADERS, verify=False, timeout=30)
    r.raise_for_status()
    print("Fetched from Wayback Machine cache.")
    return r.text


def parse_stations(html):
    # Extract markers: lat, lng, popup text (address with city)
    markers = re.findall(
        r'L\.marker\(\[([0-9.]+),\s*([0-9.]+)\]\);\s*\n\s*marker\.addTo\(mymap\);\s*\n\s*marker\.bindPopup\("(.*?)"\)',
        html,
    )

    # Extract table rows: #, city, address, type
    table_rows = re.findall(
        r'<p class="text-lk-main text-md font-semibold">\s*(\d+)\s*</p>.*?'
        r'<p class="text-lk-main text-md font-semibold">\s*(.*?)\s*</p>.*?'
        r'<p class="text-lk-main text-sm font-semibold text-center">\s*(.*?)\s*</p>.*?'
        r'<p class="text-lk-main text-md font-semibold">\s*(.*?)\s*</p>',
        html,
        re.DOTALL,
    )

    rows = []
    for i, (lat, lng, popup) in enumerate(markers):
        address_geo = popup.encode("raw_unicode_escape").decode("unicode_escape")
        address_geo = address_geo.replace("/", "/").strip()

        if i < len(table_rows):
            num, city, addr, stype = table_rows[i]
            city = city.strip()
            addr = addr.strip()
            stype = TYPE_MAP.get(stype.strip(), stype.strip())
        else:
            city = ""
            addr = address_geo
            stype = ""

        rows.append({
            "id": i + 1,
            "city": city,
            "address": addr,
            "latitude": lat,
            "longitude": lng,
            "type": stype,
        })

    return rows


def save_csv(rows, path):
    fieldnames = ["id", "city", "address", "latitude", "longitude", "type"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    print("Fetching Lukoil gas station data...")
    html = fetch_page()

    rows = parse_stations(html)
    print(f"Found {len(rows)} stations.")

    csv_path = "data/lukoil.csv"
    save_csv(rows, csv_path)
    print(f"Saved {len(rows)} stations to {csv_path}")


if __name__ == "__main__":
    main()
