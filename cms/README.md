# Content management and blog

Open https://elevation-tech.sa/admin.html. The private initial password is delivered separately and is never stored in GitHub. Change it under Settings. Signing out and password changes invalidate server sessions.

## Editing
- Dashboard shows the existing services, products, projects, partners, testimonials, hero slides and posts.
- Pages edits the heading, introduction, SEO title and description of the six existing pages. Other page body sections remain in their HTML files.
- Blog supports creating, editing, deleting, drafting and publishing articles. A saved slug is permanent to preserve links.
- Article body supports paragraphs, `##` headings, `- ` lists and `[label](https://example.com)` links. Site-relative links are supported; unsafe URL schemes and raw HTML are escaped.
- Media accepts PNG, JPEG and WebP up to 512 KB. Upload, then copy the image URL into an item or article.
- Service editors include a direct photo upload and image description. Project editors accept multiple photos, up to 20, with descriptions, captions, cover selection, ordering and removal. These uploads accept JPG, PNG or WebP up to 15 MB per source image and optimize the image for the existing media service. Save the item after uploading. Uploads that finish before cancellation remain available in Media.
- Project galleries appear on the homepage and projects page, with thumbnails, keyboard navigation and captions. Existing single project images remain supported; the first gallery image is the cover.
- Save persists to shared Cloudflare D1. Reopen any page to see updates. Conflicting saves return an error instead of overwriting newer content.
- Export downloads a content backup. Old browser storage, if found, has a separate backup download.

## Hosting

All public pages and blog articles share cms/header.js and assets/site-header.css/js. Links use root paths, and mobile navigation uses an accessible modal drawer. After editing the template, run `node cms/sync-header.mjs` to regenerate static headers and deploy the Worker to update blog headers.

The homepage, static pages, blog index and all articles share the footer from cms/footer.js and assets/site-footer.css. After changing the shared footer template, run `node cms/sync-footers.mjs` to regenerate static footers and deploy the Worker for blog footers.

The partner carousel uses assets/partner-slider.js and assets/partner-slider.css. It animates the full row in RTL, resets cloned slides after looping, rebuilds after published content loads, and supports pause, keyboard navigation, reduced motion and viewport resizing.
Static site and admin: Vercel, connected to GitHub main.
Shared API and server-rendered blog: Cloudflare Worker `elevation-content-api`.
D1: `elevation-site-content`, binding `DB`.
The root `vercel.json` proxies /api/*, /blog/* and /sitemap.xml to the Worker, keeping browser requests on the same origin.

The blog includes canonical URLs, article JSON-LD, Open Graph metadata, RSS at /blog/rss.xml and a dynamic sitemap. Drafts are excluded from public APIs, search, feeds, and sitemap. Unknown and draft article URLs return 404.

The sitemap at /sitemap.xml updates from published content on every request. It includes the six public pages, the blog index and pagination, and every published article. Image sitemap entries cover service photos, product images, all project gallery photos, hero images and article covers on their corresponding pages. Image URLs are absolute and deduplicated per page; article modification dates come from saved post metadata. Admin pages and drafts are excluded. robots.txt advertises the sitemap URL.

## Deployment and recovery
Worker source and configuration are in cms/. Deploy that Worker when backend code changes; a GitHub push alone deploys only Vercel. Use Cloudflare's supported deployment tooling with cms/wrangler.jsonc. Apply cms/schema.sql only for initial setup (it uses CREATE IF NOT EXISTS). content/site.json is an initial public snapshot, not the ongoing source of truth. Never reseed over live content.

Back up D1 through the Cloudflare dashboard or export the current content from the admin. Authentication uses a salted PBKDF2 hash in admin_auth, HttpOnly Secure cookies, an eight-hour session, origin checks, CSRF tokens and login throttling. No public hardcoded password remains.

For password recovery, an account administrator can replace the single admin_auth salt/hash with a securely generated PBKDF2-SHA256 hash (100,000 iterations, 32-byte salt and output), then delete admin_sessions. Never commit the password or exported session data.

Public pages retain their original static markup if the content API is unavailable. The six static pages apply saved edits with JavaScript; blog pages render on the server. Local server.js previews static files only; use the deployed environment to exercise the API and blog routes.
