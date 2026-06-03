# Bornfidis Academy Cover System — Figma-Ready Spec

Use this to build a master cover component in Figma. All values match the unified cover system.

---

## Document setup

- **Frame name:** `Cover_Master_8.5x11` (duplicate for 6×9 with scaled values)
- **Dimensions:** 2550 × 3300 px (8.5 × 11 in at 300 dpi) or 1800 × 2700 px (6 × 9 in at 300 dpi)
- **Bleed (print):** 37.5 px (0.125 in) on all sides if exporting for print

---

## Color styles (create as Figma color styles)

| Name | Hex | Usage |
|------|-----|--------|
| `Brand/Forest` | `#0F3D2E` | Background |
| `Brand/Gold` | `#C9A227` | Title, rules, accent |
| `Brand/Cream` | `#F5F1E6` | Subtitle, metadata, line art |
| `Brand/Charcoal` | `#1C1C1C` | (Reserve for interior; not on cover) |

---

## Text styles (create as Figma text styles)

### 8.5 × 11

| Style name | Font | Weight | Size | Line height | Letter spacing | Color |
|------------|------|--------|------|-------------|----------------|--------|
| `Cover/BrandBar` | Montserrat | SemiBold (600) | 14 px | Auto | 120% | Cream |
| `Cover/Title` | Playfair Display | Bold | 44 px | 1.1 | 0% | Gold |
| `Cover/Subtitle` | Montserrat | Medium (500) | 16 px | 1.35 | 0% | Cream |
| `Cover/SeriesLabel` | Montserrat | Medium (500) | 12 px | 1.3 | 80% | Cream |

### 6 × 9 (scale ~75–80%)

| Style name | Font | Weight | Size | Line height | Letter spacing | Color |
|------------|------|--------|------|-------------|----------------|--------|
| `Cover/BrandBar_Small` | Montserrat | SemiBold (600) | 11 px | Auto | 120% | Cream |
| `Cover/Title_Small` | Playfair Display | Bold | 32 px | 1.1 | 0% | Gold |
| `Cover/Subtitle_Small` | Montserrat | Medium (500) | 12 px | 1.35 | 0% | Cream |
| `Cover/SeriesLabel_Small` | Montserrat | Medium (500) | 10 px | 1.3 | 80% | Cream |

---

## Spacing (layout tokens)

Use these as padding/margin values. Units in px at 300 dpi (8.5×11 frame).

| Token | 8.5×11 (px) | 6×9 (px) |
|-------|-------------|----------|
| Margin outer (top) | 270 | 210 |
| Margin outer (bottom) | 240 | 210 |
| Margin outer (sides) | 210 | 180 |
| Gap above title | 150 | 110 |
| Gap title to subtitle | 90 | 70 |
| Gap subtitle to motif band | 120 | 90 |
| Motif band height | ~660 | ~540 |
| Gap motif to footer | 80 | 60 |
| Footer height | ~120 | ~100 |
| Clear space around logo | 0.5× logo height | same |

---

## Component structure (layer names and hierarchy)

```
Cover_Master_8.5x11 (Frame)
├── BG (Rectangle, fill #0F3D2E, lock)
├── SafeArea (Frame, no fill, reference only)
│   └── [margins as above]
├── Section_BrandBar (Frame)
│   ├── Text_BrandBar (Text: "BORNFIDIS ACADEMY", style Cover/BrandBar)
│   └── Rule_Accent (Line 0.75px, fill Gold, width ~40% of safe width)
├── Section_Title (Frame)
│   ├── Text_Title (Text, style Cover/Title) ← EDITABLE
│   └── Text_Subtitle (Text, style Cover/Subtitle, optional) ← EDITABLE
├── Section_Motif (Frame, fixed height)
│   └── Motif_Illustration (Vector/Component) ← SWAP PER MANUAL
├── Section_Footer (Frame)
│   ├── Text_SeriesLabel (Text: "Bornfidis Field Guide No. 01", style Cover/SeriesLabel) ← EDITABLE number
│   └── Logo_Crest (Image or Vector, Bornfidis mark)
```

Make `Section_Title`, `Text_Title`, `Text_Subtitle`, `Motif_Illustration`, and `Text_SeriesLabel` overridable in the main component. Lock `BG`, `Section_BrandBar`, and `Section_Footer` layout (or make only the series number overridable).

---

## Variants (optional)

- **With subtitle** / **No subtitle** (show or hide subtitle layer, adjust motif position if needed)
- **Series number** 01, 02, 03, 04 (text override only)

---

## Export settings

- **PDF (print):** Full bleed, CMYK if available, 300 dpi
- **PNG (web):** 2× resolution, no bleed, transparent or Forest background
- **Cover only:** Export the Cover_Master frame; interior is a separate flow

---

## Quick checklist when adding a new manual

1. Duplicate Cover_Master.
2. Override: Title, Subtitle (or leave blank), Motif art, Series number.
3. Ensure no text overlaps motif or logo.
4. Export PDF + PNG.
