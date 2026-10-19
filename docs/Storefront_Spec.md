# Brick Shop Storefront: Build Spec

A one-page static storefront for selling my personal LEGO collection directly to buyers, so I avoid eBay and other marketplace fees. Build it so the same files can later be hosted free on Cloudflare Pages (or Netlify / GitHub Pages) with a custom domain.

## Goals and constraints

- **No marketplace fees.** Buyers do not pay on the site. They send a "Request to buy," and I reply by email with the total and payment details.
- **Payments happen off-site** in Zelle, Venmo, PayPal, or cash at local pickup. The site never collects or stores payment information.
- **Static site only.** No server, database, logins, or admin panel, so there is nothing to hack. It must not be hosted on my home computer or network.
- **Easy to update.** I should be able to add a set, change a price, or mark a set sold by editing one data file.
- **Privacy.** No home address or personal email anywhere on the site. Use a shop email (placeholder for now: `[your shop email]`, later something like `info@mybricksite.com`).

## Tech

- Plain HTML, CSS, and vanilla JavaScript. No framework or build step needed.
- File layout:
  ```
  index.html
  styles.css
  app.js
  sets.json          ← all listings live here
  images/            ← set photos, named by set number (e.g. 10294-1.jpg)
  ```
- `app.js` loads `sets.json` and renders the listing cards, filters, and request form.
- **Request form submission:** use Formspree (free tier) so requests are emailed to me. Keep the form endpoint in one constant at the top of `app.js` so I can swap it. If no endpoint is set, fall back to a `mailto:` link with the set details prefilled.
- Must work well on phones (stacking layout, 44px minimum tap targets).

## Data model (`sets.json`)

```json
[
  {
    "setNumber": "00000",
    "name": "[Set name]",
    "theme": "[Theme]",
    "pieces": 0,
    "condition": "sealed",            // "sealed" or "used"
    "conditionNotes": "",             // e.g. "Complete, instructions included, no box" or "Minor shelf wear on box"
    "price": 0,                       // USD, whole dollars
    "photos": ["images/00000-1.jpg"], // first photo is the card image
    "status": "available"             // "available", "pending", or "sold"
  }
]
```

- Condition labels shown on cards: `sealed` → **New · Sealed** (yellow badge), `used` → **Used · Complete** or use the first part of `conditionNotes` (light-blue badge).
- `pending` shows a "Pending" pill instead of the buy button; `sold` shows a gray "Sold" pill.
- Until real data exists, seed with 6 placeholder entries (3 sealed, 3 used, one marked sold) using bracketed placeholders like `[Set name]`, `Set #[00000]`, `[000] pieces`, `[$ price]`, and a gray "Set photo" placeholder box instead of images. Don't invent set names or prices.

## Page layout (top to bottom)

Content max-width 1200px, centered, 24px side padding.

