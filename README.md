# Somya Khan — Portfolio

## Publish on GitHub Pages
1. Create a repo (e.g. `somya-portfolio`) and upload everything in this folder.
2. Settings → Pages → Source: "Deploy from a branch" → `main` / root → Save.
3. Your site appears at `https://YOUR-USERNAME.github.io/somya-portfolio/`.

## First things to do (all in `data/site.json`)
- `contact`: add your email, Instagram, LinkedIn and WhatsApp (country code first, e.g. 91...). A button only shows if you fill it in.
- `showreel.video`: put your showreel at `videos/showreel/reel.mp4` and set `"video": "videos/showreel/reel.mp4"`. The section stays hidden until you do.
- `meet.video`: same for your talking-head clip (`videos/bts/meet.mp4`).
- `heroVideo`: optional walking clip (`videos/hero/walk.mp4`). The poster photo shows until then.
- `testimonials`: only real ones. Format: `{ "name": "Client", "role": "Agent", "text": "…", "image": "images/testimonials/x.jpg" }`

## Add a project
1. Upload the thumbnail to `images/projects/` and (optional) a 3–5 s preview loop to `videos/previews/`.
2. Upload the full video to unlisted YouTube/Vimeo and copy the link, or put an mp4 in the repo (under 100 MB, ideally under 20 MB).
3. Open `data/projects.json` → pencil icon → add an entry (copy one from `projects.example.json`). Separate entries with commas.
4. Commit. The site updates in 1–2 minutes. Cards appear automatically; empty categories are hidden.

Categories: `real-estate`, `ai`, `brand`, `motion`. Orientation: `vertical` (reels) or `horizontal`.
Put `"featured": true` to pin a project first. Leave `result` and `feedback` empty if you have none.
Check your JSON for typos at jsonlint.com before committing.

## Preview
- Sample layout with fake projects: add `?demo` to the URL.
- Locally, open a terminal in this folder and run `python3 -m http.server`, then visit http://localhost:8000 (double-clicking index.html will not load the data files).

## Folders
`images/` photos · `videos/` clips · `data/` the two JSON files you edit · `css/` and `js/` the design and logic (no need to touch) · `fonts/` for self-hosted fonts later.
