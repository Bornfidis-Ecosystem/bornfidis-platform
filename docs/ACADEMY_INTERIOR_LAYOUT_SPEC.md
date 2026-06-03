# Bornfidis Academy — Interior Page Layout Spec

Use this for **manual interior pages**: type hierarchy, margins, and styles so the inside of each Field Guide matches the cover system and brand.

---

## Purpose

- **Audience:** Same as cover — entrepreneurs, farmers, chefs, community builders.
- **Feel:** Calm, readable, premium, trustworthy. No clutter.
- **Output:** 8.5×11 (digital/print) and 6×9 (print); Word template provided for drafting, then design in Figma/InDesign if needed.

---

## Page setup

| Setting | 8.5 × 11 in | 6 × 9 in |
|--------|-------------|----------|
| Top margin | 0.75 in | 0.75 in |
| Bottom margin | 0.75 in | 0.75 in |
| Inside margin (binding) | 1 in | 0.875 in |
| Outside margin | 0.75 in | 0.625 in |
| Live area | ~6.5 × 9.5 in | ~4.25 × 7.5 in |

Use the same values in Word (Layout → Margins) and in any design tool.

---

## Color (interior)

| Name | Hex | Use |
|------|-----|-----|
| **Charcoal** | `#1C1C1C` | Body text, headings |
| **Forest** | `#0F3D2E` | Section dividers, optional accent blocks |
| **Gold** | `#C9A227` | Chapter numbers, key terms, rules |
| **Cream** | `#F5F1E6` | Background for callouts or sidebar (optional) |

Body text is Charcoal on white (or cream) for readability. Reserve Forest for the cover and light accents inside.

---

## Typography

- **Headings:** Playfair Display. Editorial, authoritative.
- **Body & metadata:** Montserrat. Clean, legible.

Same as cover so the manual feels like one system.

---

## Type hierarchy (Word / design tool)

Define these styles so you can apply them consistently.

| Style | Font | Weight | Size (8.5×11) | Size (6×9) | Line height | Color | Use |
|-------|------|--------|----------------|------------|-------------|------|-----|
| **Title (manual)** | Playfair Display | Bold | 28 pt | 22 pt | 1.2 | Charcoal | Title page only |
| **Subtitle (manual)** | Montserrat | Medium | 14 pt | 12 pt | 1.35 | Charcoal | Title page only |
| **Chapter number** | Montserrat | SemiBold | 12 pt | 10 pt | 1.3 | Gold | E.g. "Chapter 1" |
| **Chapter title (H1)** | Playfair Display | Bold | 22 pt | 18 pt | 1.25 | Charcoal | Start of chapter |
| **Section (H2)** | Playfair Display | SemiBold | 16 pt | 14 pt | 1.3 | Charcoal | Major sections |
| **Subsection (H3)** | Montserrat | SemiBold | 12 pt | 11 pt | 1.35 | Charcoal | Subsections |
| **Body** | Montserrat | Regular | 11 pt | 10 pt | 1.5 | Charcoal | Paragraphs |
| **Caption / note** | Montserrat | Regular | 9 pt | 9 pt | 1.4 | Charcoal (80% opacity) | Captions, footnotes |
| **Callout label** | Montserrat | SemiBold | 10 pt | 9 pt | 1.3 | Gold | e.g. "Tip", "Example" |

- **Space after headings:** H1 → 24 pt (8.5×11) / 18 pt (6×9). H2 → 12 pt / 10 pt. H3 → 8 pt / 6 pt.
- **Space between paragraphs:** 6 pt (or one line) so the page doesn’t look dense.

---

## Structural elements

- **Title page:** Manual title (Playfair Bold), subtitle (Montserrat), optional "Bornfidis Academy" and series label. Rest empty.
- **Contents (TOC):** Section titles + page numbers. Montserrat, 11 pt; leaders optional.
- **Chapter opener:** Chapter number (Gold) on one line, then chapter title (H1). Optional thin Gold rule.
- **Body:** Body style only; use H2/H3 for structure. Short paragraphs preferred.
- **Lists:** Bullet or number in Gold or Charcoal; same body size and line height.
- **Callouts:** e.g. Tip, Example, Note. Light Cream background (#F5F1E6), Charcoal text, Gold label; left border in Gold (2–3 pt). Keep to one or two per page so layout stays calm.

---

## Word template (how to use)

1. Open **`docs/templates/Academy_Manual_Interior_Template.html`** in **Microsoft Word** (File → Open → choose the file).
2. Word will interpret the HTML and keep headings, paragraphs, and styles. Save immediately as **.docx** (Save As → Word Document).
3. Set margins via **Layout → Margins → Custom**: Top/Bottom 0.75", Inside 1", Outside 0.75".
4. Replace all placeholder text with your manual content. The template uses "The Regenerative Farm System" as the example; change the title page and series label for other manuals.
5. Delete the gray instruction line at the top once you’ve applied margins and saved as .docx.
6. For 6×9, change page size to 6×9 in (Layout → Size) and use the 6×9 margins from the table above; reduce font sizes per the 6×9 column if needed.

---

## Quality check

- [ ] Margins match spec for chosen trim size.
- [ ] All headings use Playfair Display; body and metadata use Montserrat.
- [ ] Body text is 11 pt (8.5×11) or 10 pt (6×9), line height 1.5.
- [ ] Gold used sparingly (chapter numbers, callout labels, rules).
- [ ] No more than two callouts per page; layout stays uncluttered.
- [ ] Title page and chapter openers feel consistent with the cover system.

---

## What this spec does *not* cover

- **Cover:** See `ACADEMY_COVER_SYSTEM_FIGMA_SPEC.md`.
- **Actual manual content:** This is a layout and style system only; writing is separate.
- **Final design round:** For print or high-end PDF you may move from Word to Figma/InDesign and apply these same values there.
