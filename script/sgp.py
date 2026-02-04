import requests
import csv
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_URL = "https://sgp.ge/sgp-backend/api/integration/info/branches-new"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://sgp.ge",
    "Referer": "https://sgp.ge/locations",
    "Content-Type": "application/json",
}
PAYLOAD = {"ServiceTypeId": [], "FuelType": [], "BrandId": [], "RegionId": []}


def fetch_stations():
    r = requests.post(API_URL, json=PAYLOAD, headers=HEADERS, verify=False, timeout=30)
    r.raise_for_status()
    data = r.json()
    return data["GetBranches"]["Results"]


def parse_stations(stations):
    rows = []
    for s in stations:
        fuels = ", ".join(f["FuelNameEng"] for f in s.get("Fuels", []))
        services = ", ".join(sv["ServiceNameEng"] for sv in s.get("Services", []))
        payments = ", ".join(p["PaymentTypeEng"] for p in s.get("AvailablePayments", []))
        rows.append({
            "id": s.get("AgsId", ""),
            "name": s.get("AgsNameEng", ""),
            "address": s.get("AgsAddressEng", ""),
            "region": s.get("RegionNameEng", ""),
            "district": s.get("RegionDistrictNameEng", ""),
            "latitude": s.get("Latitude", ""),
            "longitude": s.get("Longitude", ""),
            "fuel_types": fuels,
            "services": services,
            "payments": payments,
        })
    return rows


def save_csv(rows, path):
    fieldnames = [
        "id", "name", "address", "region", "district",
        "latitude", "longitude", "fuel_types", "services", "payments",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    print("Fetching SOCAR (SGP) gas station data...")
    stations = fetch_stations()
    print(f"Found {len(stations)} stations.")

    rows = parse_stations(stations)
    csv_path = "data/sgp.csv"
    save_csv(rows, csv_path)
    print(f"Saved {len(rows)} stations to {csv_path}")


if __name__ == "__main__":
    main()
