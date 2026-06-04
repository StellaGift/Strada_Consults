Strada Properties Website
=========================

This is the static property website for Strada Properties. It includes the
homepage, all listings page, individual property detail pages, service/about
pages, contact page, FAQ page, and legal pages.

Main Pages
----------
- index.html: Homepage
- properties.html: All listings page
- property-single-listing1.html: Detached duplex listing detail page
- property-single-listing2.html: Choba land listing detail page
- property-single-popular*.html: Popular property detail pages
- about.html, services.html, contact.html, faq.html: Supporting pages
- privacy-policy.html, terms-of-use.html: Legal pages

Project Structure
-----------------
- css/: Compiled stylesheets and vendor CSS
- scss/: Source SCSS files from the template
- js/: Site JavaScript and vendor scripts
- fonts/: Icomoon and Flaticon icon fonts
- images/: Source images, videos, favicon, SVG logo, and responsive output
- images/responsive/: Optimized AVIF and WebP image versions
- tools/: PowerShell scripts for image optimization and responsive markup updates

Tech Stack
----------
- HTML5
- CSS3
- SCSS
- JavaScript
- Bootstrap 5
- Tiny Slider
- AOS (Animate On Scroll)
- Icomoon icon font
- Flaticon icon font
- Google Fonts: Work Sans
- AVIF responsive images
- WebP fallback images
- SVG logo
- MP4 and WebM video assets
- PowerShell image tooling
- ImageMagick for image conversion/compression
- Prepros config for optional SCSS/CSS workflow

Image Optimization
------------------
The site uses responsive image markup with AVIF first and WebP fallback. Most
property and content images are served from images/responsive/ with srcset and
sizes attributes for mobile and desktop performance.

The original images in images/ are retained as source/master assets for future
regeneration. In production, keep the responsive folder, SVG logo, favicon, and
video assets available.

Useful image scripts:
- tools/optimize-property-images.ps1
- tools/generate-webp-fallbacks.ps1
- tools/rebuild-responsive-manifest.ps1
- tools/apply-responsive-images.ps1

Running The Site
----------------
This is a static site and does not require a build step. Open index.html in a
browser, or serve the Strada_Properties folder with any static file server.

Notes
-----
- Keep property card data in js/custom.js consistent with the matching detail
  pages.
- Add new listing images to images/ first, then regenerate responsive assets.
- Do not remove original source images unless the responsive assets and all page
  references have been verified.
