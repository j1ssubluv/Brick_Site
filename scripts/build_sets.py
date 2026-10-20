"""Build sets.json (public) from data/inventory.csv (private).

Only the columns in PUBLIC_COLUMNS are ever copied. Any other column (cost, purchase
date, notes...) is ignored and listed in the output so you can see it stayed private.

    python scripts/build_sets.py            # data/inventory.csv -> sets.json
    python scripts/build_sets.py --csv other.csv --out preview.json

Blank cells become null (shown as a bracketed placeholder on the site). Nothing is
written if any row has an error, or if the CSV has no rows.
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PUBLIC_COLUMNS = [
    "type", "setNumber", "figureNumber", "series", "name", "theme", "year", "pieces",
    "condition", "conditionNotes", "price", "photos", "status", "retired",
]
CONDITIONS = {"sealed", "used"}
STATUSES = {"available", "pending", "sold"}
TRUE = {"true", "yes", "y", "1"}
FALSE = {"false", "no", "n", "0"}


def whole_number(value, label, lo=0, hi=10**7):
    cleaned = re.sub(r"[$,\s]", "", value)
    if not re.fullmatch(r"\d+", cleaned):
        raise ValueError(f"{label} must be a whole number, got {value!r}")
    n = int(cleaned)
    if not lo <= n <= hi:
        raise ValueError(f"{label} {n} is out of range")
    return n


def build_entry(row):
    """Turn one CSV row (dict keyed by public column) into a sets.json entry."""
    get = lambda k: (row.get(k) or "").strip()
    kind = get("type").lower() or "set"
    if kind not in {"set", "minifigure"}:
        raise ValueError(f"type must be blank, 'set' or 'minifigure', got {kind!r}")
    figure = kind == "minifigure"

    if not get("name"):
        raise ValueError("name is required")
    if not figure and not get("setNumber"):
        raise ValueError("setNumber is required for a set")

    condition = get("condition").lower()
    if condition not in CONDITIONS:
        raise ValueError(f"condition must be sealed or used, got {condition!r}")
    status = get("status").lower() or "available"
    if status not in STATUSES:
        raise ValueError(f"status must be available, pending or sold, got {status!r}")

    retired_raw = get("retired").lower()
    if retired_raw in TRUE or not retired_raw:
        retired = True  # retired is the default
    elif retired_raw in FALSE:
        retired = False
    else:
        raise ValueError(f"retired must be yes or no (or blank), got {retired_raw!r}")

    entry = {}
    if figure:
        entry["type"] = "minifigure"
        entry["setNumber"] = ""
        entry["figureNumber"] = get("figureNumber")
        entry["series"] = get("series")
    else:
        entry["setNumber"] = get("setNumber")
    entry["name"] = get("name")
    entry["theme"] = get("theme")
    entry["year"] = whole_number(get("year"), "year", 1932, 2100) if get("year") else None
    entry["pieces"] = None if figure or not get("pieces") else whole_number(get("pieces"), "pieces")
    entry["condition"] = condition
    entry["conditionNotes"] = get("conditionNotes")
    entry["price"] = whole_number(get("price"), "price") if get("price") else None
    entry["photos"] = [p.strip() for p in re.split(r"[;|]", get("photos")) if p.strip()]
    entry["status"] = status
    entry["retired"] = retired
    return entry


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--csv", type=Path, default=ROOT / "data" / "inventory.csv")
    ap.add_argument("--out", type=Path, default=ROOT / "sets.json")
    args = ap.parse_args()

    if not args.csv.exists():
        sys.exit(f"CSV not found: {args.csv}")

    # utf-8-sig: Excel's "CSV UTF-8" adds a BOM that would otherwise corrupt the first header
    with args.csv.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        headers = {h.strip().lower(): h for h in (reader.fieldnames or [])}
        public = {c: headers[c.lower()] for c in PUBLIC_COLUMNS if c.lower() in headers}
        ignored = [h for h in (reader.fieldnames or []) if h not in public.values()]
        rows = list(reader)

    entries, errors, warnings = [], [], []
    for line, raw in enumerate(rows, start=2):  # line 1 is the header
        row = {c: raw.get(src) for c, src in public.items()}
        if not any((v or "").strip() for v in row.values()):
            continue  # blank row
        try:
            entry = build_entry(row)
        except ValueError as e:
            errors.append(f"row {line}: {e}")
            continue
        for photo in entry["photos"]:
            if not (ROOT / photo).exists():
                warnings.append(f"row {line}: photo not found: {photo}")
        entries.append(entry)

    if ignored:
        print("Left private (not copied): " + ", ".join(ignored))
    for w in warnings:
        print("warning: " + w)
    if errors:
        print("\n".join(errors))
        sys.exit(f"{len(errors)} error(s); {args.out.name} was not written.")
    if not entries:
        sys.exit(f"No rows in {args.csv.name}; {args.out.name} was not written.")

    args.out.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    print(f"Wrote {len(entries)} entries to {args.out}")


if __name__ == "__main__":
    main()
