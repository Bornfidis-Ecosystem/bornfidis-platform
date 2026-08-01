# BBOS Editorial & Design Style Guide (V1)

**Status:** Canonical, executive-approved
**Purpose:** Make every BBOS asset — Main Guide, workbooks, calculators, templates, checklists, and the AI Prompt Pack — read and look like **one professional product**, not ten separate documents.
**Applies to:** all 8 Guide modules and all 10 companion assets defined in the BBOS Product Constitution.
**Companion document:** `docs/BBOS_PRODUCT_CONSTITUTION.md`

### 0. Reconciliation note (why this palette/typography)
Three overlapping brand systems exist in the repository. BBOS canonicalizes as follows:
- **Base = the manual interior spec** (`ACADEMY_INTERIOR_LAYOUT_SPEC.md`): Playfair Display + Montserrat, charcoal/forest/gold/cream — because BBOS is a guide-and-workbook product.
- **Accent gold + forest aligned to the current platform brand rule** (Gold `#C9A84C`, Forest `#1A3C34`) so BBOS matches the live platform.
- **Dropped:** Jamaica-centric references, Patois, and faith/Scripture voice. BBOS V1 is secular and global.

---

## 1. Voice and Tone

**Voice (constant):** A calm, experienced operator who has run a small business and is showing you exactly how to install a system. Direct, plain, respectful, confident without hype.

**Four voice pillars**
1. **Systems over slogans** — "Here's how," never "You can do it!" Every claim connects to an action, tool, or checklist.
2. **Plain and global** — no regional slang, no idioms that don't translate, no cultural or faith framing. Written to be understood by a service-business owner anywhere.
3. **Honest** — no income promises, no guarantees, no fear-selling. Confidence comes from specificity, not superlatives.
4. **Respectful of the reader's time** — the reader is busy and still running a business. Get to the point; make the next action obvious.

**Tone by context**
| Context | Tone | Example |
|---|---|---|
| Guide instruction | Clear, directive | "Set one target margin before you quote the next job." |
| Exercises | Encouraging, specific | "List every live opportunity. Don't filter — just capture." |
| Money/finance sections | Careful, plain, non-advisory | "This shows your runway. It is not tax or accounting advice." |
| Workbook prompts | Short, action-first | "This week's top 3:" |
| Callouts (Tip/Warning) | Focused, brief | "Warning: never quote below your margin guardrail without a conscious exception." |
| Prompt Pack | Utilitarian, exact | "Paste your cost inputs below. Do not include client names." |

**Always / Never**
- **Always:** active voice; second person ("you"); concrete numbers/examples; short sentences.
- **Never:** buzzwords ("synergy," "leverage," "unlock potential"); ALL CAPS (except approved acronyms); exclamation stacks; guarantees; region/faith-specific references; unexplained jargon.

---

## 2. Reading Level

- **Target:** Grade 7–9 (Flesch Reading Ease ~60–70). Accessible to non-native English readers globally.
- **Sentence length:** 15–20 words average; hard cap ~30.
- **Paragraphs:** 2–4 sentences; one idea each.
- **Jargon rule:** define any business term on first use, then use it consistently (see §4). Prefer the plain word ("money left" alongside "runway" on first use).
- **Numbers:** use digits for anything actionable ("3 SOPs," "13 weeks"). Spell out only zero–nine in prose where not a metric.
- **Check:** every module and asset passes a readability check before sign-off (§14 / QA).

---

## 3. Formatting Conventions

**Page geometry (print/PDF)** — inherited from the interior spec:
| Setting | 8.5 × 11 in | 6 × 9 in |
|---|---|---|
| Top / Bottom margin | 0.75 in | 0.75 in |
| Inside (binding) | 1 in | 0.875 in |
| Outside | 0.75 in | 0.625 in |
| Max line length | ~75 characters | ~60 characters |

**Type scale (canonical across all BBOS documents)**
| Style | Font | Weight | 8.5×11 | Line height | Color token |
|---|---|---|---|---|---|
| Manual Title | Playfair Display | Bold | 28 pt | 1.2 | Ink |
| Module/Chapter number | Montserrat | SemiBold | 12 pt | 1.3 | Gold |
| Chapter Title (H1) | Playfair Display | Bold | 22 pt | 1.25 | Ink |
| Section (H2) | Playfair Display | SemiBold | 16 pt | 1.3 | Ink |
| Subsection (H3) | Montserrat | SemiBold | 12 pt | 1.35 | Ink |
| Body | Montserrat | Regular | 11 pt | 1.5 | Ink |
| Caption/Note | Montserrat | Regular | 9 pt | 1.4 | Ink 80% |
| Callout label | Montserrat | SemiBold | 10 pt | 1.3 | Gold |

