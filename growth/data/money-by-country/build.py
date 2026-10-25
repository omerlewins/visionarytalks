"""Build app/src/data/money-by-country.json for the money-in-the-world map.

Broad money per country in US dollars, from the World Bank (broad money as a
share of GDP times GDP in current dollars, latest year per country), with central-bank
figures for the four largest currency areas (matching the article's table) and
for gaps in the World Bank series: Canada (M3) and Switzerland (M3). The euro
area is one bloc (ECB M3). Foreign-currency figures use the
Federal Reserve H.10 rate for the same month end, as the article does.

Run: python3 -I growth/data/money-by-country/build.py
"""

import csv
import io
import json
import pathlib
import urllib.request

OUT = pathlib.Path(__file__).parents[3] / "app/src/data/money-by-country.json"
WB = "https://api.worldbank.org/v2/country/all/indicator/{}?format=json&date=2018:2025&per_page=20000"
OLDEST = 2020

# Euro area members in 2026 (Bulgaria joined on January 1, 2026).
EURO = "AUT BEL BGR HRV CYP EST FIN FRA DEU GRC IRL ITA LVA LTU LUX MLT NLD PRT SVK SVN ESP".split()

# Central-bank figures, in local currency, with the FRED H.10 rate (local per USD,
# or USD per EUR) for the same month end. Checked October 25, 2026.
OVERRIDES = {
    # The four largest currency areas match the article's own M2 / M3 table.
    "USA": {
        "local": 23.34e12,
        "currency": "USD",
        "usd_per_unit": 1,
        "date": "2026-08-31",
        "measure": "M2",
        "source": "Federal Reserve",
        "url": "https://www.federalreserve.gov/releases/h6/current/default.htm",
    },
    "CHN": {
        "local": 359.63e12,
        "currency": "CNY",
        "usd_per_unit": 1 / 6.7045,
        "date": "2026-09-30",
        "measure": "M2",
        "source": "People's Bank of China",
        "url": "https://en.people.cn/n3/2026/1015/c90000-20508454.html",
    },
    "JPN": {
        "local": 1_295.6e12,
        "currency": "JPY",
        "usd_per_unit": 1 / 157.25,
        "date": "2026-09-30",
        "measure": "M2",
        "source": "Bank of Japan",
        "url": "https://www.boj.or.jp/en/statistics/money/ms/ms2609.pdf",
    },
    "EURO": {
        "name": "Euro area",
        "local": 17_646_463e6,
        "currency": "EUR",
        "usd_per_unit": 1.1617,
        "date": "2026-08-31",
        "measure": "M3",
        "source": "ECB",
        "url": "https://data.ecb.europa.eu/data/datasets/BSI/BSI.M.U2.Y.V.M30.X.1.U2.2300.Z01.E",
    },
    "CAN": {
        "local": 4_088_829e6,
        "currency": "CAD",
        "usd_per_unit": 1 / 1.3862,
        "date": "2026-08-31",
        "measure": "M3 (gross)",
        "source": "Bank of Canada",
        "url": "https://www.bankofcanada.ca/valet/observations/V41552785",
    },
    "CHE": {
        "local": 1_238_936e6,
        "currency": "CHF",
        "usd_per_unit": 1 / 0.8348,
        "date": "2026-09-30",
        "measure": "M3",
        "source": "Swiss National Bank",
        "url": "https://data.snb.ch/en/topics/snb/cube/snbmonagg",
    },
}


def get(url):
    with urllib.request.urlopen(url) as r:
        return r.read().decode()


def series(code):
    out = {}
    for r in json.loads(get(WB.format(code)))[1]:
        if r["value"] is not None:
            out.setdefault(r["countryiso3code"], {})[int(r["date"])] = r["value"]
    return out


def latest(values, year):
    years = [y for y in values if y <= year]
    return values[max(years)] if years else None


meta = json.loads(get("https://api.worldbank.org/v2/country?format=json&per_page=400"))[1]
names = {c["id"]: c["name"] for c in meta if c["region"]["value"] != "Aggregates"}
iso = csv.DictReader(io.StringIO(get(
    "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv"
)))
numeric = {r["alpha-3"]: r["country-code"] for r in iso}
numeric["XKX"] = "-99"  # Kosovo has no ISO numeric code
money, gdp, pop = (series(c) for c in ("FM.LBL.BMNY.GD.ZS", "NY.GDP.MKTP.CD", "SP.POP.TOTL"))

countries = []
for code, name in names.items():
    if code in EURO or code in OVERRIDES:
        continue
    years = [y for y in money.get(code, {}) if y in gdp.get(code, {})]
    if not years or max(years) < OLDEST:
        continue
    year = max(years)
    usd = money[code][year] / 100 * gdp[code][year]
    people = latest(pop.get(code, {}), year)
    countries.append({
        "iso3": code, "numeric": numeric.get(code), "name": name,
        "usd": round(usd), "perPerson": round(usd / people) if people else None,
        "pctGDP": round(money[code][year], 1), "asOf": str(year),
        "measure": "Broad money", "source": "World Bank",
    })

for code, o in OVERRIDES.items():
    members = EURO if code == "EURO" else [code]
    people = sum(latest(pop[m], 2025) for m in members)
    usd = o["local"] * o["usd_per_unit"]
    for m in members:
        countries.append({
            "iso3": m, "numeric": numeric[m], "name": names[m],
            "bloc": o.get("name"), "usd": round(usd), "perPerson": round(usd / people),
            "pctGDP": None, "asOf": o["date"], "measure": o["measure"],
            "source": o["source"], "sourceUrl": o["url"],
            "local": o["local"], "currency": o["currency"],
        })

countries.sort(key=lambda c: -c["usd"])
OUT.write_text(json.dumps({
    "checked": "2026-10-25",
    "worldBankUrl": "https://data.worldbank.org/indicator/FM.LBL.BMNY.GD.ZS",
    "oldestYear": OLDEST,
    "countries": countries,
}, indent=1, ensure_ascii=False) + "\n")
print(len(countries), "countries written to", OUT)
