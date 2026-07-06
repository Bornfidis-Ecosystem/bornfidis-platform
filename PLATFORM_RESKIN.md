# Platform reskin — Bornfidis compass-and-anchor identity

Handoff from **Bornfidis Design System** → **bornfidis_requirements** (Next.js platform).

## One-line swap

**Forest green / burnished gold / Libre Caslon** → **Navy `#002747` / marigold gold `#ffbc00` / Poppins (display) + Montserrat (UI)**.

## Non-negotiable rules

1. **Gold is accent-only** — hairlines, eyebrows, focus rings, footer rule. Primary CTAs are **navy fill + ivory text**, not gold pills.
2. **0 radius** — no `rounded-*` on public marketing surfaces; prefer `rounded-none`.
3. **No shadows** — tonal depth via navy bands and gold rules, not `shadow-*`.
4. **Tabler icons** (`ti ti-*`) in chrome where icons are needed.
5. **WordPress stays separate** — booking CTAs link out to `platform.bornfidis.com/book`.

## Brand owner follow-up

Request **SVG/vector** compass-and-anchor marks. Current kit is **PNG-only** (`public/brand/icons/bf-mark-*.png`), which limits crisp scaling above ~48px and favicon sharpness.

---

## `:root` tokens (`app/globals.css`)

```css
--color-navy: #002747;
--color-gold: #ffbc00;
--color-bone: #faf6f0;
--color-slate: #1a1a1a;
--color-green: var(--color-navy);   /* legacy bridge */
--color-forest: var(--color-navy);
--color-accent: var(--color-gold);
--color-accent-hover: #e6a800;
```

Legacy aliases (`--bornfidis-green`, `--wp-forest-cta`, `--navy`, etc.) should resolve to navy, not `#1A3C34`.

## Tailwind extension (`tailwind.config.ts`)

```ts
fontFamily: {
  display: ['var(--font-serif)', 'Poppins', 'ui-sans-serif', 'sans-serif'],
  sans: ['var(--font-sans)', 'Montserrat', 'ui-sans-serif', 'sans-serif'],
},
borderRadius: {
  none: '0',
  sm: '0',
  DEFAULT: '0',
  md: '0',
  lg: '0',
  xl: '0',
  '2xl': '0',
  full: '9999px', // avatars only if needed
},
boxShadow: {
  none: 'none',
},
colors: {
  gold: 'var(--color-gold)',
  bone: 'var(--color-bone)',
  navy: 'var(--color-navy)',
  forest: 'var(--color-navy)',
  // …
},
```

## Fonts (`app/layout.tsx`)

Replace `Libre_Caslon_Text` with **Poppins** on `--font-serif` (Tailwind `font-display`). Keep **Montserrat** on `--font-sans`. Admin Culinary OS keeps **Inter** on `--font-culinary-ui`.

---

## Logos in `/public`

| Copy from DS `assets/` | Platform path |
|------------------------|---------------|
| `bf-mark-navy.png` | `/brand/icons/bf-mark-navy.png` |
| `bf-mark-gold.png` | `/brand/icons/bf-mark-gold.png` |
| `bf-logo-horizontal-navy.png` | `/brand/logos/bf-logo-horizontal-navy.png` |
| `bf-logo-horizontal-gold.png` | `/brand/logos/bf-logo-horizontal-gold.png` |
| `bf-logo-horizontal-reversed.png` | `/brand/logos/bf-logo-horizontal-reversed.png` |

Wire via `lib/brand-assets.ts`. Deprecate mortar `bornfidis_logo_icon_*.png`.

---

## Component checklist

| Area | Change |
|------|--------|
| **PublicNav** | Ivory bar; `bf-mark-navy` + Poppins “Bornfidis Provisions”; links navy/muted; **Book Now** = navy CTA (not gold pill) |
| **PublicFooter** | Navy `#002747`; gold top rule; `bf-mark-gold` + gold wordmark; Montserrat column labels |
| **PrimaryButton / `.btn-primary`** | Navy fill, ivory text, `rounded-none`, `shadow-none` |
| **Hero (`home-editorial.css`)** | Navy hero band; Poppins headlines (**no Caslon italic**); gold eyebrow/rule only; primary CTA navy |
| **Gold hairline lists** | Keep `border-[#ffbc00]/20` (or `var(--color-gold)`) dividers on dark panels |
| **Cards** | Flat borders, no shadow; hover = border/background shift only |
| **book-culinary-classes.ts** | `BOOK_NAVY`, `BOOK_GOLD` hex swap |
| **Favicon** | `bf-mark-gold.png` until SVG available |

---

## Final verification

- [ ] `grep -r "1A3C34\\|C9A84C\\|Libre Caslon" app components --include='*.tsx'` → no hits on public paths
- [ ] Home, `/book`, `/private-dining`, `/provisions` render navy/gold/Poppins
- [ ] Nav shows compass mark (not mortar)
- [ ] `npm run build` passes
- [ ] `/admin/*` unchanged functionally (Culinary OS tokens may still use `culinary-*` scale)

---

## Design system source

`C:\Users\18023\Downloads\Bornfidis Design System` — tokens, guidelines, `ui_kits/website/Chrome.jsx`, `SKILL.md`.
