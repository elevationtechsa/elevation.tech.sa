Elevation Tech — SEO, design, blog, and domain review
Reviewed 11 September 2026

I identified one open repository: elevationtechsa/elevation.tech.sa. This report covers its six public pages, admin page, supporting JavaScript, assets, sitemap, robots file, local server, and deployment configuration. Snapshot: [commit 1b8a046](https://github.com/elevationtechsa/elevation.tech.sa/commit/1b8a046cae44de89469a8833ca31125f7c31db11).

The public-domain redirect has been repaired in Cloudflare. The remaining priorities are to fix broken navigation and inquiry flows, correct Arabic SEO, and launch a blog backed by a real publishing workflow. The existing static website can support these improvements; a framework migration is an option for maintainability.

This is an audit and implementation specification with a completed Cloudflare domain repair authorized during the review. The www DNS record now uses Cloudflare's proxy, and a new permanent redirect sends its traffic to the current website. Website source changes and blog implementation remain recommendations. Public verification results accompany this report; Cloudflare configuration snapshots are retained locally for rollback. Browser screenshot capture was blocked by execution policy, so layout findings below come from HTML/CSS inspection. No Lighthouse score, real-user Core Web Vitals, Google indexing status, keyword volumes, or conversion results are claimed.

**Verified domain diagnosis and completed repair**

The following table records the initial state, before repair:

| Host or record | Observed value or response |
| --- | --- |
| Authoritative nameservers | aarav.ns.cloudflare.com and jocelyn.ns.cloudflare.com |
| elevation-tech.sa A | 216.198.79.1 |
| www.elevation-tech.sa CNAME | 9940ff590fbc250d.vercel-dns-017.com |
| https://elevation-tech.sa/ | HTTP 200, Vercel, 160,104-byte page matching the repository homepage |
| https://www.elevation-tech.sa/ | HTTP 200, Vercel, a different 90,961-byte page; no canonical tag found |
| https://www.elevation-tech.sa/pages/services.html | HTTP 404 |
| Non-www public pages, robots.txt, sitemap.xml | HTTP 200 |

DNS resolves both hosts to Vercel. The evidence points to different domain/deployment assignments or host-specific routing at Vercel; account access is needed to identify the exact configuration. DNS alone does not redirect a browser.

The repair keeps https://elevation-tech.sa as the preferred origin because the repository's canonical URLs and sitemap already use it. It redirects www traffic at Cloudflare before that traffic reaches the older Vercel deployment. Vercel also supports domain redirects if redirect ownership is moved there in the future; its project assignment was not inspected through an authenticated account. [Vercel domain redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting).

Applied a Cloudflare Single Redirect matching only www.elevation-tech.sa, with destination expression concat("https://elevation-tech.sa", http.request.uri.path), HTTP 301, and query-string preservation. Verified an active certificate covering *.elevation-tech.sa, created the rule, and enabled the proxy on the existing www CNAME. The record's Vercel destination remains the same. Before/after configuration is saved for rollback. [Cloudflare Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/).

Live verification passed: the HTTPS www homepage returns 301 to the apex; an HTTPS services deep link preserves its path and query; an HTTP products deep link redirects directly to HTTPS apex with its query preserved. Responses identify Cloudflare as the redirecting server, and the apex homepage continues returning 200 from Vercel. Public DNS now returns Cloudflare addresses for www. See the [redirect responses](repository-review/redirect-checks.json) and [destination checks](repository-review/redirect-destination-checks.json). Cloudflare configuration snapshots are retained locally for rollback.

**Implementation priorities**

| Priority | Confirmed issue | Concrete solution | Completion check |
| --- | --- | --- | --- |
| Fixed | www and apex served different versions | Enabled Cloudflare proxy for www and created a permanent www-to-apex redirect | Live root/deep-link checks passed; paths and queries preserved |
| P0 | Homepage footer links to pages/about, pages/services, and pages/products return 404 | Link to the existing .html URLs immediately; introduce clean URLs only with an explicit route and redirect map | All public internal links resolve |
| P0 | Buttons labeled WhatsApp on services, products, and projects use tel: URLs | Change them to the verified wa.me destination | They open WhatsApp with the expected recipient |
| P0 | Inquiry form opens a WhatsApp draft and clears inputs without confirming delivery | Label the action “Continue in WhatsApp,” retain inputs, and explain that sending happens in WhatsApp; alternatively add a real submission endpoint | Opening/canceling the draft never loses the inquiry; server submissions show success only after acceptance |
| P0 | Every submit event is treated as a lead | Separate inquiry-start, WhatsApp-open, and confirmed lead events | A draft opening does not count as a confirmed inquiry |
| P1 | Arabic pages have English titles/descriptions; ar-SA and en-SA point to the same URL | Write Arabic metadata now; create separate English pages only when translated content exists | Each language has matching content, metadata, and distinct reciprocal alternate URLs |
| P1 | Admin management sections are placeholders; public overrides depend on localStorage | Establish file-based publishing or an authenticated CMS that publishes shared content | A published change appears in a fresh browser on another device |
| P1 | Tailwind's browser CDN is loaded on every page | Compile and minify CSS during a build, keeping the existing appearance initially | Pages load their styling from a generated CSS file |
| P1 | Gold buttons use insufficient white-text contrast | Use white on dark green, or dark text on gold | Text contrast passes WCAG AA |
| P1 | Important product/project details depend on modal interactions | Give each product type and substantial case study its own HTML URL | Links and meaningful content work without opening a modal |
| P2 | No blog exists | Launch a listing and individual article pages with a publishing workflow | Articles appear in navigation, listings, sitemap, and fresh-browser visits |

Source evidence: [broken footer links](https://github.com/elevationtechsa/elevation.tech.sa/blob/1b8a046cae44de89469a8833ca31125f7c31db11/index.html#L1850), [WhatsApp button mismatch](https://github.com/elevationtechsa/elevation.tech.sa/blob/1b8a046cae44de89469a8833ca31125f7c31db11/pages/products.html#L462), [form behavior](https://github.com/elevationtechsa/elevation.tech.sa/blob/1b8a046cae44de89469a8833ca31125f7c31db11/pages/contact.html#L628), [tracking behavior](https://github.com/elevationtechsa/elevation.tech.sa/blob/1b8a046cae44de89469a8833ca31125f7c31db11/assets/site-integrations.js#L130).

**SEO improvements**

Existing strengths: the six public pages already contain individual titles and descriptions, canonical URLs, social metadata, and static JSON-LD. robots.txt and the six-URL sitemap are accessible. Public content is present in HTML, and an unknown URL correctly returns 404. Most content images already have alternative text. Preserve these foundations.

1. Localize page metadata. Suggested Arabic homepage title: “توريد وتركيب وصيانة المصاعد في الرياض | تقنية الارتفاع”. Suggested H1: “توريد وتركيب وصيانة المصاعد في الرياض”. Confirm the actual geographic coverage before writing location claims. Align Open Graph text and image descriptions with the page language. Keep titles descriptive and natural; adding more meta keywords is not a useful Google optimization. [Google SEO guidance](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

2. Correct language annotations. The current en-SA annotation is not a separately available English version. Remove that alternate until a real English page exists. A future structure can retain Arabic at the root and place translations under /en/. Give each translation its own canonical URL and reciprocal hreflang links. Do not canonicalize English articles to Arabic ones. [Google multilingual guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

3. Expand useful landing pages. Prioritize elevator maintenance, installation, modernization, home elevators, passenger elevators, hospital elevators, and escalators. Each page should explain suitability, process, specifications, maintenance considerations, representative work, relevant questions, and a quotation action. Add city pages only where there is real service coverage and distinct local information.

4. Make case studies discoverable. Publish a permanent URL for each verified project, with city, building type, scope, constraints, selected solution, real photos, and outcomes the company can substantiate. Link these pages from products, services, and articles.

5. Consolidate structured data. Static JSON-LD already exists, while site-seo.js appends another block for the same page. Generate one consistent graph with stable entity IDs. Reference the business from service, contact, article, and breadcrumb entities. Add an accurate business address, contact details, and hours where appropriate, after verification. Use BlogPosting for blog articles. Validate against the relevant Google feature requirements; markup does not guarantee a special search result. [LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business), [article guidance](https://developers.google.com/search/docs/appearance/structured-data/article).

6. Update sitemap generation. Include only canonical, published URLs that return 200. Derive lastmod from meaningful content changes; the current entries all use 2026-04-27. Add articles and detail pages automatically. A Google site-verification TXT record is already present in Cloudflare DNS. Search Console account access is still needed to confirm ownership status and inspect indexing/performance reports.

7. Fix internal linking. Replace placeholder footer service links with destinations and implement the currently empty privacy/terms links. Change the generic sitemap footer link to a useful page or the XML sitemap. Preserve old URLs with permanent redirects when restructuring; there is no need to remove .html purely for SEO. [Canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

8. Improve local business consistency. Normalize displayed phone formatting to +966 53 115 4551 and +966 54 492 5287, with sales and emergency roles clearly labeled. Reconcile the Gmail links on some inner pages with the sales email used elsewhere. Verify the map location and business profile, add actual company/team photography, and support certificate and experience claims with appropriate evidence.

**Design and usability improvements**

Retain the green-and-gold identity. Use dark green for primary actions, gold for highlights, and consistent typography, spacing, card proportions, and image crops.

| Area | Recommended change |
| --- | --- |
| Mobile hero | Put the headline and quotation action before the large image. Current order utilities place the text second below the desktop breakpoint |
| Homepage message | Lead with the service and location, followed by one short value statement, a quotation action, and a maintenance action |
| Page structure | Use one descriptive content H1, section H2s, and card H3s; change the brand heading to normal branding markup. This improves structure and accessibility, not a promised ranking boost |
| Navigation | Add Blog / المدونة, active-page styling, and a consistent mobile drawer. Test the crowded navigation around the md breakpoint |
| Contact actions | Use a clear primary quotation button and labeled call/WhatsApp actions; keep floating controls from covering reading or form controls |
| Projects and products | Add dedicated detail pages; retain galleries as optional enhancements with keyboard support |
| Credibility | Use actual team/project photos, documented qualifications, and attributable customer feedback |
| Contact form | Associate labels using for/id, add names and autocomplete attributes, make email optional if it is unnecessary for a WhatsApp inquiry, and provide useful errors |
| Accessibility | Add main/skip navigation, accessible names for icon controls, menu expanded state, dialog focus handling, focus restoration, and visible focus indicators |
| Motion | Reduce continuous pulsing, stop hidden carousels, add pause controls where needed, and honor prefers-reduced-motion |
| Blog reading | Use comfortable Arabic line spacing, a constrained text column, informative image captions, and a mobile-friendly contents list |

Calculated from the source colors: white against #b8952b is approximately 2.85:1; against #d4af37 it is approximately 2.10:1. Both fail even the 3:1 large-text threshold. White against #004d40 is approximately 9.83:1. Check each final state and gradient rather than relying on brand color names. [WCAG contrast criteria](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

A suggested homepage sequence is: service headline and actions → verified trust facts → service choices → product types → recent case studies → installation/maintenance process → testimonials → recent blog articles → quotation/contact details.

**Performance and maintainability**

- Replace cdn.tailwindcss.com with compiled CSS. Tailwind describes that Play CDN as a development option. Preserve dynamically used classes in the build's source detection so cards do not lose styling. [Tailwind Play CDN documentation](https://v3.tailwindcss.com/docs/installation/play-cdn).
- Extract shared headers, footers, navigation, business information, and SEO generation into reusable templates. The current homepage is about 160 KB before transfer compression, including roughly 54,449 characters of inline script.
- Add intrinsic dimensions or explicit aspect ratios to content images. In the static markup, no public-page img uses loading="lazy"; the only explicitly width-and-height-sized image per public page is the tracking pixel. Lazy-load images below the initial viewport, while keeping the hero eagerly available.
- Produce appropriately sized WebP/AVIF variants and srcset/sizes. The existing hero is already about 47 KB, so prioritize unnecessary loading and layout stability rather than assuming every asset is too large.
- Load gallery behavior where used and consolidate the duplicated saved-content renderers. Retain the existing lazy loading on map iframes; add an accessible iframe title.
- Use a small font/icon set. Reduce unnecessary font weights and replace whole icon libraries with the icons actually used where practical.
- Align deployment configuration with Vercel. The Netlify configuration does not configure Vercel. Its one-year immutable cache policy would also be unsuitable for changing, unversioned asset filenames if used on Netlify. Use content-hashed filenames with immutable caching and an appropriate policy for HTML.
- Treat server.js as a development utility. Before production use, it needs URL parsing, safe path containment, complete MIME handling, and robust request handling.
- Target real-user LCP at or below 2.5 seconds, INP at or below 200 ms, and CLS at or below 0.1, evaluated at the 75th percentile. These are acceptance targets, not measurements of this site. [Web Vitals](https://web.dev/articles/vitals).

**Blog implementation specification**

Recommended route structure, keeping Arabic as the existing default:

| Route | Purpose |
| --- | --- |
| /blog/ | Blog index with featured/recent articles |
| /blog/elevator-maintenance-checklist/ | Example Arabic article URL |
| /blog/category/maintenance/ | Useful category archive once enough articles exist |
| /en/blog/ | English index when translations are available |
| /en/blog/elevator-maintenance-checklist/ | Matching translated article |
| /blog/rss.xml | Feed for published articles |

Readable ASCII slugs are a practical choice; Arabic slugs are also valid. The language comes from the page content and correct alternates, not the slug alone.

For the smallest initial release, add static article and index templates to the current project. For ongoing publishing, my recommended option is Astro with Markdown content collections: generate article pages, reusable layouts, category pages, metadata, sitemap, and RSS during builds. This suits a predominantly static company website and reduces repeated HTML. A full migration is not required to fix the urgent defects. [Astro content collections](https://docs.astro.build/en/guides/content-collections/).

| Publishing option | Suitable when | Main tradeoff |
| --- | --- | --- |
| Existing HTML templates | A developer publishes a small number of posts | Lowest setup effort; manual maintenance grows |
| Astro + Markdown — recommended | GitHub-based editing is acceptable and content will expand | Initial template/build work; editors need a GitHub workflow |
| Static site + authenticated CMS | Nontechnical staff need a browser editor | Adds authentication, media management, and publishing integration |

Each article should store title, slug, language, excerpt, author, publication date, meaningful update date, category, hero image/alt text, body, SEO title/description, draft status, and translation relationship. Derive canonical URLs and reading time. Use Article/BlogPosting JSON-LD and visible author/date information; omit invented credentials or dates.

The article template should include breadcrumbs, an introduction answering the reader's question, a contents list for longer posts, clear sections, helpful visuals or comparisons, source references where needed, related service links, related articles, and one relevant quotation or maintenance action. Add social previews and sharing controls that work without publishing scripts.

Publishing must persist beyond one browser: draft → content review → preview → publish/build → live verification. Drafts must be excluded from public pages, feeds, and sitemaps, and previews protected. Updates should preserve URLs; changed slugs need redirects. A scheduled publication feature must actually trigger a build or fetch on schedule.

Do not attach articles to the current generic SEO script unchanged: getPageKey() recognizes only the existing five inner pages and otherwise returns home. Without adapting or replacing that behavior, blog pages loading this script would receive the homepage's title and canonical URL. [Current page routing for SEO](https://github.com/elevationtechsa/elevation.tech.sa/blob/1b8a046cae44de89469a8833ca31125f7c31db11/assets/site-seo.js#L66).

The current admin screen is not a working CMS. Its management sections contain placeholder content, its login check is client-side, and public content readers use browser localStorage. Replace it with real authenticated publishing or remove it from the public build when GitHub is the publishing interface. [Admin placeholders](https://github.com/elevationtechsa/elevation.tech.sa/blob/1b8a046cae44de89469a8833ca31125f7c31db11/admin.html#L229), [browser-only content reader](https://github.com/elevationtechsa/elevation.tech.sa/blob/1b8a046cae44de89469a8833ca31125f7c31db11/assets/admin-content-renderer.js#L12).

Suggested initial Arabic articles, based on the existing services rather than researched search-volume estimates:

| Article | Relevant destination |
| --- | --- |
| كيف تختار مصعداً منزلياً مناسباً لفيلا في الرياض؟ | Home elevators |
| ما العوامل التي تحدد تكلفة تركيب المصعد؟ | Installation / quotation |
| ماذا يشمل عقد صيانة المصاعد؟ | Maintenance |
| علامات تدل على حاجة المصعد إلى فحص متخصص | Maintenance inquiry |
| تحديث المصعد أم استبداله: كيف تقارن الخيارات؟ | Modernization |
| مصاعد المستشفيات: عوامل الاختيار للمباني الطبية | Hospital elevators |
| خطوات تجهيز المبنى لتركيب مصعد جديد | Installation |
| دراسة حالة لمشروع موثق من مشاريع الشركة | A verified project page |

Have an appropriately qualified person review safety-related content; focus on user decisions and professional service, with no do-it-yourself repair instructions. Publish genuine examples and questions customers ask, then prioritize subsequent topics using Search Console and actual inquiry data.

**Measurement and delivery order**

GA4 and GTM defaults are empty in site-integrations.js. Meta Pixel is already embedded separately in the public HTML. Centralize configuration and avoid adding duplicate initialization through another loader. Track article engagement, service-page clicks, quotation starts, phone/WhatsApp opens, and confirmed inquiries separately. Do not infer that a WhatsApp message was sent from a window.open call.

| Stage | Deliverables | Acceptance |
| --- | --- | --- |
| 1. Repair | Domain redirect completed; broken links, mislabeled contact actions, inquiry handling, and accurate event definitions remain | Domain checks passed; remaining link/inquiry checks follow implementation |
| 2. Improve | Arabic metadata, language annotations, heading structure, contrast/accessibility, production CSS, shared components | Crawl/metadata checks pass; browser and keyboard review completed |
| 3. Publish | Blog index/template, publishing workflow, first reviewed articles, sitemap/RSS updates, key service detail pages | Content visible in a fresh browser; unique article titles/canonicals; no draft leakage |
| 4. Iterate | Search Console review, real-user performance, inquiry quality, additional case studies/content | Compare results against a recorded baseline and prioritize measured problems |

Maintain a repeatable link crawl, metadata check, build validation, and a small set of meaningful browser checks: mobile menu, article navigation, product/project links, language switching, and inquiry handling. Verify responsive layouts at representative phone, tablet, and desktop widths. No backend submissions or messages were sent during this audit.
