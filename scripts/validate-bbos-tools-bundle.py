#!/usr/bin/env python3
"""Validate BBOS Tools Bundle V1 zip against frozen sources and required disclosures."""

from __future__ import annotations

import hashlib
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CALC = ROOT / "content" / "bbos" / "bbos-pricing-margin-calculator-v1.xlsx"
WORKBOOK = ROOT / "content" / "bbos" / "bbos-weekly-operating-rhythm-workbook-v1.xlsx"
OUT_ZIP = ROOT / "storage" / "bbos" / "BBOS-Tools-Bundle-v1.zip"

INNER_PREFIX = "BBOS-Tools-Bundle-v1"
EXPECTED = {
    f"{INNER_PREFIX}/BBOS-Pricing-Margin-Calculator-v1.xlsx",
    f"{INNER_PREFIX}/BBOS-Weekly-Operating-Rhythm-Workbook-v1.xlsx",
    f"{INNER_PREFIX}/README.txt",
}
MAX_BYTES = 52_428_800

REQUIRED_README_PHRASES = [
    "downloadable BBOS tools only",
    "Modules 1–4 are currently read online",
    "Module PDFs are not included yet",
    "Version 1.x",
    "not the complete offline BBOS package",
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def main() -> int:
    errors: list[str] = []

    if OUT_ZIP.name != "BBOS-Tools-Bundle-v1.zip":
        errors.append(f"outer filename incorrect: {OUT_ZIP.name}")
    if not OUT_ZIP.is_file():
        print(f"FAIL missing output: {OUT_ZIP}", file=sys.stderr)
        return 1

    size = OUT_ZIP.stat().st_size
    if size > MAX_BYTES:
        errors.append(f"output exceeds 50 MB ({size})")

    if not CALC.is_file() or not WORKBOOK.is_file():
        errors.append("frozen source XLSX missing")
        print("FAIL", *errors, sep="\n", file=sys.stderr)
        return 1

    calc_src = CALC.read_bytes()
    wb_src = WORKBOOK.read_bytes()

    with zipfile.ZipFile(OUT_ZIP, "r") as zf:
        names = set(zf.namelist())
        if names != EXPECTED:
            errors.append(f"entries mismatch: {sorted(names)} != {sorted(EXPECTED)}")
        if f"{INNER_PREFIX}/README.txt" in names:
            readme = zf.read(f"{INNER_PREFIX}/README.txt").decode("utf-8", errors="replace")
            for phrase in REQUIRED_README_PHRASES:
                if phrase not in readme:
                    errors.append(f"README missing phrase: {phrase!r}")
        if f"{INNER_PREFIX}/BBOS-Pricing-Margin-Calculator-v1.xlsx" in names:
            calc_zip = zf.read(f"{INNER_PREFIX}/BBOS-Pricing-Margin-Calculator-v1.xlsx")
            if calc_zip != calc_src:
                errors.append("calculator bytes do not match frozen source")
        if f"{INNER_PREFIX}/BBOS-Weekly-Operating-Rhythm-Workbook-v1.xlsx" in names:
            wb_zip = zf.read(f"{INNER_PREFIX}/BBOS-Weekly-Operating-Rhythm-Workbook-v1.xlsx")
            if wb_zip != wb_src:
                errors.append("workbook bytes do not match frozen source")

    if errors:
        print("FAIL")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("ALL CHECKS PASSED")
    print(f"output={OUT_ZIP}")
    print(f"size={size}")
    print(f"sha256={sha256_file(OUT_ZIP)}")
    print(f"calculator_source_sha256={sha256_bytes(calc_src)}")
    print(f"workbook_source_sha256={sha256_bytes(wb_src)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
