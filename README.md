# Brick Site

Sales site for retired LEGO sets held for resale. Project notes and rules are in `CLAUDE.md`.

## Setup

```
cd L:\vs.code\Py_Projects\Brick_Site
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Static site in `site/` (plain HTML, CSS and JS). Preview it from that folder:

```
cd site
python -m http.server 8504
```

Then open http://localhost:8504. Only `site/` is published; edit listings in `site/sets.json`.

## Deploy (Cloudflare Workers static assets)

Hosting is Cloudflare on the free plan, deployed from the private GitHub repo
`j1ssubluv/Brick_Site`. Cloudflare's dashboard now creates a Worker project instead of a
Pages project; `wrangler.jsonc` at the repo root names `site/` as the only folder published,
so `docs/`, `CLAUDE.md`, `data/` and the scripts are never served.

Live: https://brick-site.retiredbrickco.workers.dev (first deployed 2026-10-22).

### First deploy (done)

1. Dashboard: **Workers & Pages** > **Create an app** > **Import a repository**, pick `Brick_Site`.
2. Project name `brick-site`, build command blank, deploy command `npx wrangler deploy`.
3. Turn **Preview builds** off, leave **Protect with Cloudflare Access** off, and let Cloudflare
   create the API token for the build.
4. **Deploy**. Check that `/CLAUDE.md`, `/docs/` and `/data/inventory.csv` return 404.

### Custom domain

Project **Settings** > **Domains & Routes** > **Add** > **Custom domain**. Add both
`www.retiredbrickco.com` and `retiredbrickco.com`; they are separate names. DNS and the
certificate are automatic because the domain is registered at Cloudflare. Leave the MX and
TXT records alone (they carry `info@` email forwarding).

### Updating listings

1. Edit `site/sets.json` and add photos to `site/images/` (real JPEGs, GPS/EXIF stripped).
2. Preview locally (see Setup), then commit and push to `master` on both remotes.
3. Cloudflare redeploys on every push to `master`. Mark a set `pending` or `sold` the same way.

### Several copies of one item (quantity)

Add `"quantity": 12` to an entry that has more than one copy, for example one figure from a series.
The card shows "12 available" (or "Only 3 left" at 3 or fewer), the price shows "each", and the
request form asks "How many?". When a copy sells, lower the number in `site/sets.json`, commit and
push. At `"quantity": 0` the listing shows as Sold on its own. Entries without `quantity` behave
as a single item. The count only changes when you edit the file, so two buyers can still request the
last copy; first come, first served, and nothing is reserved until you confirm.
### Before launch

- Set `FORMSPREE_ENDPOINT` in `site/app.js` to the Formspree form URL. While it is blank, the
  request form falls back to a prefilled `mailto:` link.
- Send a test request and confirm it reaches `info@retiredbrickco.com`.
- Check the photos for GPS data, and that every `photos` entry in `sets.json` points at a file that exists.
- PayPal Goods and Services requests are sent by hand after Lyle confirms a request. The site never takes payment.
  PayPal's fee is about 3.49% + $0.49 per sale, or 2.99% + $0.49 for cards (PayPal fee page, 2026-10-22).

### Rollback

Project **Deployments** tab: pick an earlier version and roll back to it.
