"""Build app/src/data/atc-pay.json for the air traffic controller salary page.

Two official sources, both checked October 25, 2026:
- FAA controller pay bands (AG, D1 to D3, CPC) by facility level 4 to 12 for
  every locality pay area, effective January 11, 2026, from the FAA's own
  spreadsheet. These do not yet include the 2.8% raise agreed on October 16,
  2026.
- BLS Occupational Employment and Wage Statistics, May 2025, for air traffic
  controllers (SOC 53-2021): nation and every state, via the BLS public API.

Run: python3 -I growth/data/atc-salary/build.py
"""

import io
import json
import pathlib
import urllib.request

import openpyxl

OUT = pathlib.Path(__file__).parents[3] / "app/src/data/atc-pay.json"
FAA = "https://www.faa.gov/jobs/working_here/benefits/pay/atspp_pay_tables.xlsx"
BLS = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
LEVELS = list(range(4, 13))
BANDS = {"CPC/TMC/TMS": "CPC", "D3": "D3", "D2": "D2", "D1": "D1", "AG": "AG"}

STATES = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
    "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
    "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
    "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
    "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
    "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
    "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
    "55": "WI", "56": "WY", "72": "PR",
}
# OEWS data types: 01 employment, 03 hourly mean, 04 annual mean, 08 hourly
# median, 11 to 15 annual 10th, 25th, 50th, 75th and 90th percentiles.
NATIONAL = {"01": "employment", "03": "hourlyMean", "04": "mean", "08": "hourlyMedian",
            "11": "p10", "12": "p25", "13": "median", "14": "p75", "15": "p90"}
STATE = {"01": "employment", "04": "mean", "13": "median"}


def faa_bands():
    raw = urllib.request.urlopen(urllib.request.Request(FAA, headers={"User-Agent": "Mozilla/5.0"})).read()
    book = openpyxl.load_workbook(io.BytesIO(raw), data_only=True)
    areas = []
    for sheet in book.worksheets:
        rows = list(sheet.iter_rows(values_only=True))
        if not any("effective January 11, 2026" in str(c) for r in rows[:3] for c in r):
            continue
        if "Prior Year" in sheet.title:
            continue
        name, rate = "No locality", 0.0
        for r in rows[:5]:
            cells = [c for c in r if c is not None]  # Des Moines has a gap
            for a, b in zip(cells, cells[1:]):
                if isinstance(a, str) and isinstance(b, float) and 0 < b < 1:
                    name, rate = a.strip(), b
        if sheet.title == "NO LOCALITY":
            name, rate = "No locality", 0.0
        bands, current = {}, None
        for r in rows:
            label = r[1] if len(r) > 1 else None
            if label in BANDS:
                current = BANDS[label]
            kind = r[4] if len(r) > 4 else None
            if not current or (label != "AG" and kind not in ("Maximum", "Minimum")):
                continue
            values = [round(v) if isinstance(v, (int, float)) else None for v in r[6:15]]
            if current == "AG" and label == "AG":
                bands["AG"] = values
                current = None
            elif current and kind in ("Maximum", "Minimum"):
                bands.setdefault(current, {})["max" if kind == "Maximum" else "min"] = values
                if kind == "Minimum":
                    current = None
        if set(bands) != set(BANDS.values()):
            raise SystemExit(f"Unexpected layout in sheet {sheet.title}")
        areas.append({"name": name, "rate": rate, "bands": bands})
    if len(areas) < 50:
        raise SystemExit("Too few locality areas found")
    first = [a for a in areas if a["name"] == "No locality"]
    rest = sorted((a for a in areas if a["name"] != "No locality"), key=lambda a: a["name"])
    return first + rest


def bls(series):
    out = {}
    for i in range(0, len(series), 25):
        body = json.dumps({"seriesid": series[i:i + 25], "latest": True}).encode()
        req = urllib.request.Request(BLS, data=body, headers={"Content-Type": "application/json"})
        res = json.load(urllib.request.urlopen(req))
        if res["status"] != "REQUEST_SUCCEEDED":
            raise SystemExit(res["message"])
        for s in res["Results"]["series"]:
            point = s["data"][0] if s["data"] else None
            if point and point["year"] != "2025":
                raise SystemExit(f"{s['seriesID']} is not May 2025 data")
            try:
                out[s["seriesID"]] = float(point["value"]) if point else None
            except ValueError:  # "-" means BLS withheld the estimate
                out[s["seriesID"]] = None
    return out


def oews():
    nat = {f"OEUN0000000000000532021{t}": k for t, k in NATIONAL.items()}
    st = {f"OEUS{f}00000000000532021{t}": (code, k) for f, code in STATES.items() for t, k in STATE.items()}
    values = bls(list(nat) + list(st))
    national = {k: values[s] for s, k in nat.items()}
    states = {}
    for s, (code, k) in st.items():
        states.setdefault(code, {})[k] = values[s]
    return national, states


areas = faa_bands()
national, states = oews()
OUT.write_text(json.dumps({
    "checked": "2026-10-25",
    "faa": {"url": FAA, "effective": "2026-01-11", "cap": 228000, "levels": LEVELS, "areas": areas},
    "bls": {"url": "https://www.bls.gov/oes/2025/may/oes532021.htm", "period": "May 2025",
            "national": national, "states": states},
}, indent=1) + "\n")
print(len(areas), "locality areas and", len(states), "states written to", OUT)
