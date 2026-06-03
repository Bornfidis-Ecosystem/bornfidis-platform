Place the 4 source cover images here with these exact names:

  1. regenerative_enterprise_foundations_cover.png
  2. regenerative_farmer_blueprint_cover.png
  3. vermont_contractor_foundations_cover.png
  4. jamaican_chef_enterprise_system_cover.png

Recommended size for book/academy covers:
  - Aspect ratio: 3:4 (portrait, like a book) — used on product pages and mobile grid.
  - Dimensions: 900×1200 px (minimum) or 1200×1600 px (best quality).
  - Format: PNG. The script resizes to max width 1200px (no enlargement).

Then from the project root run:

  npm run copy-academy-covers

Or if the 4 files are in another folder:

  npm run copy-academy-covers -- path/to/folder

Output (optimized for web) will be written to public/academy/covers/ and
served at /academy/covers/regenerative-enterprise-foundations.png, etc.
