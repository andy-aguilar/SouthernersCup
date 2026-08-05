# The Southerners Cup

A static league site built with plain HTML, CSS, and vanilla JavaScript.

## Structure

- `index.html` — public homepage
- `published/league-history.html` — public league history
- `admin/index.html` — working-document index
- `published/*.html` — reports and drafts
- `site.css` — homepage/admin styles

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Cloudflare Pages

Connect the GitHub repository with framework preset `None`, no build command,
and `/` as the output directory. Every push to `main` then deploys.

## Admin protection

Static JavaScript cannot securely protect documents. Put `/admin*` and the
non-public files under `published/` behind Cloudflare Access. Do not implement
a client-side password because it exposes the password and documents in source.

Only `index.html` and `published/league-history.html` should be public.
