// Formspree endpoint, e.g. "https://formspree.io/f/xxxxxxxx". Public by design.
// Leave empty to fall back to a prefilled mailto: link.
const FORMSPREE_ENDPOINT = "";
const SHOP_EMAIL = "info@retiredbrickco.com";

const grid = document.getElementById("grid");
const countEl = document.getElementById("count");
const panel = document.getElementById("request");
const form = document.getElementById("req-form");
const done = document.getElementById("req-done");
const errorEl = document.getElementById("req-error");

let sets = [];
const themeSelect = document.getElementById("theme-select");
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-filters");

const DEFAULTS = { condition: "all", retired: "all", theme: "all", q: "" };
const filters = { ...DEFAULTS };
let current = null;
let lastTrigger = null;

// Whole dollars show without cents ($100); anything with cents shows two places ($12.50).
const money = (n) => {
  if (n == null) return "[$ price]";
  const cents = !Number.isInteger(Number(n)) ? 2 : 0;
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: cents, maximumFractionDigits: cents });
};
const pieces = (n) => (n == null ? "[000] pieces" : Number(n).toLocaleString("en-US") + " pieces");

// Entries with "type": "minifigure" use optional "figureNumber" and "series" instead of
// setNumber and pieces; everything else is a set.
const isFigure = (s) => s.type === "minifigure";
const idLabel = (s) =>
  isFigure(s) ? "Minifigure" + (s.figureNumber ? " #" + s.figureNumber : "") : "Set #" + s.setNumber;
const detail = (s) =>
  [idLabel(s), isFigure(s) ? null : pieces(s.pieces), s.year].filter((p) => p != null).join(" · ");

function conditionLabel(s) {
  if (s.condition === "sealed") return "New · Sealed";
  const first = (s.conditionNotes || "").split(/[.,;]/)[0].trim();
  return first ? "Used · " + first : "Used · Complete";
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function photoBox(s) {
  const box = el("div", "photo");
  if (s.photos && s.photos.length) {
    const img = el("img");
    img.src = s.photos[0];
    img.alt = s.name + " (" + idLabel(s) + ")";
    img.loading = "lazy";
    box.appendChild(img);
  } else {
    box.appendChild(el("span", null, "Set photo"));
  }
  return box;
}

// A set counts as retired unless sets.json says "retired": false.
const isRetired = (s) => s.retired !== false;

function badge(s) {
  const wrap = el("div", "badges");
  wrap.appendChild(el("span", "badge" + (s.condition === "sealed" ? " sealed" : ""), conditionLabel(s)));
  wrap.appendChild(isRetired(s) ? el("span", "badge retired", "Retired") : el("span", "badge current", "Not yet retired"));
  return wrap;
}

// Themes are matched case-insensitively ("Star Wars" = "star wars"). Bracketed or empty
// themes are placeholders and stay out of the dropdown.
const themeKey = (s) => (s.theme || "").trim().toLowerCase();
const isPlaceholder = (t) => !t || t.startsWith("[");
const searchText = (s) =>
  [s.name, s.setNumber, s.figureNumber, s.series, s.theme, s.year]
    .filter((v) => v != null && v !== "")
    .join(" ")
    .toLowerCase();

function render() {
  const tokens = filters.q.toLowerCase().replace(/#/g, "").split(/\s+/).filter(Boolean);
  const shown = sets.filter((s) =>
    (filters.condition === "all" || s.condition === filters.condition) &&
    (filters.retired === "all" || (filters.retired === "retired") === isRetired(s)) &&
    (filters.theme === "all" || themeKey(s) === filters.theme) &&
    tokens.every((t) => searchText(s).includes(t))
  );
  const avail = shown.filter((s) => s.status === "available").length;
  countEl.textContent = avail + (avail === 1 ? " set available" : " sets available");
  grid.replaceChildren();
  if (!shown.length) grid.appendChild(el("p", "empty", "No sets match. Try a different search or clear the filters."));
  shown.forEach((s, i) => {
    const card = el("article", "card" + (s.status === "sold" ? " is-sold" : ""));
    const photo = photoBox(s);
    photo.appendChild(badge(s));
    const body = el("div", "card-body");
    body.append(
      el("p", "theme", isFigure(s) && s.series ? s.series : s.theme),
      el("h3", null, s.name),
      el("p", "meta", detail(s))
    );
    const foot = el("div", "card-foot");
    foot.appendChild(el("span", "price", money(s.price)));
    if (s.status === "available") {
      const b = el("button", "btn", "Request to buy");
      b.type = "button";
      b.addEventListener("click", () => openPanel(s, b));
      foot.appendChild(b);
    } else {
      foot.appendChild(el("span", "status-pill " + s.status, s.status === "sold" ? "Sold" : "Pending"));
    }
    body.appendChild(foot);
    card.append(photo, body);
    grid.appendChild(card);
  });
}

function openPanel(s, trigger) {
  current = s;
  lastTrigger = trigger;
  const sum = document.getElementById("req-summary");
  const photo = photoBox(s);
  photo.appendChild(badge(s));
  sum.replaceChildren(
    photo,
    el("h3", null, s.name),
    el("p", "meta", detail(s)),
    el("p", "price", money(s.price))
  );
  form.hidden = false;
  done.hidden = true;
  errorEl.hidden = true;
  form.elements.setNumber.value = isFigure(s) ? (s.figureNumber || "") : s.setNumber;
  form.elements.setName.value = s.name;
  form.elements.price.value = money(s.price);
  form.elements.condition.value = conditionLabel(s);
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("f-name").focus({ preventScroll: true });
}

function closePanel() {
  panel.hidden = true;
  if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
}

function syncZip() {
  document.getElementById("zip-field").hidden = form.elements.delivery.value !== "Ship";
}

function validate() {
  if (!form.elements.name.value.trim()) return "Please enter your name.";
  const email = form.elements.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
  return "";
}

function mailtoHref() {
  const f = form.elements;
  const lines = [
    "Request to buy: " + current.name + " (" + idLabel(current) + ")",
    "Asking price: " + f.price.value,
    "Condition: " + f.condition.value,
    "",
    "Name: " + f.name.value.trim(),
    "Email: " + f.email.value.trim(),
    "Delivery: " + (f.delivery.value === "Ship" ? "Ship, ZIP " + f.zip.value.trim() : "Local pickup"),
    "",
    f.message.value.trim(),
  ];
  return "mailto:" + SHOP_EMAIL +
    "?subject=" + encodeURIComponent("Request: " + current.name + " (" + idLabel(current) + ")") +
    "&body=" + encodeURIComponent(lines.join("\n"));
}

function showDone(text) {
  if (text) document.getElementById("req-done-text").textContent = text;
  form.hidden = true;
  done.hidden = false;
  document.getElementById("req-done-title").focus();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = validate();
  errorEl.hidden = !msg;
  errorEl.textContent = msg;
  if (msg) return;
  if (form.elements._gotcha.value) return showDone();

  if (!FORMSPREE_ENDPOINT) {
    window.location.href = mailtoHref();
    return showDone("Your email app should have opened with the request filled in. Press send there to finish. Requests are answered in the order received, and a set is not reserved until I confirm it.");
  }

  const btn = document.getElementById("req-send");
  btn.disabled = true;
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });
    if (!res.ok) throw new Error(res.status);
    showDone();
  } catch {
    errorEl.textContent = "Sorry, that did not send. Please email " + SHOP_EMAIL + " instead.";
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

form.querySelectorAll('input[name="delivery"]').forEach((r) => r.addEventListener("change", syncZip));
document.getElementById("req-close").addEventListener("click", closePanel);
document.getElementById("req-keep").addEventListener("click", () => {
  form.reset();
  syncZip();
  closePanel();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) closePanel();
});

