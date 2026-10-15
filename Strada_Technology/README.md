# Strada Technology & Digital Solutions

An independent, static child website for Strada Consults and Services Limited's technology practice. It is designed to run from this directory alone, without loading code, styles, images, fonts, or libraries from the main website or `Strada_Properties/`.

## Structure

- `index.html` — standalone landing page and content entry point
- `assets/css/main.css` — site-specific styles and responsive layout
- `assets/js/main.js` — small, dependency-free navigation enhancement
- `assets/img/strada-logo.png` — local copy of the company logo
- `_headers` — security response headers for Netlify and Cloudflare Pages
- `.htaccess` — security response headers for Apache hosting
- `robots.txt` — crawler policy

## Run and deploy

Open `index.html` directly for a quick preview, or serve this directory with a static file server. For a separate deployment, set this directory as the static site's publish/root directory and deploy its contents. No build step, package install, PHP handler, or root-project asset is required.

Static hosts differ in how they apply response headers. Use the provided `_headers` on compatible static hosts or `.htaccess` on Apache. Configure equivalent headers in your host's dashboard or server configuration when neither file is supported. The page also has a restrictive CSP meta policy as a browser-side fallback, though response headers remain the authoritative deployment setting.

## Security and growth

- No third-party scripts, remote fonts, analytics, or frontend packages.
- All site assets use same-origin relative paths.
- No contact form collects personal data in the browser; contact actions open the visitor's email client or phone dialler.
- Security headers restrict framing, plugins, referrers, permissions, and resource origins.
- Keep new pages and assets inside this directory. Add integrations only after reviewing their privacy, access, and security needs.
- Before adding a form or backend, implement server-side validation, abuse controls, secret management, and an explicit privacy notice.

## Content updates

Edit the page content in `index.html`, presentation in `assets/css/main.css`, and interactions in `assets/js/main.js`. Contact details currently use `stradaconsults@gmail.com` and `+234 703 839 5145`.
