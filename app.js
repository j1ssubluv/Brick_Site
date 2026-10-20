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
const filters = { condition: "all", retired: "all" };
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

function render() {
  const shown = sets.filter((s) =>
    (filters.condition === "all" || s.condition === filters.condition) &&
    (filters.retired === "all" || (filters.retired === "retired") === isRetired(s))
  );
  const avail = shown.filter((s) => s.status === "available").length;
  countEl.textContent = avail + (avail === 1 ? " set available" : " sets available");
  grid.replaceChildren();
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

document.querySelectorAll(".filter").forEach((b) =>
  b.addEventListener("click", () => {
    filters[b.dataset.group] = b.dataset.filter;
    document.querySelectorAll('.filter[data-group="' + b.dataset.group + '"]')
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  })
);

syncZip();
fetch("sets.json", { cache: "no-cache" })
  .then((r) => r.json())
  .then((data) => {
    // Tolerate "Sealed" / "Available " etc. so a capital letter in sets.json can't change a listing.
    const norm = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);
    sets = data.map((s) => ({ ...s, condition: norm(s.condition), status: norm(s.status), type: norm(s.type) }));
    render();
  })
  .catch(() => { countEl.textContent = "Listings could not be loaded. Please refresh."; });
