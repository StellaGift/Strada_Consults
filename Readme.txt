# Strada Consults and Services Limited Website

This repository contains the custom-built website for Strada Consults and Services Limited.
It presents the company's technology, cybersecurity, real estate, and professional consulting offerings.

## Project Overview

The site is a static, multi-page marketing website with:
- A primary landing page (`index.html`)
- Supporting legal pages (`terms-of-service.html`, `privacy-policy.html`)
- Service/starter template pages (`service-details.html`, `starter-page.html`)
- Branded content, testimonials, service cards, FAQ accordion, and contact form

## Core Service Categories on the Site

1. Secure custom software development
2. Vulnerability assessment and penetration testing (VAPT)
3. Cloud security and DevSecOps integration
4. Identity and access management (IAM)
5. Security monitoring and incident response
6. Cybersecurity education
7. Real estate brokerage and advisory
8. Property valuation and surveying
9. Property and facility management
10. Real estate development
11. Project construction and supervision
12. Professional consultation

## Tech Stack

- HTML5
- CSS3 (`assets/css/main.css`)
- Vanilla JavaScript (`assets/js/main.js`)
- Bootstrap 5
- Bootstrap Icons
- AOS (scroll animations)
- Swiper (carousel)
- GLightbox
- PureCounter

## Project Structure

- `index.html` - Main landing page
- `service-details.html` - Service detail template page
- `starter-page.html` - Starter template page
- `terms-of-service.html` - Terms page
- `privacy-policy.html` - Privacy policy page
- `assets/css/main.css` - Main stylesheet
- `assets/js/main.js` - Main scripts (nav, FAQ toggle, interactions)
- `assets/img/` - Site images and graphics
- `assets/vendor/` - Third-party frontend libraries
- `forms/contact.php` - Template PHP form handler (not primary in current setup)

## Contact and Form Setup

Current contact form in `index.html` posts to Formspree.
If you need to change the inbox destination, update the `action` URL inside the contact form.

Map directions link is configured in the Contact section and points to:
`55 NTA/Choba Road, Port Harcourt, Rivers State, Nigeria`.

## Run Locally

Because this is a static site, you can run it with any local web server.

Option 1 (Python):
```bash
python -m http.server 5500
```
Then open: `http://localhost:5500`

Option 2 (Node):
```bash
npx serve .
```

You can also open `index.html` directly in a browser, but a local server is better for consistent behavior.

## Customization Guide

- Update page content: edit `index.html`
- Update styling/theme: edit `assets/css/main.css`
- Update interactions/behavior: edit `assets/js/main.js`
- Replace brand assets (logo, images): update files in `assets/img/`
- Update contact email, phone, and address in the Contact section of `index.html`

## Deployment

Deploy as a static website to any host, such as:
- Netlify
- Vercel
- GitHub Pages
- cPanel shared hosting
- Nginx/Apache server

Upload all files while preserving the folder structure (`assets/`, `forms/`, and root HTML files).

## Notes

- This project started from the BootstrapMade Landify template and has been significantly customized for Strada Consults and Services Limited.
- Keep vendor libraries updated carefully to avoid breaking custom styles or scripts.
