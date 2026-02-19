Private storage for Academy product PDFs. Not web-accessible; files are served only via /api/academy/download/[slug] after purchase verification.

Place the following manual PDFs here (exact filenames):

  1. regenerative_enterprise_foundations_manual.pdf
  2. regenerative_farmer_blueprint.pdf
  3. vermont_contractor_foundations_manual.pdf
  4. jamaican_chef_enterprise_system.pdf

These map to product slugs in lib/academy-products.ts and lib/academy-storage.ts.
Do not put this directory under public/. File permissions: read-only for the app (default).

Deployment: Add these 4 PDFs to this folder on the server (or commit them with
  git add -f storage/academy-products/*.pdf
if you want them in the repo). The download API reads from this path at runtime.