- **Spacing:** space after H1 = 24 pt, H2 = 12 pt, H3 = 8 pt; 6 pt between paragraphs.
- **Lists:** bullets for unordered, numbers for sequences/steps; markers in Ink or Gold; never mix marker styles within one list.
- **Emphasis:** **bold** for key terms/actions; *italic* for first-use definitions and light emphasis; never underline (reserved for links). No color-only emphasis.
- **Action & milestone standard:**
  - Every chapter must lead to a practical **action, decision, or reflection**.
  - **Major framework chapters** must produce a **visible output**.
  - Every **module** ends with **one** formal **Completion Milestone** and a completion checklist.
  - A formal milestone line is **not** required after every chapter (no per-chapter micro-milestones).
  - **Orientation or synthesis chapters** may use a lighter closing action rather than a full framework exercise.

---

## 4. Terminology (Canonical Glossary)

Use these exact terms everywhere; retire the alternatives.

| Use (canonical) | Do NOT use | Notes |
|---|---|---|
| **BBOS** | "the system", "the program", "the course" | Product short name, all caps |
| **Bornfidis Business Operating System** | "Bornfidis BOS", "B-BOS" | Full name on covers/first use |
| **Main Guide** | "the book", "manual" (in-copy) | The 8-module guide |
| **Module** (M1–M8) | "chapter" for top level, "unit" | Chapters live *inside* modules |
| **Companion asset** | "resource", "download", "freebie" | Workbooks/calculators/templates |
| **Weekly Operating Rhythm** | "weekly routine", "schedule" | Also the workbook name |
| **The Weekly Close** | "weekly wrap-up", "review" | Capitalized ritual term |
| **Pipeline** with stages **Lead → Qualified → Proposed → Won / Lost** | "funnel", "leads list", custom stage names | Stage names fixed |
| **Follow-Up Cadence** | "chasing", "nurture" | |
| **Offer One-Pager** | "sales sheet", "flyer" | |
| **Cost Stack → Target Margin → Price** | "markup", "cost-plus" (alone) | Pricing method name |
| **Target margin** / **margin guardrail** | "profit margin goal" (inconsistently) | |
| **Runway** | "cash cushion", "money buffer" | Define on first use: "how long your cash lasts" |
| **Core Number Set** (revenue, margin, cash, runway) | "KPIs", "metrics dashboard" | |
| **SOP** (Standard Operating Procedure) | "process doc", "how-to" | Spell out on first use |
| **The 90-Day Implementation Plan** / **the 13-week journey** | "the challenge", "bootcamp" | |
| **Principles:** Integrity, Excellence, Profitability, Sustainability, Service, Legacy | reordering or renaming | Fixed order and names |
| **Owner** / **service-business owner** | "entrepreneur", "hustler", "boss" | The reader |

**Capitalization rule:** BBOS proper terms (Module names, Weekly Close, Offer One-Pager, principle names) are Title Case; generic nouns (pipeline, margin, cash) are lowercase unless part of a proper term.

---

## 5. Naming Standards

**Asset display names** (on covers and in-copy):
`BBOS [Asset Name] — [Short Descriptor]`
- e.g., *BBOS Weekly Operating Rhythm Workbook — Plan, Run, Close Your Week*
- e.g., *BBOS Pricing & Margin Calculator*

**File names** (deliverables): lowercase, hyphenated, versioned, no spaces:
`bbos-[asset]-[type]-v1.[ext]`
- `bbos-main-guide-v1.pdf`
- `bbos-weekly-operating-rhythm-workbook-v1.xlsx`
- `bbos-pricing-margin-calculator-v1.xlsx`
- `bbos-sop-template-v1.docx`
- `bbos-ai-prompt-pack-v1.pdf`

**Content source files (drafts):** `content/bbos/module-0N-[slug].md` (e.g., `content/bbos/module-01-business-foundation.md`).

**Versioning:** `vMAJOR.MINOR` (V1, V1.1). Cover shows "Version 1"; footer shows exact version + release month. One version number governs the whole package (all assets ship the same major version).

**Module/week references:** "Module 3 (Pricing With Dignity)", "Week 6". Never abbreviate module names in body copy on first mention.

**Cross-references:** "See the **Pricing & Margin Calculator** (Module 3)." Always name the asset + module, never "see the attached file."

---

## 6. Diagram Style

- **Purpose-first:** diagrams explain a process or relationship, never decoration.
- **Types allowed:** linear flow (steps), cycle (the BBOS Week), simple 2×2 or ladder (Offer Ladder), stacked bar concept (Cost Stack), stage bar (pipeline). No 3D, no clip-art, no gradients.
- **Construction:** flat, line-based; stroke weight 2 pt; corner radius 4 pt; boxes with Ink outline on white/paper; single accent (Gold) to highlight the key node only.
- **Color:** max two colors per diagram (Ink + one accent). Forest reserved for section dividers, not diagram fills.
- **Labels:** Montserrat 9–10 pt; every node labeled in words (never rely on shape/color alone).
- **Captions:** every diagram has a caption ("Figure X — …") and a one-line takeaway.
- **Consistency:** the same concept uses the same diagram everywhere (e.g., the BBOS Week cycle is drawn identically in the Guide and the Rhythm workbook).

