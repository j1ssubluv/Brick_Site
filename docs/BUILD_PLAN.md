# Build plan: Retired Brick Co. storefront (v1)

Status: **proposed 2026-10-19, awaiting Lyle's go-ahead.** No site code written yet.
Source of truth: `docs/Storefront_Spec.md`, as overridden by the Decisions in `CLAUDE.md`
(Cloudflare Pages, PayPal Goods and Services plus cash only, first come first served,
shop name and email, no accounts or order database).

## Build order

| Step | Deliverable | Done when |
|---|---|---|
| 1 | `sets.json` with the 6 placeholder entries (3 sealed, 3 used, 1 sold) | Loads as valid JSON; no invented names or prices |
| 2 | `styles.css`: tokens (`--accent` etc.), layout, cards, pills, focus ring | Matches the spec colors and fonts |
| 3 | `index.html`: header, hero, listings section, request panel, how-it-works, footer | Semantic HTML, anchors work |
| 4 | `app.js`: load and render cards, filters, live count, status pills | Filter counts match the data |
| 5 | Request-to-buy panel and form: validation, ship/pickup toggle with ZIP, hidden set fields, confirmation, Formspree with `mailto:` fallback | Works with no endpoint set (mailto) |
| 6 | Accessibility and phone pass | See checks below |
| 7 | Local preview on port 8504 and a browser check at phone and desktop width | Screenshots reviewed |
| 8 | README deploy notes (Cloudflare Pages from the GitHub repo, custom domain) | Lyle can follow them |

Lightbox is "nice to have" in the spec: do last, only if the rest is solid.

## Changes to the spec before building

| Spec item | Change |
|---|---|
| Shop name, email | "Retired Brick Co.", `info@retiredbrickco.com` |
| Payment text (hero, form note, How buying works, footer) | "PayPal Goods and Services or cash at local pickup". Remove Zelle and Venmo. |
| "The set is held for you" (confirmation) | First come, first served: requests are answered in the order received; a set is not reserved until confirmed. |
| `sets.json` example has `//` comments | Not valid JSON. Put the field notes in the README and keep the file comment-free. |
| Hero "priced fairly by market value" | Lyle's copy, but it is a claim: keep it only if prices are backed by sold-price checks (the spec's later pricing helper). Flag to Lyle. |

## Design decisions to confirm (defaults in bold)

1. Fonts: **load Space Grotesk and IBM Plex Sans from Google Fonts as the spec says** (visitors' browsers contact Google), or self-host the font files (no third party, a few extra files).
2. Spam: **add a hidden honeypot field and use Formspree's built-in filtering**; no CAPTCHA.
3. Request panel: **inline above the grid**, as the spec prefers (no modal focus trap needed).
4. Currency display: whole dollars, `$` prefix, no cents.

## Checks (no framework, so manual and scripted)

- JSON validity of `sets.json`; every `photos` path exists (placeholders use the gray box).
- Phone width (about 375px): no horizontal scroll, tap targets at least 44px, nav wraps.
- Keyboard: tab order, visible 3px `#F2C230` focus ring, Esc closes the panel, `aria-pressed` on filters.
- Contrast at least 4.5:1 for text on each background (check accent `#1F5FBF` on white and white on accent).
- Form: required fields, email type, ZIP only when Ship is chosen, hidden fields carry set number, name, price, condition.
- With no Formspree endpoint, "Send request" opens a prefilled `mailto:` to `info@retiredbrickco.com`.
- Nothing in the page source contains cost basis, a personal email, an address, or a payment field.

## Inputs needed from Lyle (not blocking the placeholder build)

- Inventory: set number, name, theme, pieces, condition and notes, asking price, status.
- Photos named `<setnumber>-1.jpg`, `-2.jpg`, and so on, his own.
- Formspree form ID (free account; public by design). Until then the mailto fallback is used.
- PayPal business account (for the Goods and Services requests he sends after confirming).

## Not in v1

Cart, accounts, on-site payment, order database, admin panel, pricing helper, custom analytics.