function buildThemeSelect() {
  const seen = new Map(); // lowercase key -> { label (first spelling seen), count of available }
  sets.forEach((s) => {
    const t = (s.theme || "").trim();
    if (isPlaceholder(t)) return;
    const e = seen.get(t.toLowerCase()) || { label: t, n: 0 };
    if (s.status === "available") e.n++;
    seen.set(t.toLowerCase(), e);
  });
  themeSelect.replaceChildren(new Option("All themes", "all"));
  [...seen]
    .sort((a, b) => a[1].label.localeCompare(b[1].label))
    .forEach(([k, e]) => themeSelect.add(new Option(e.label + " (" + e.n + ")", k)));
}

// Shareable view: the filters live in the address bar, e.g. #theme=star+wars&condition=sealed&q=ghost.
// Links that are just an anchor (#sets, #how) are left alone.
function writeHash() {
  const p = new URLSearchParams();
  Object.keys(DEFAULTS).forEach((k) => { if (filters[k] !== DEFAULTS[k]) p.set(k, filters[k]); });
  const s = p.toString();
  history.replaceState(null, "", location.pathname + location.search + (s ? "#" + s : ""));
}

function readHash() {
  const h = location.hash.slice(1);
  if (!h.includes("=")) return false;
  const p = new URLSearchParams(h);
  const pick = (k, allowed) => (allowed.includes(p.get(k)) ? p.get(k) : DEFAULTS[k]);
  filters.condition = pick("condition", ["all", "sealed", "used"]);
  filters.retired = pick("retired", ["all", "retired", "current"]);
  const t = (p.get("theme") || "").toLowerCase();
  filters.theme = [...themeSelect.options].some((o) => o.value === t) ? t : "all";
  filters.q = (p.get("q") || "").slice(0, 100);
  return true;
}

function syncControls() {
  document.querySelectorAll(".filter").forEach((b) =>
    b.setAttribute("aria-pressed", String(filters[b.dataset.group] === b.dataset.filter)));
  themeSelect.value = filters.theme;
  if (searchInput.value !== filters.q) searchInput.value = filters.q;
  clearBtn.hidden = Object.keys(DEFAULTS).every((k) => filters[k] === DEFAULTS[k]);
}

function update() {
  syncControls();
  render();
  writeHash();
}

document.querySelectorAll(".filter").forEach((b) =>
  b.addEventListener("click", () => {
    filters[b.dataset.group] = b.dataset.filter;
    update();
  })
);
themeSelect.addEventListener("change", () => { filters.theme = themeSelect.value; update(); });
searchInput.addEventListener("input", () => { filters.q = searchInput.value; update(); });
clearBtn.addEventListener("click", () => { Object.assign(filters, DEFAULTS); update(); });
window.addEventListener("hashchange", () => {
  if (readHash()) { syncControls(); render(); }
});

syncZip();
fetch("sets.json", { cache: "no-cache" })
  .then((r) => r.json())
  .then((data) => {
    // Tolerate "Sealed" / "Available " etc. so a capital letter in sets.json can't change a listing.
    const norm = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);
    sets = data.map((s) => ({ ...s, condition: norm(s.condition), status: norm(s.status), type: norm(s.type) }));
    buildThemeSelect();
    const shared = readHash();
    syncControls();
    render();
    if (shared) document.getElementById("sets").scrollIntoView();
  })
  .catch(() => { countEl.textContent = "Listings could not be loaded. Please refresh."; });