---

## 7. Icon Usage

- **Set:** one consistent line-icon family across all assets; 2 pt stroke; 24 px grid; rounded joins; single-weight.
- **Palette:** Ink by default; Gold only to signal the primary/active item.
- **Where used:** callout labels (Tip, Warning, Example), module markers, asset covers, checklist items. Not in body paragraphs.
- **One-meaning rule:** each icon maps to exactly one concept across the whole product (e.g., a "check" only ever means completion/milestone).
- **Never:** emoji in deliverables, multicolor icons, filled/duotone mixing, decorative icon walls.
- **Accessibility:** every icon that conveys meaning has adjacent text; icons are never the sole carrier of information (§14).

**Reserved icon meanings (canonical)**
| Icon concept | Meaning |
|---|---|
| Check | Completion / milestone |
| Compass | "Start Here" / orientation |
| Calendar | Weekly rhythm / scheduling |
| Coins / graph | Money & metrics |
| Document / gear | SOP / systems |
| Handshake | Retention / referrals |
| Warning triangle | Caution / guardrail |

---

## 8. Color Palette (Canonical BBOS Tokens)

| Token | Name | Hex | Primary use |
|---|---|---|---|
| **Ink** | Charcoal | `#1C1C1C` | Body text, headings |
| **Forest** | Deep Forest Green | `#1A3C34` | Section dividers, primary brand accent, cover |
| **Gold** | Signal Gold | `#C9A84C` | Chapter numbers, key terms, callout labels, highlight (sparingly) |
| **Paper** | Warm Cream | `#F5F1E6` | Callout / sidebar backgrounds (print) |
| **Bone** | Screen background | `#FDF8F8` | On-screen document background |
| **Line** | Light Gray | `#E5E3DC` | Rules, table borders, dividers |
| **Muted** | Medium Gray | `#6B7280` | Captions, secondary labels |
| **White** | White | `#FFFFFF` | Primary page background (print) |

**Rules of use**
- Body text is **Ink on white or Paper** only.
- **Gold is an accent, never a background for text** and never used for large fills (fails contrast).
- **Forest** for dividers, cover, and small accent blocks — not for body text backgrounds behind long copy.
- **Max two accent colors** on any spread (Forest + Gold). No rainbow tables.
- **Semantic color** (calculators): green = healthy, amber = caution, red = risk — but always paired with a text label or icon (never color alone).

**Approved combinations:** White + Ink + Gold accent · Paper + Ink + Forest accent · Forest cover + White text + Gold accent.
**Avoid:** Gold text on white, Ink on Forest for long copy, more than two accents together.

---

## 9. Callout Boxes

Five callout types only. One shared visual pattern: **Paper background (`#F5F1E6`), Ink text, Gold SemiBold label, 2–3 pt Gold left border.** Max **two callouts per page** (keeps layout calm).

