# Homepage image assets

**Source of truth:** `lib/homepage-images.ts` (filenames, `homepageImagePath()`, and `homepageImages` toggles).

**Storage:** `public/images/homepage/` — static files are served at `/images/homepage/...`.

## Workflow

1. Add or rename files in `public/images/homepage/` to match [HOMEPAGE_IMAGE_FILES](../lib/homepage-images.ts).
2. In `homepageImages`, replace `null` with `homepageImagePath('hero')` (or the matching slot name) for each image you want live.

There is no upload UI; dropping files into `public/` is the deployment-friendly pattern for this stack.

## Slot → filename → page section

| Config key (`homepageImages`) | Expected file | Section in `app/page.tsx` |
|-------------------------------|---------------|---------------------------|
| `hero` | `hero.png` | Hero — right column (or glass cards if `null`) |
| `serviceIntimate` | `service-intimate.png` | Service Packages — card 1 |
| `serviceGathering` | `service-gathering.png` | Service Packages — card 2 |
| `serviceRetreat` | `service-retreat.png` | Service Packages — card 3 |
| `experienceBoard` | `experience-board.png` | The Experience — first image |
| `experienceFresh` | `experience-fresh.png` | The Experience — second image |
| `provisionsSpice` | `provisions-spice.png` | Provisions — first product card |
| `provisionsPrep` | `provisions-prep.png` | Provisions — second product card |
| `provisionsGourmet` | `provisions-gourmet.png` | Provisions — third product card |

Rendering uses `components/home/HomepageBrandImage.tsx` (`next/image` + fallbacks).
