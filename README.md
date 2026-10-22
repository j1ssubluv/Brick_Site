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

## Deploy (Cloudflare Pages)

Hosting is Cloudflare Pages on the free plan, deployed from the private GitHub repo
`j1ssubluv/Brick_Site`. Only the `site/` folder is published.

### First deploy

1. Cloudflare dashboard: **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
2. Authorize GitHub and pick the `Brick_Site` repo.
3. Build settings:
   - Production branch: `master`
   - Framework preset: **None**
   - Build command: leave blank
   - Build output directory: `site`
4. **Save and Deploy**. The site goes live at a `*.pages.dev` address.

### Custom domain

1. In the Pages project: **Custom domains** > **Set up a custom domain** > `retiredbrickco.com`.
2. The domain is registered at Cloudflare, so the DNS record is added for you. Confirm it.
3. Wait for the certificate to finish (usually a few minutes), then open the site over `https`.

### Updating listings

1. Edit `site/sets.json` and add photos to `site/images/` (real JPEGs, GPS/EXIF stripped).
2. Preview locally (see Setup), then commit and push to `master` on both remotes.
3. Cloudflare redeploys on every push to `master`. Mark a set `pending` or `sold` the same way.

### Before launch

- Set `FORMSPREE_ENDPOINT` in `site/app.js` to the Formspree form URL. While it is blank, the
  request form falls back to a prefilled `mailto:` link.
- Send a test request and confirm it reaches `info@retiredbrickco.com`.
- Check the photos for GPS data, and that every `photos` entry in `sets.json` points at a file that exists.
- PayPal Goods and Services requests are sent by hand after Lyle confirms a request. The site never takes payment.

### Rollback

Pages keeps every deploy. In the project's **Deployments** tab, pick an earlier one and
choose **Rollback to this deployment**.
