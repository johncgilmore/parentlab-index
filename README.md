# Parent Lab Searchable Index

A static, client-side searchable index for the Hugging Face dataset `SharedPL25/parentlab`.

## Develop
- Generate data: `python3 scripts/build_index.py`
- Serve locally: any static server. Example: `python3 -m http.server -d public 9999` then open http://127.0.0.1:9999

## How it works
- Pulls repo file tree from the Hugging Face Hub API (stable paths).
- Generates `public/data.json` with filepath + size.
- Client renders a searchable grid (Fuse.js) with filters for podcasts/quizzes and type (audio/pdf).

## Deploy
- Host the `public/` folder (e.g., GitHub Pages, Netlify, Vercel).
- Re-run `scripts/build_index.py` when content changes.