1. **Header** (white, bottom border)
   - Left: logo mark (a simple generic brick drawn in SVG, a rectangle with two studs on top, in the accent color) plus the shop name **"Your Brick Shop"** (placeholder; I'll pick a real name).
   - Right: nav links "Sets for sale", "How to buy", "Contact" (anchor links to sections). They should wrap on mobile.

2. **Hero** (dark background `#1B1F24`, white text)
   - Small yellow pill: "SOLD DIRECT · NO MARKETPLACE MARKUP"
   - Headline (large, 56px desktop): **"LEGO sets priced fairly by market value."**
   - Subtext: "Every set is photographed and described honestly. Pick one, send a request, and pay with Zelle, Venmo or PayPal. Shipped, or meet up for local pickup."
   - Accent-colored button "Browse the sets" that scrolls to the listings.

3. **Listings section** (`#sets`)
   - Heading **"Retired sets for sale"** plus a live count line, e.g. "5 sets available" (counts available sets in the current filter).
   - Filter pills on the right: **All sets** / **New / sealed** / **Used / complete**. The active pill is filled dark; the others are white with a border. Use `aria-pressed`.
   - Responsive card grid: `repeat(auto-fill, minmax(250px, 1fr))`, 20px gap.
   - **Card:** white, 14px radius, 1px border `#DDE1E7`
     - 4:3 photo area with a condition badge in the top-left corner
     - Theme (small uppercase, muted)
     - Set name (bold, display font)
     - "Set #xxxxx · xxx pieces" (muted)
     - Bottom row: price (large, bold) on the left; **"Request to buy"** button (accent color) or a status pill on the right
   - Clicking a photo could open a simple lightbox to see all photos (nice to have).

4. **Request-to-buy panel**
   - Opens inline above the grid when "Request to buy" is clicked (scroll it into view), with an accent-colored 2px border. A modal is also acceptable if it's accessible: focus trap, Esc to close.
   - Left: the chosen set's photo, condition, name, set number/pieces, and price.
   - Right: a form with
     - Heading "Request to buy" and the note "No payment here. I'll email you the total and how to pay."
     - Name (required) and Email (required, type=email)
     - "How do you want it?" toggle: **Ship it to me** / **Local pickup**. If Ship is selected, show a ZIP code field (for a shipping quote).
     - Message (optional textarea)
     - **"Send request"** button plus the note "Pay by Zelle, Venmo or PayPal after I confirm."
     - Hidden fields: set number, set name, price, and condition, so the email I receive says exactly which set was requested.
   - A close (X) button with `aria-label`.
   - **After submitting:** replace the form with a confirmation: green check icon, "Request sent", "I'll reply by email with your total and payment details. The set is held for you while we sort it out.", and a "Keep browsing" button.

5. **How buying works** (`#how`): three cards in a row (stacking on mobile), each with a yellow numbered square:
   1. **Request the set:** "Hit 'Request to buy' and leave your email. Nothing is charged on this site."
   2. **Get your total:** "I reply with the price plus shipping, or a pickup spot if you're local."
   3. **Pay and receive:** "Pay with Zelle, Venmo or PayPal. Sets ship with tracking once payment arrives."

6. **Footer** (`#contact`, white, top border)
   - "Questions about a set?" and "Email [your shop email] and I'll send extra photos or answer anything about condition." (mailto link)
   - "Payment accepted: Zelle · Venmo · PayPal · Cash at pickup"
   - Small legal line: "LEGO® is a trademark of the LEGO Group, which does not sponsor, authorize or endorse this site."

## Visual design

- **Colors**
  - Page background `#F4F5F7`, cards and header `#FFFFFF`
  - Ink / dark `#1B1F24`; secondary text `#3E4550`; muted text `#5A6270`
  - Borders `#DDE1E7` (cards), `#C3C9D2` (inputs, inactive pills)
  - Accent (buttons, logo, links) `#1F5FBF`, hover `#16478F`. Keep it as a CSS variable `--accent` so I can try red `#C4322B`, green `#1E7A46`, or dark `#1B1F24`.
  - Sealed badge and highlight yellow `#F2C230`; used badge `#D6E4F7`; photo placeholder `#E9ECF1`
- **Fonts** (Google Fonts): **Space Grotesk** (500/600/700) for headings, prices, and the logo; **IBM Plex Sans** (400/500/600) for body text.
- Radii: cards 14px, buttons and inputs 8–10px, pills fully rounded.
- No emoji or gradients. Icons are simple inline stroke SVGs.
- Do not use official LEGO logos or branding. Keep the look original.

## Accessibility

- Real `<button>`, `<a href>`, `<label>` and `<input>` elements; visible focus ring (3px `#F2C230` outline).
- Text contrast at least 4.5:1.
- Images need meaningful `alt` text (set name + set number).

## Later (not needed for v1)

- Custom domain via Cloudflare, Porkbun or Namecheap, with free email forwarding for `info@` to Gmail and Gmail "Send mail as" for replies.
- A pricing helper: given set numbers and conditions, pull BrickLink 6-month sold prices, eBay sold listings, and BrickEconomy values, then suggest prices about 5–10% under market average.
