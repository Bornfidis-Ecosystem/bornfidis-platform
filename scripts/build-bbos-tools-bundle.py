#!/usr/bin/env python3
"""Build BBOS Tools Bundle V1 from frozen calculator + workbook XLSX.

Does not modify frozen sources. Does not upload. Never writes the reserved
Full Package filename.

Output: storage/bbos/BBOS-Tools-Bundle-v1.zip
"""

from __future__ import annotations

import hashlib
import io
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CALC = ROOT / "content" / "bbos" / "bbos-pricing-margin-calculator-v1.xlsx"
WORKBOOK = ROOT / "content" / "bbos" / "bbos-weekly-operating-rhythm-workbook-v1.xlsx"
OUT_DIR = ROOT / "storage" / "bbos"
OUT_ZIP = OUT_DIR / "BBOS-Tools-Bundle-v1.zip"
RESERVED_FULL_PACKAGE = OUT_DIR / "Bornfidis-Business-Operating-System-v1.zip"

INNER_PREFIX = "BBOS-Tools-Bundle-v1"
CALC_NAME = "BBOS-Pricing-Margin-Calculator-v1.xlsx"
WB_NAME = "BBOS-Weekly-Operating-Rhythm-Workbook-v1.xlsx"
README_NAME = "README.txt"

MAX_BYTES = 52_428_800  # 50 MB V1 bucket limit

README = """BBOS Tools Bundle — Version 1
Bornfidis Business Operating System (BBOS)

This archive contains the downloadable BBOS tools only:

- BBOS-Pricing-Margin-Calculator-v1.xlsx
- BBOS-Weekly-Operating-Rhythm-Workbook-v1.xlsx

Modules 1–4 are currently read online in the authenticated BBOS Library.
Module PDFs are not included yet.

Your BBOS purchase includes access to updates released within Version 1.x.
This is not the complete offline BBOS package. A complete offline package
with module PDFs will be released separately when ready.
"""


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    if OUT_ZIP.resolve() == RESERVED_FULL_PACKAGE.resolve():
        raise SystemExit("Refusing to write reserved Full Package filename")

    if not CALC.is_file():
        raise SystemExit(f"Missing frozen calculator: {CALC}")
    if not WORKBOOK.is_file():
        raise SystemExit(f"Missing frozen workbook: {WORKBOOK}")

    calc_sha = sha256_file(CALC)
    wb_sha = sha256_file(WORKBOOK)
    print(f"source calculator sha256={calc_sha} size={CALC.stat().st_size}")
    print(f"source workbook   sha256={wb_sha} size={WORKBOOK.stat().st_size}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"{INNER_PREFIX}/{README_NAME}", README.encode("utf-8"))
        zf.write(CALC, arcname=f"{INNER_PREFIX}/{CALC_NAME}")
        zf.write(WORKBOOK, arcname=f"{INNER_PREFIX}/{WB_NAME}")

    data = buf.getvalue()
    if len(data) > MAX_BYTES:
        raise SystemExit(f"Output exceeds 50 MB limit ({len(data)} bytes)")

    OUT_ZIP.write_bytes(data)
    out_sha = hashlib.sha256(data).hexdigest()
    print(f"wrote {OUT_ZIP}")
    print(f"output sha256={out_sha} size={len(data)}")
    print("entries:")
    print(f"  {INNER_PREFIX}/{README_NAME}")
    print(f"  {INNER_PREFIX}/{CALC_NAME}")
    print(f"  {INNER_PREFIX}/{WB_NAME}")


if __name__ == "__main__":
    main()
