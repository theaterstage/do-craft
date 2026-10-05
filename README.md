# عقل فعّال (Active Mind) — static GitHub Pages mirror

Static mirror of https://do-craft.grok.me built for the `/do-craft/` sub-path.
Live: https://theaterstage.github.io/do-craft/

- `1247` HTML routes (every route has its own index.html), `/assets/*`, images, fonts, manifest, `404.html`, `.nojekyll`.
- Client-side only: the app has no backend, WebSocket, EventSource or `/api` calls; all progress is stored in `localStorage`.
- Rebuild for another base path with `build.py` (`BASE=/other SITE=https://owner.github.io python3 build.py`).
