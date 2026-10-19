# Brick Site

Ecommerce site for Lyle's collection of retired LEGO sets held for resale. Shows what is
for sale (set number, name, condition, box state, photos, asking price) and lets
customers buy. Stack is not chosen yet: plan it with Lyle before building.

## Hosting and payments (Lyle's direction, 2026-10-19)

- **Hosting:** Claude's cloud (published Artifact pages). Lyle confirms anonymous
  customers (no claude.ai login) can open the page. Artifacts are private by default and
  sharing is Lyle's call. Still check the Artifact tool's limits for what a page can do.
- **Orders and buyer details:** Lyle wants them stored on Claude Cloud, not on his
  machine. Feasibility is unverified: check the page database capability, who can read
  the data (anonymous visitors must not be able to read other buyers' orders), and how
  it is exported. Do not store orders locally as a fallback without asking.
- **Payments:** PayPal Goods and Services, chosen for buyer and seller protection. Lyle wants
  PayPal's checkout to run on the page itself (not just a link). Lyle creates the PayPal
  business account and any buttons or payment links himself and pastes IDs into the
  page. Claude never enters PayPal credentials, never handles card data, never
  completes a test or real payment.
- Pages may only load scripts from the Artifact tool's allowed hosts, so PayPal's JS SDK
  may be blocked. A plain PayPal payment link or hosted button is the likely fallback.
  Confirm before promising a checkout flow.
- Order records hold buyer contact details: keep them out of git, and do not put
  other people's data in a shared page or database without Lyle deciding where it lives.

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

- Own venv: `.\.venv\Scripts\python.exe` (Python 3.14). Install packages into it only,
  never into system Python. Record them in `requirements.txt`.
- Secrets go in `.env` (not committed); keep an `.env.example` with names only.
- Port **8504** if a local dev server is used. In use elsewhere: 8501 XRP dashboard,
  8502 Options, 8503 Trade Agent, 2283 Immich.
- Before stopping any process, check which project and which Windows account owns it
  (`18438` and `Tate` have their own sessions).

## Layout

Empty so far. Record the real structure here once the stack is decided.

| Path | Purpose |
|---|---|
| `data/` | local inventory files and databases; ignored by git |

## Working rules for this project

- Plan first for anything bigger than a small edit; build; commit only when Lyle says.
- Concrete numbers and comparison tables. Show the plan for stack choices (static site vs
  Streamlit vs Flask) with trade-offs before installing anything.
- Write files without a BOM (`Set-Content -Encoding utf8` adds one on Windows PowerShell 5.1).
- At the end of a piece of work, list what is uncommitted.

## Git

Branch `master`. Two remotes, push to both: `local-backup` (bare repo in
`C:\GitBackups\Brick_Site.git`) and `origin` (private GitHub `j1ssubluv/Brick_Site`,
Lyle creates it). No commits yet.
