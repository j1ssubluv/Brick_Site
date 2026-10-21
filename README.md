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