| Callout | Label | When to use | Icon |
|---|---|---|---|
| **Tip** | TIP | A shortcut or better way to do the step | lightbulb |
| **Example** | EXAMPLE | A concrete, generic worked example (Maya's Property Services) | document |
| **Warning** | WARNING | A guardrail or common mistake to avoid | warning triangle |
| **Do This Now** | DO THIS NOW | The immediate action for this section | check |
| **Note / Disclaimer** | NOTE | Scope limits; money/legal non-advice statements | info |

- **Money/legal disclaimer** uses the **Note** style and appears wherever finance, tax, or legal-adjacent topics arise.
- Callouts are **short** (≤ 3 lines). Anything longer becomes body copy.
- Callout label is text + icon; never icon alone.

---

## 10. Worksheet / Workbook Layout

- **Header block (every worksheet):** BBOS wordmark (small), asset name, module reference, and a fillable field (date / week #). Consistent across all worksheets.
- **Instruction line:** one short italic line under the title telling the owner what to do.
- **Fields:** clearly bordered fill areas (Line color), labeled left or above; generous whitespace so it's usable by hand or on screen.
- **Fillable pattern:** label (Montserrat SemiBold 10 pt) + input area; checkboxes are square, ≥ 5 mm, left-aligned.
- **Repeatability:** provide a **reusable master** plus a stated way to duplicate for 13 weeks.
- **Footer:** asset name + version + page number; every worksheet references its Guide module ("Supports Module 4").
- **One worksheet = one job.** No worksheet mixes two unrelated tasks.
- **Print + screen:** must be legible printed in grayscale (no meaning lost) and fillable as a PDF/spreadsheet.

---

## 11. Spreadsheet Conventions (Calculators)

Plain spreadsheets — no macros, offline-usable.

**Structure**
- **Tab order (fixed):** `Start Here` → `Inputs` → `Results` → `Example` → `Notes/Disclaimer`.
- **Input vs output separation:** inputs and outputs never mixed on the same block.

**Cell styling (canonical)**
| Cell type | Style |
|---|---|
| **Input cell** | White fill, Gold 1 pt border, Ink text — the only cells the user edits |
| **Calculated cell** | Paper fill, locked, Ink text — do not edit |
| **Label** | Montserrat SemiBold, left-aligned |
| **Section header** | Forest fill, White text |
| **Result headline** | Larger, bold, with unit |

- **Protection:** lock all non-input cells; only input cells unlocked. No hidden logic the owner can't see.
- **Formatting:** currency and % formats applied; currency symbol parameterized in one place (global audience). Thousands separators on.
- **Named ranges** for key inputs/outputs (readability + accessibility).
- **Status coloring:** healthy/caution/risk uses green/amber/red **plus** a text word ("Healthy", "Watch", "Low") — never color alone.
- **Worked Example tab:** pre-filled with Maya's Property Services (fictional), matching numbers used in the Guide.
- **Disclaimer tab:** "For planning only. Not tax, accounting, or financial advice." No client data; no real Bornfidis figures.

---

## 12. Prompt Formatting (BBOS AI Prompt Pack)

Every prompt uses one consistent template so the pack reads as a tool, not a list of ideas.

**Canonical prompt block**
```
Prompt: [Short action title]
Use when: [the BBOS task/module this supports]
Copy-paste prompt:
"[Role + task, with [BRACKETED] fields the owner fills in]"
Before you paste: [privacy + what to replace]
Good output looks like: [1-line success criterion]
```

**Rules**
- Each prompt names the **module/asset** it supports.
- `[BRACKETED_PLACEHOLDERS]` mark everything the owner must replace.
- **Mandatory privacy line** on every prompt: *"Do not paste client names, private financial data, or credentials."*
- Prompts are **tool-agnostic** (work in any general AI assistant); no product names, logins, or subscriptions implied (V1 excludes AI subscription).
- Formatting: prompt text in a monospace/quoted block so it's obviously copyable; surrounding guidance in normal body style.

---

## 13. Examples

- **One canonical running example:** **Maya's Property Services** — defined in `docs/BBOS_PRODUCT_CONSTITUTION.md` §11. Do not redefine it; reference that section.
- **Generic and global by default** — no real client names, no Bornfidis/VelocityMaid specifics in customer-facing copy.
- **Anonymized when derived from real material** — real pricing/policy may inform examples only after being generalized and stripped of identifiers.
- **Consistency:** an example introduced in the Guide reuses the **same name and numbers** in the matching calculator's Example tab.
- **Labeling:** examples are clearly marked (Example callout or "Example:" lead-in) and never presented as guaranteed results.
- **No income outcomes:** examples show *process and decisions*, not "she made $X."

---

## 14. Accessibility Standards

**Contrast (WCAG 2.1 AA minimum; AAA where feasible)**
- Ink on White/Paper: AAA. White on Forest: verify ≥ 7:1. Gold is **accent only** — never body text on white (fails AA).
- All status/semantic colors paired with text or icon (color is never the sole signal).

**Typography & layout**
- Minimum body: 11 pt print / 16 px screen. Line height ≥ 1.5. Max line length ~75 characters.
- Left-aligned body text (no justified blocks); adequate spacing; no dense walls.

**Structure & reading order**
- Real heading hierarchy (H1→H2→H3) in every document; logical reading/tab order in PDFs and spreadsheets.
- Tables have header rows; spreadsheets use named ranges and labeled cells.

**Non-text content**
- Every meaningful diagram/icon/image has **alt text** and, for diagrams, a text takeaway caption so the point survives without the visual.
- Decorative elements marked decorative (empty alt).

**Interactive & print**
- Fillable PDF fields labeled; checkboxes ≥ 5 mm; touch targets ≥ 44 px on any screen element.
- **Grayscale test:** every asset must remain fully usable printed in black & white (no information lost to color).

**Language**
- Plain language (Grade 7–9), expanded acronyms on first use, defined terms — supports non-native English and screen-reader users globally.

---

## 15. Governance
- **One version governs the package:** all BBOS assets ship at the same major version and follow this guide.
- **Change control:** any deviation (new callout type, new color, new term) must update this guide first, then propagate — preventing drift back into "ten separate documents."
- **QA hook:** this guide is the reference for the editorial QA checklist; nothing ships V1 until it passes both this guide and the Product Constitution.

---

**Version:** 1.0 · Canonical BBOS V1 editorial and design standard.
