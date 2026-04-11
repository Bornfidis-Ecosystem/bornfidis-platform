# Homepage images

Drop image files **here** (`public/images/homepage/`) using the filenames below, then enable them in **`lib/homepage-images.ts`** by setting each slot from `null` to `homepageImagePath('hero')` (etc.).

## Filenames (required names)

| File | Purpose |
|------|---------|
| `hero.png` | Hero — right column |
| `service-intimate.png` | Service Packages — Intimate Dining |
| `service-gathering.png` | Service Packages — Gathering Experience |
| `service-retreat.png` | Service Packages — Retreat & Events |
| `experience-board.png` | The Experience — grazing / boards |
| `experience-fresh.png` | The Experience — fresh / crudité |
| `provisions-spice.png` | Provisions — Signature Spice Blends |
| `provisions-prep.png` | Provisions — Chef-Crafted Sauces |
| `provisions-gourmet.png` | Provisions — Giftable Gourmet Line |

You can use `.jpg` instead of `.png` — if so, either rename files to match the table **or** paste the full path in `homepage-images.ts` (e.g. `'/images/homepage/hero.jpg'`).

## Enable after upload

Open `lib/homepage-images.ts` and change e.g.:

```ts
hero: null,
```

to:

```ts
hero: homepageImagePath('hero'),
```

Repeat for each slot you’ve added a file for.
