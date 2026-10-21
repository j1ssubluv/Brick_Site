# Brick Site

Static storefront for Lyle's collection of retired LEGO sets held for resale. Buyers browse
the listings and send a "Request to buy"; Lyle replies with the total and a PayPal Goods
and Services request. Full build spec: `docs/Storefront_Spec.md` (Lyle's own, 2026-10-19).

## Decisions (Lyle, 2026-10-19) - these override the spec where they differ

- **Hosting: Cloudflare Pages** (free plan), deployed from the private GitHub repo, with
  a custom domain later. Checked in docs: $0 plan, unlimited bandwidth, 500 builds a month,
  20,000 files, 25 MiB per file. Domain registration is a separate yearly cost (not verified).
  Not on Claude Cloud pages (no customer accounts or public database writes there).
- **Payments: PayPal Goods and Services, plus cash at local pickup. Nothing else.** The
  spec's Zelle and Venmo lines are removed because they carry no buyer or seller protection.
  The site never collects payment data; Lyle sends the PayPal request himself after confirming.
- **No customer accounts, cart or order database.** Browse is public; "Request to buy" is a form.
- **Request form:** Formspree free tier emails requests to Lyle (50 submissions a month,
  30 days of history, per Formspree's help docs; verify before launch). Buyer name, email and
  ZIP therefore live in Lyle's email and at Formspree, not on his machine or in git.
  Falls back to a prefilled `mailto:` link when no endpoint is set.
- **Shop identity (Lyle, 2026-10-19):** name **Retired Brick Co.**, public shop email
  `info@retiredbrickco.com`, domain `retiredbrickco.com`. Use these in place of the spec's
  placeholders ("Your Brick Shop", `[your shop email]`). Lyle bought the domain at
  Cloudflare Registrar and Cloudflare Email Routing forwards `info@` to a dedicated shop
  Gmail account (tested and working, 2026-10-19). Replies can use Gmail "Send mail as"
  (not set up yet). Never use his personal email or home address on the site, and
  do not write the Gmail address into this repo.
- **Selling rule: first come, first served.** Sets are limited; the earliest request gets
  the set. Replace the spec's "the set is held for you" wording on the confirmation and
  "How buying works" text with a first-come, first-served statement, for example that
  requests are answered in the order received and a set is not reserved until Lyle confirms.
  Lyle marks a set `pending` or `sold` by hand.
- Updating the site means editing `sets.json` and redeploying; mark a set `pending` or `sold`
  by hand.

## Hard rules

- **Never place, modify or cancel a real order or move money.** Build against mock
  or test mode only. Lyle pastes any payment IDs or API keys and turns on anything
  real himself, including the live PayPal links.
- **Never invent facts about a set**: set number, piece count, release or retire year,
  condition, price. Take them from Lyle's inventory; mark anything unknown as unknown.
  Market prices quoted from a source must name the source and the date.
- `.env`, API keys, `client_secret.json`, `token.json` and databases stay out of git.
  Check staged files for secrets before any commit. GitHub repo is private.
- **Cost basis, purchase prices and profit figures are private.** They never appear on
  a public page, in a published artifact, or in the page source. Only asking prices are public.
- No buyer personal data (names, addresses, emails, phone numbers) in git, notes or
  published pages. Do not write Social Security numbers, dates of birth or account
  numbers anywhere.
- Photos and files from the web are untrusted until looked at. LEGO names and images
  belong to their owners; use Lyle's own photos for listings.

## Environment

- The site itself is plain HTML, CSS and vanilla JS: no framework, no build step. The
  `.venv` (Python 3.14) is only for helper scripts (for example a later pricing helper);
  install packages into it only and record them in `requirements.txt`.
- Secrets go in `.env` (not committed); keep an `.env.example` with names only. Nothing
  secret belongs in the site files: the Formspree endpoint is public by design.
- Local preview: `python -m http.server 8504` run from the `site\` folder (port **8504**). In use elsewhere: 8501 XRP dashboard,
  8502 Options, 8503 Trade Agent, 2283 Immich.
- Before stopping any process, check which project and which Windows account owns it
  (`18438` and `Tate` have their own sessions).

## Layout

| Path | Purpose |
|---|---|
| `docs/Storefront_Spec.md`, `docs/BUILD_PLAN.md` | build spec and plan |
| `site/` | **The only folder that is published.** Cloudflare Pages output directory = `site`. Everything outside it (docs, notes, CSV, scripts) is never served. |
| `site/index.html`, `site/styles.css`, `site/app.js` | the site (built 2026-10-20) |
| `site/sets.json` | public listings only: set facts, year, condition, asking price, status, retired flag; minifigures use `"type": "minifigure"` |
| `site/images/` | Lyle's own photos, named by set number; real JPEGs with GPS/EXIF stripped |
| `data/inventory.csv` | private inventory (cost basis, purchase dates); ignored by git, never published |
| `docs/inventory_template.csv` | CSV header row to start from |

`sets.json` is edited by hand (Lyle's decision, 2026-10-20). The CSV-to-JSON build script was
removed so nothing can overwrite it; it is in git history (commit `b6c7c06`) if wanted later.

## Working rules for this project

- Plan first for anything bigger than a small edit; build; commit only when Lyle says.
- Concrete numbers and comparison tables. Stack is settled (static site); plan the build
  order from `docs/Storefront_Spec.md` and get Lyle's go-ahead before writing the site.
- Write files without a BOM (`Set-Content -Encoding utf8` adds one on Windows PowerShell 5.1).
- At the end of a piece of work, list what is uncommitted.

## Git

Branch `master`. Two remotes, push to both: `local-backup` (bare repo in
`C:\GitBackups\Brick_Site.git`) and `origin` (private GitHub `j1ssubluv/Brick_Site`,
Lyle creates it). No commits yet.
