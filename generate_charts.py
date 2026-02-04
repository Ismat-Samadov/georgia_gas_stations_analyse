"""
Georgia Gas Station Market Analysis — Chart Generator
Strategic focus: SOCAR (SGP) competitive position
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import os
import math

CHARTS_DIR = "charts"
DATA_PATH = "data/final.csv"

# Brand colors — SGP highlighted in SOCAR blue
BRAND_COLORS = {
    "SGP":       "#0072CE",  # SOCAR blue (hero)
    "Gulf":      "#EE3124",
    "Rompetrol": "#F5A623",
    "Wissol":    "#4CAF50",
    "Lukoil":    "#D32F2F",
}
BRAND_ORDER = ["Gulf", "Wissol", "SGP", "Rompetrol", "Lukoil"]

plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor":   "#FAFAFA",
    "axes.grid":        True,
    "grid.alpha":       0.3,
    "font.size":        11,
    "axes.titlesize":   14,
    "axes.titleweight": "bold",
    "figure.dpi":       150,
})


def load_data():
    df = pd.read_csv(DATA_PATH, encoding="utf-8")
    df["fuel_types"] = df["fuel_types"].fillna("")
    df["services"] = df["services"].fillna("")
    df["city"] = df["city"].fillna("")
    df["phone"] = df["phone"].fillna("")
    df["working_hours"] = df["working_hours"].fillna("")
    df["station_type"] = df["station_type"].fillna("")
    return df


def save(fig, name):
    path = os.path.join(CHARTS_DIR, name)
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"  saved {path}")


# ── 1. Market Share ──────────────────────────────────────────────────────────

def chart_market_share(df):
    counts = df["brand"].value_counts().reindex(BRAND_ORDER)
    total = counts.sum()
    colors = [BRAND_COLORS[b] for b in BRAND_ORDER]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(counts.index, counts.values, color=colors, edgecolor="white", height=0.6)

    for bar, val in zip(bars, counts.values):
        pct = val / total * 100
        ax.text(bar.get_width() + 2, bar.get_y() + bar.get_height() / 2,
                f"{val}  ({pct:.1f}%)", va="center", fontweight="bold", fontsize=12)

    ax.set_xlabel("Number of Stations")
    ax.set_title("Market Share by Station Count — Georgia Gas Station Market")
    ax.set_xlim(0, counts.max() * 1.25)
    ax.invert_yaxis()
    save(fig, "01_market_share.png")


# ── 2. Tbilisi Battleground ──────────────────────────────────────────────────

def chart_tbilisi(df):
    tbl = df[df["city"] == "Tbilisi"]
    counts = tbl["brand"].value_counts().reindex(BRAND_ORDER).fillna(0).astype(int)
    colors = [BRAND_COLORS[b] for b in BRAND_ORDER]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(counts.index, counts.values, color=colors, edgecolor="white", width=0.6)

    for bar, val in zip(bars, counts.values):
        if val > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                    str(val), ha="center", fontweight="bold", fontsize=13)

    ax.set_ylabel("Number of Stations")
    ax.set_title("Tbilisi — The Capital Battleground (134 stations)")
    ax.set_ylim(0, counts.max() * 1.2)
    save(fig, "02_tbilisi_battle.png")


# ── 3. Top Cities Heatmap (stacked bar) ──────────────────────────────────────

def chart_top_cities(df):
    # Get top 12 cities by total count (excluding unknown)
    city_counts = df[df["city"] != ""].groupby("city").size()
    top_cities = city_counts.nlargest(12).index.tolist()

    pivot = df[df["city"].isin(top_cities)].groupby(["city", "brand"]).size().unstack(fill_value=0)
    pivot = pivot.reindex(columns=BRAND_ORDER, fill_value=0)
    pivot = pivot.loc[pivot.sum(axis=1).sort_values(ascending=True).index]

    colors = [BRAND_COLORS[b] for b in BRAND_ORDER]

    fig, ax = plt.subplots(figsize=(12, 7))
    pivot.plot(kind="barh", stacked=True, ax=ax, color=colors, edgecolor="white", width=0.7)

    ax.set_xlabel("Number of Stations")
    ax.set_title("Top 12 Cities — Brand Presence Breakdown")
    ax.legend(title="Brand", bbox_to_anchor=(1.01, 1), loc="upper left")
    save(fig, "03_top_cities_stacked.png")


# ── 4. SGP Coverage Gaps — Cities Where Competitors Exist but SGP is Absent ─

def chart_coverage_gaps(df):
    sgp_cities = set(df[df["brand"] == "SGP"]["city"].unique())
    non_sgp = df[(df["brand"] != "SGP") & (~df["city"].isin(sgp_cities)) & (df["city"] != "")]
    gap_counts = non_sgp.groupby("city").size().nlargest(15)

    # Color by dominant brand in each city
    gap_colors = []
    for city in gap_counts.index:
        city_df = non_sgp[non_sgp["city"] == city]
        dominant = city_df["brand"].value_counts().index[0]
        gap_colors.append(BRAND_COLORS[dominant])

    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.barh(gap_counts.index, gap_counts.values, color=gap_colors, edgecolor="white", height=0.6)

    for bar, val in zip(bars, gap_counts.values):
        ax.text(bar.get_width() + 0.2, bar.get_y() + bar.get_height() / 2,
                str(val), va="center", fontweight="bold")

    ax.set_xlabel("Competitor Stations Present")
    ax.set_title("Top 15 SGP Coverage Gaps — Cities Where Competitors Operate, SGP Does Not")
    ax.invert_yaxis()
    save(fig, "04_sgp_coverage_gaps.png")


# ── 5. Alternative Fuel Leadership (CNG / LPG) ──────────────────────────────

def chart_alt_fuel(df):
    brands = BRAND_ORDER
    cng_counts = []
    lpg_counts = []
    for b in brands:
        bdf = df[df["brand"] == b]
        cng = bdf["fuel_types"].str.contains("CNG", na=False).sum()
        lpg = bdf["fuel_types"].str.contains("LPG", na=False).sum()
        cng_counts.append(cng)
        lpg_counts.append(lpg)

    x = np.arange(len(brands))
    w = 0.35

    fig, ax = plt.subplots(figsize=(10, 5))
    b1 = ax.bar(x - w / 2, cng_counts, w, label="CNG", color="#0072CE", edgecolor="white")
    b2 = ax.bar(x + w / 2, lpg_counts, w, label="LPG", color="#00A86B", edgecolor="white")

    for bar in b1:
        if bar.get_height() > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                    str(int(bar.get_height())), ha="center", fontweight="bold")
    for bar in b2:
        if bar.get_height() > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                    str(int(bar.get_height())), ha="center", fontweight="bold")

    ax.set_xticks(x)
    ax.set_xticklabels(brands)
    ax.set_ylabel("Number of Stations")
    ax.set_title("Alternative Fuel Leadership — CNG & LPG Station Count by Brand")
    ax.legend()
    save(fig, "05_alt_fuel_leadership.png")


# ── 6. Service Richness Comparison ──────────────────────────────────────────

def chart_service_comparison(df):
    key_services = {
        "Store/Market":   ["Way-Mart", "Market", "Supermarket", "Shop"],
        "Food/Cafe":      ["Coffee", "Hot Dog", "Sandwich", "Hot-Dog Campaign", "Food"],
        "Service Center": ["Service Center", "Service Block"],
        "Car Wash":       ["Car Wash"],
        "EV Charging":    ["Charger", "Power Charger", "Fast Charger"],
        "Restroom (WC)":  ["WC"],
        "ATM/Payment":    ["ATM", "POS Terminal", "Smart Pay", "Fill&Go"],
        "CNG Fuel":       ["CNG"],
    }

    brands = BRAND_ORDER
    data = {svc: [] for svc in key_services}

    for b in brands:
        bdf = df[df["brand"] == b]
        total = len(bdf)
        for svc_name, keywords in key_services.items():
            count = 0
            for _, row in bdf.iterrows():
                combined = f"{row['services']}, {row['fuel_types']}"
                if any(kw in combined for kw in keywords):
                    count += 1
            data[svc_name].append(round(count / total * 100, 1) if total else 0)

    x = np.arange(len(key_services))
    w = 0.15
    fig, ax = plt.subplots(figsize=(14, 6))

    for i, b in enumerate(brands):
        vals = [data[s][i] for s in key_services]
        offset = (i - len(brands) / 2 + 0.5) * w
        bars = ax.bar(x + offset, vals, w, label=b, color=BRAND_COLORS[b], edgecolor="white")

    ax.set_xticks(x)
    ax.set_xticklabels(key_services.keys(), rotation=30, ha="right")
    ax.set_ylabel("% of Brand's Stations")
    ax.set_title("Service Offering Coverage by Brand — % of Stations with Each Service")
    ax.legend(title="Brand", bbox_to_anchor=(1.01, 1), loc="upper left")
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())
    save(fig, "06_service_comparison.png")


# ── 7. Regional Dominance ────────────────────────────────────────────────────

def chart_regional(df):
    # Map cities to regions
    region_map = {
        "Tbilisi": "Tbilisi",
        "Rustavi": "Kvemo Kartli", "Marneuli": "Kvemo Kartli", "Gardabani": "Kvemo Kartli",
        "Bolnisi": "Kvemo Kartli",
        "Kutaisi": "Imereti", "Zestaponi": "Imereti", "Sachkhere": "Imereti",
        "Chiatura": "Imereti", "Tkibuli": "Imereti", "Samtredia": "Imereti",
        "Khoni": "Imereti", "Vani": "Imereti", "Terjola": "Imereti",
        "Batumi": "Adjara", "Kobuleti": "Adjara", "Khelvachauri": "Adjara",
        "Gori": "Shida Kartli", "Kaspi": "Shida Kartli", "Khashuri": "Shida Kartli",
        "Kaspi District": "Shida Kartli",
        "Zugdidi": "Samegrelo", "Senaki": "Samegrelo", "Poti": "Samegrelo",
        "Martvili": "Samegrelo", "Khobi": "Samegrelo", "Abasha": "Samegrelo",
        "Tsalenjikha": "Samegrelo",
        "Telavi": "Kakheti", "Gurjaani": "Kakheti", "Sagarejo": "Kakheti",
        "Akhmeta": "Kakheti", "Sighnaghi": "Kakheti", "Lagodekhi": "Kakheti",
        "Dedoplistskaro": "Kakheti", "Kvareli": "Kakheti",
        "Akhaltsikhe": "Samtskhe-Javakheti", "Akhalkalaki": "Samtskhe-Javakheti",
        "Ninotsminda": "Samtskhe-Javakheti", "Borjomi": "Samtskhe-Javakheti",
        "Bakuriani": "Samtskhe-Javakheti",
        "Ozurgeti": "Guria", "Lanchkhuti": "Guria",
        "Ambrolauri": "Racha-Lechkhumi", "Oni": "Racha-Lechkhumi",
        "Mtskheta": "Mtskheta-Mtianeti", "Mtskheta District": "Mtskheta-Mtianeti",
    }

    # Also map SGP region names
    sgp_region_map = {
        "Kvemo Kartli": "Kvemo Kartli", "Imereti": "Imereti",
        "Kakheti": "Kakheti", "Adjara": "Adjara",
        "Shida Kartli": "Shida Kartli", "Samegrelo": "Samegrelo",
        "Samtskhe-Javakheti": "Samtskhe-Javakheti", "Guria": "Guria",
        "Racha-Lechkhumi": "Racha-Lechkhumi", "Svaneti": "Svaneti",
        "Mtskheta-Mtianeti": "Mtskheta-Mtianeti",
    }

    def get_region(row):
        city = row["city"]
        if city in region_map:
            return region_map[city]
        if city in sgp_region_map:
            return sgp_region_map[city]
        if city == "Tbilisi":
            return "Tbilisi"
        return ""

    df2 = df.copy()
    df2["region"] = df2.apply(get_region, axis=1)
    df2 = df2[df2["region"] != ""]

    regions = ["Tbilisi", "Imereti", "Adjara", "Kvemo Kartli", "Samegrelo",
               "Kakheti", "Shida Kartli", "Samtskhe-Javakheti", "Guria"]

    pivot = df2[df2["region"].isin(regions)].groupby(["region", "brand"]).size().unstack(fill_value=0)
    pivot = pivot.reindex(columns=BRAND_ORDER, fill_value=0)
    pivot = pivot.reindex(regions)

    colors = [BRAND_COLORS[b] for b in BRAND_ORDER]

    fig, ax = plt.subplots(figsize=(14, 7))
    pivot.plot(kind="bar", stacked=False, ax=ax, color=colors, edgecolor="white", width=0.75)

    ax.set_ylabel("Number of Stations")
    ax.set_title("Regional Presence — Brand Distribution Across Georgian Regions")
    ax.legend(title="Brand", bbox_to_anchor=(1.01, 1), loc="upper left")
    plt.xticks(rotation=35, ha="right")
    save(fig, "07_regional_presence.png")


# ── 8. SGP Share by Region ───────────────────────────────────────────────────

def chart_sgp_regional_share(df):
    region_map = {
        "Tbilisi": "Tbilisi",
        "Kvemo Kartli": "Kvemo Kartli", "Imereti": "Imereti",
        "Kakheti": "Kakheti", "Adjara": "Adjara",
        "Shida Kartli": "Shida Kartli", "Samegrelo": "Samegrelo",
        "Samtskhe-Javakheti": "Samtskhe-Javakheti", "Guria": "Guria",
    }

    # For SGP, city column contains region names directly
    sgp = df[df["brand"] == "SGP"].copy()
    sgp_region_counts = sgp["city"].value_counts()

    # For total, use all data but approximate
    regions_list = list(region_map.values())
    region_data = []

    for region in regions_list:
        sgp_count = sgp_region_counts.get(region, 0)
        # Total in region: count all brands
        total = 0
        for _, row in df.iterrows():
            c = row["city"]
            if c == region or region_map.get(c) == region:
                total += 1
        if total > 0:
            share = sgp_count / total * 100
            region_data.append((region, sgp_count, total, share))

    region_data.sort(key=lambda x: -x[3])
    names = [r[0] for r in region_data]
    shares = [r[3] for r in region_data]
    sgp_n = [r[1] for r in region_data]
    total_n = [r[2] for r in region_data]

    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.barh(names, shares, color="#0072CE", edgecolor="white", height=0.6)

    for bar, sn, tn in zip(bars, sgp_n, total_n):
        ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height() / 2,
                f"{bar.get_width():.0f}%  ({sn}/{tn})", va="center", fontweight="bold")

    ax.set_xlabel("SGP Market Share (%)")
    ax.set_title("SGP (SOCAR) Market Share by Region")
    ax.set_xlim(0, max(shares) * 1.4 if shares else 50)
    ax.invert_yaxis()
    ax.axvline(x=18, color="red", linestyle="--", alpha=0.5, label="National avg (18%)")
    ax.legend()
    save(fig, "08_sgp_regional_share.png")


# ── 9. Fuel Type Diversity ───────────────────────────────────────────────────

def chart_fuel_diversity(df):
    brands = BRAND_ORDER
    has_fuel = []
    no_fuel = []
    avg_types = []

    for b in brands:
        bdf = df[df["brand"] == b]
        total = len(bdf)
        with_fuel = bdf[bdf["fuel_types"] != ""]
        has_fuel.append(len(with_fuel))
        no_fuel.append(total - len(with_fuel))
        if len(with_fuel) > 0:
            avg_n = with_fuel["fuel_types"].apply(lambda x: len(x.split(", "))).mean()
            avg_types.append(round(avg_n, 1))
        else:
            avg_types.append(0)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Left: stacked bar of fuel data availability
    colors_yes = [BRAND_COLORS[b] for b in brands]
    ax1.bar(brands, has_fuel, color=colors_yes, edgecolor="white", label="Fuel data available")
    ax1.bar(brands, no_fuel, bottom=has_fuel, color="#E0E0E0", edgecolor="white", label="No fuel data")
    for i, (hf, nf) in enumerate(zip(has_fuel, no_fuel)):
        total = hf + nf
        pct = hf / total * 100 if total else 0
        ax1.text(i, total + 1, f"{pct:.0f}%", ha="center", fontweight="bold", fontsize=11)
    ax1.set_ylabel("Stations")
    ax1.set_title("Fuel Data Availability by Brand")
    ax1.legend(loc="upper right")

    # Right: avg fuel types per station
    bars = ax2.bar(brands, avg_types, color=[BRAND_COLORS[b] for b in brands], edgecolor="white")
    for bar, val in zip(bars, avg_types):
        if val > 0:
            ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.05,
                     f"{val}", ha="center", fontweight="bold", fontsize=12)
    ax2.set_ylabel("Avg Fuel Types per Station")
    ax2.set_title("Fuel Type Diversity (where data available)")

    fig.suptitle("Fuel Portfolio Analysis", fontsize=15, fontweight="bold", y=1.02)
    fig.tight_layout()
    save(fig, "09_fuel_diversity.png")


# ── 10. Competitive Intensity Map (top cities) ──────────────────────────────

def chart_competitive_intensity(df):
    city_brands = df[df["city"] != ""].groupby("city")["brand"].nunique()
    city_total = df[df["city"] != ""].groupby("city").size()

    multi = city_brands[city_brands >= 2].sort_values(ascending=False)
    top_multi = multi.head(15)

    cities = top_multi.index.tolist()
    n_brands_list = top_multi.values
    n_stations = [city_total[c] for c in cities]

    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.barh(cities, n_stations, color=["#0072CE" if city_brands.get(c, 0) >= 4 else
                                                "#F5A623" if city_brands.get(c, 0) >= 3 else
                                                "#4CAF50" for c in cities],
                   edgecolor="white", height=0.6)

    for bar, ns, nb in zip(bars, n_stations, n_brands_list):
        ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height() / 2,
                f"{ns} stations, {nb} brands", va="center", fontsize=10)

    ax.set_xlabel("Number of Stations")
    ax.set_title("Competitive Intensity — Cities with Multiple Brands")
    ax.invert_yaxis()
    save(fig, "10_competitive_intensity.png")


# ── 11. SGP vs Gulf Head-to-Head ─────────────────────────────────────────────

def chart_sgp_vs_gulf(df):
    metrics = ["Total Stations", "Tbilisi", "CNG Stations", "LPG Stations",
               "With Store", "With Service Center", "With Food"]

    sgp = df[df["brand"] == "SGP"]
    gulf = df[df["brand"] == "Gulf"]

    sgp_vals = [
        len(sgp),
        len(sgp[sgp["city"] == "Tbilisi"]),
        sgp["fuel_types"].str.contains("CNG", na=False).sum(),
        sgp["fuel_types"].str.contains("LPG", na=False).sum(),
        sgp["services"].str.contains("Way-Mart|Store|Market", na=False).sum(),
        sgp["services"].str.contains("Service Center|Service Block", na=False).sum(),
        sgp["services"].str.contains("Food|McDonald", na=False).sum(),
    ]
    gulf_vals = [
        len(gulf),
        len(gulf[gulf["city"] == "Tbilisi"]),
        gulf["fuel_types"].str.contains("CNG", na=False).sum(),
        gulf["fuel_types"].str.contains("LPG", na=False).sum(),
        gulf["services"].str.contains("Shop|Store|Market", na=False).sum(),
        gulf["services"].str.contains("Service Center", na=False).sum(),
        gulf["services"].str.contains("Coffee|Hot Dog|Sandwich", na=False).sum(),
    ]

    x = np.arange(len(metrics))
    w = 0.35

    fig, ax = plt.subplots(figsize=(12, 6))
    b1 = ax.bar(x - w / 2, sgp_vals, w, label="SGP (SOCAR)", color="#0072CE", edgecolor="white")
    b2 = ax.bar(x + w / 2, gulf_vals, w, label="Gulf (#1)", color="#EE3124", edgecolor="white")

    for bar in b1:
        if bar.get_height() > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                    str(int(bar.get_height())), ha="center", fontweight="bold", fontsize=10)
    for bar in b2:
        if bar.get_height() > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                    str(int(bar.get_height())), ha="center", fontweight="bold", fontsize=10)

    ax.set_xticks(x)
    ax.set_xticklabels(metrics, rotation=25, ha="right")
    ax.set_ylabel("Count")
    ax.set_title("SGP vs Gulf — Head-to-Head Competitive Comparison")
    ax.legend()
    save(fig, "11_sgp_vs_gulf.png")


# ── 12. Geographic Scatter (map-like) ────────────────────────────────────────

def chart_geographic_scatter(df):
    fig, ax = plt.subplots(figsize=(12, 10))

    for brand in reversed(BRAND_ORDER):
        bdf = df[df["brand"] == brand]
        alpha = 0.9 if brand == "SGP" else 0.4
        size = 40 if brand == "SGP" else 15
        zorder = 10 if brand == "SGP" else 1
        ax.scatter(bdf["longitude"], bdf["latitude"], c=BRAND_COLORS[brand],
                   s=size, alpha=alpha, label=f"{brand} ({len(bdf)})",
                   edgecolors="white" if brand == "SGP" else "none",
                   linewidth=0.5, zorder=zorder)

    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.set_title("Geographic Distribution — All 554 Gas Stations Across Georgia")
    ax.legend(title="Brand", markerscale=1.5)
    ax.set_aspect("equal")
    save(fig, "12_geographic_scatter.png")


# ── 13. SGP Expansion Opportunity Score ──────────────────────────────────────

def chart_expansion_opportunity(df):
    sgp_cities = set(df[df["brand"] == "SGP"]["city"].unique())

    # Cities with competitors but no SGP, ranked by number of competitor stations
    non_sgp = df[(df["brand"] != "SGP") & (~df["city"].isin(sgp_cities)) & (df["city"] != "")]
    gap_data = non_sgp.groupby("city").agg(
        stations=("brand", "size"),
        brands=("brand", "nunique"),
    ).sort_values("stations", ascending=False).head(12)

    # Opportunity score = stations * brands (more competitors = proven demand)
    gap_data["opportunity"] = gap_data["stations"] * gap_data["brands"]
    gap_data = gap_data.sort_values("opportunity", ascending=True)

    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.barh(gap_data.index, gap_data["opportunity"],
                   color="#0072CE", edgecolor="white", height=0.6)

    for bar, (_, row) in zip(bars, gap_data.iterrows()):
        ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height() / 2,
                f"Score: {row['opportunity']}  ({row['stations']} stations, {row['brands']} brands)",
                va="center", fontsize=9)

    ax.set_xlabel("Expansion Opportunity Score (stations x brands)")
    ax.set_title("SGP Expansion Priorities — Underserved Markets with Proven Demand")
    save(fig, "13_expansion_opportunity.png")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    os.makedirs(CHARTS_DIR, exist_ok=True)
    df = load_data()
    print(f"Loaded {len(df)} stations\n")

    print("Generating charts...")
    chart_market_share(df)
    chart_tbilisi(df)
    chart_top_cities(df)
    chart_coverage_gaps(df)
    chart_alt_fuel(df)
    chart_service_comparison(df)
    chart_regional(df)
    chart_sgp_regional_share(df)
    chart_fuel_diversity(df)
    chart_competitive_intensity(df)
    chart_sgp_vs_gulf(df)
    chart_geographic_scatter(df)
    chart_expansion_opportunity(df)

    print(f"\nDone — {len(os.listdir(CHARTS_DIR))} charts saved to {CHARTS_DIR}/")


if __name__ == "__main__":
    main()
