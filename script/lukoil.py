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

CITY_MAP = {
    "თბილისი": "Tbilisi",
    "რუსთავი": "Rustavi",
    "ბათუმი": "Batumi",
    "ქუთაისი": "Kutaisi",
    "გორი": "Gori",
    "ზუგდიდი": "Zugdidi",
    "ფოთი": "Poti",
    "ხაშური": "Khashuri",
    "ოზურგეთი": "Ozurgeti",
    "მარნეული": "Marneuli",
    "ზესტაფონი": "Zestaponi",
    "ტყიბული": "Tkibuli",
    "ამბროლაური": "Ambrolauri",
    "ონი": "Oni",
    "საჩხერე": "Sachkhere",
    "ჭიათურა": "Chiatura",
    "ახალქალაქი": "Akhalkalaki",
    "ახალციხე": "Akhaltsikhe",
    "ნინოწმინდა": "Ninotsminda",
    "ბაკურიანი": "Bakuriani",
    "თელავი": "Telavi",
    "მარტვილი": "Martvili",
    "ხონი": "Khoni",
    "ქობულეთი": "Kobuleti",
    "კასპის რ-ნი": "Kaspi District",
    "მცხეთის რ-ნი": "Mtskheta District",
    "ადიგენის რ-ნი": "Adigeni District",
}

ADDRESS_MAP = {
    "მტკვრის მარჯვენა სანაპირო, გოთუას ქ. მ/ტ.": "Mtkvari Right Bank, near Gotua St.",
    "დ. აღმაშენებლის ხეივანი  228.": "D. Agmashenebeli Ave. 228",
    "მტკვრის მარცხენა სანაპირო, ელიავას ბაზრობის მ/ტ.": "Mtkvari Left Bank, near Eliava Market",
    "დ. აღმაშენებლის ხეივნი 1.": "D. Agmashenebeli Ave. 1",
    "კახეთის გზატკ. ორხევის ხიდთან": "Kakheti Highway, near Orkhevi Bridge",
    "კოსტავას 69 - ლაგუნა.": "Kostava St. 69 - Laguna",
    "მარცხენა სანაპირო ბაგრატიონის ხიდის მ/ტ.": "Left Bank, near Baratashvili Bridge",
    "თამარაშვილის ქ.10გ.": "Tamarashvili St. 10G",
    "გელოვანის გამზ. მეღვინეობ-მევენახეობის ინსტ. მ/ტ.": "Gelovani Ave., near Winemaking Institute",
    "შეშელიძის 24.": "Sheshelidze St. 24",
    "გურამიშვილის გამზ. ცისარტყელას მ/ტ.": "Guramishvili Ave., near Tsisartkela",
    "წერეთლის გამზ. 148": "Tsereteli Ave. 148",
    "წერეთლის გამზ. 145": "Tsereteli Ave. 145",
    "კახეთის გზატკეცილი აეროპორტის გზაზე.": "Kakheti Highway, Airport Road",
    "ორთაჭალჰესი 72-ე სკოლის მ/ტ.": "Ortachala, near School #72",
    "ა. წურწუმიას ქ. 4ბ.": "A. Tsurtsumia St. 4B",
    "ჯავახეთის ქ. 17ა": "Javakheti St. 17A",
    "აღმაშენებლის ხეივანი 169": "Agmashenebeli Ave. 169",
    "რუსთავის გზატკეცილი მე-20-ე კმ.": "Rustavi Highway, km 20",
    "შავშეთის ქ. 25ა.": "Shavsheti St. 25A",
    "გოგოლის ქ.": "Gogoli St.",
    "სოფ. ანგისა.": "Village Angisa",
    "სოფელი ჩიხა, თამარ მეფის ქ. 19.": "Village Chikha, Tamar Mepe St. 19",
    "ვ.სტაროსელსკის ქ. 45": "V. Staroselski St. 45",
    "მღვიმევის ქ. 4 ბ.": "Mghvimevi St. 4B",
    "ვაჟა-ფშაველას ქ. 9.": "Vazha-Pshavela St. 9",
    "სტალინის ქ. 145": "Stalin St. 145",
    "ბორჯომის ქ.": "Borjomi St.",
    "ცხინვალის გზატკეცილი 2.": "Tskhinvali Highway 2",
    "რუსთაველის რკალი": "Rustaveli Circle",
    "ვახტანგ VI ქ.": "Vakhtang VI St.",
    "აღმაშენებლის ქ. 10": "Agmashenebeli St. 10",
    "მ. აბაშიძის ქ. 14": "M. Abashidze St. 14",
    "თავისუფლების ქ. 1.": "Tavisuplebis (Freedom) St. 1",
    "ჭანტურიას ქ. 153": "Chanturia St. 153",
    "აღმაშენებლის ქ. 2": "Agmashenebeli St. 2",
    "ლ.ასათიანის ქ. 98": "L. Asatiani St. 98",
    "სოფელი ოკამი": "Village Okami",
    "სოფ. მისაქციელი": "Village Misaktsieli",
    "სულხან-საბა": "Sulkhan-Saba",
    "ტყვარჩელის ქ. 27": "Tkvarcheli St. 27",
    "აღმაშენებლის ქ. 185": "Agmashenebeli St. 185",
    "გია გულუას ქ. 26": "Gia Gulua St. 26",
    "კოსტავას ქ. 92.": "Kostava St. 92",
    "აბასთუმნის გზატკეცილი": "Abastumani Highway",
    "მშვიდობის ქ. 115": "Mshvidobis (Peace) St. 115",
    "აღმაშენებლის პროსპექტი 62ა": "Agmashenebeli Ave. 62A",
    "სოფ. გონიო": "Village Gonio",
    "ბაქოს ქ.": "Bako St.",
    "26 მაისის ქ.": "26 May St.",
    "26 მაისის ქ. ": "26 May St.",
    "ვაზისუბნის დასახლება 25": "Vazissubani Settlement 25",
    "სოფ. არალი, ვალეს საბაჯო პუნქტთან ახლოს": "Village Arali, near Vale Customs Point",
    "სოფ. არალი": "Village Arali",
    "გურამიშვილის პროსპექტი 8": "Guramishvili Ave. 8",
    "ურიდიისა და ხუდადოვის ქუჩების კვეთა": "Uridiisa and Khudadovi St. Intersection",
    "რუსთავის გზატკეცილი მე-22-ე კმ.": "Rustavi Highway, km 22",
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


def translate(text, mapping):
    return mapping.get(text.strip(), text.strip())


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
        if i < len(table_rows):
            num, city_geo, addr_geo, stype_geo = table_rows[i]
            city = translate(city_geo, CITY_MAP)
            address = translate(addr_geo, ADDRESS_MAP)
            station_type = TYPE_MAP.get(stype_geo.strip(), stype_geo.strip())
        else:
            city = ""
            address = popup.encode("raw_unicode_escape").decode("unicode_escape")
            station_type = ""

        rows.append({
            "id": i + 1,
            "city": city,
            "address": address,
            "latitude": lat,
            "longitude": lng,
            "type": station_type,
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
