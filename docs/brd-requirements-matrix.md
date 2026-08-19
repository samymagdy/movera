# MOVERA BRD requirements matrix

This matrix records the implementation status for the approved local phase. The approved visual system remains developer-owned; content and behavior are the editable boundary.

| BRD ID | Requirement summary | Status | Current route/component/model | Smallest required change | Design-impact risk | Tests |
|---|---|---|---|---|---|---|
| BR-HD-001–019 | Locale-aware logo, search, language, navigation, submenus, responsive header | Partial | `PublicHome`, `PublicContentPage`, locale routes | Keep compact header; add destination routes and keyboard/native details menus | Low | Header links, locale switch, mobile menu |
| BR-GS-001–003 | Grouped locale-aware global search | Existing | `/[locale]/search`, `GET /api/v1/search` | Search `news`, `blogs`, `projects`, `services`, `products`, `pages`, `jobs`, `innovation` | Low | Query, grouped results, empty/error |
| BR-HP-001–010 | Approved homepage composition and required company content | Partial | `PublicHome`, homepage document | Keep homepage fixed; expose mapped company content through About/region routes | Low | Homepage baseline screenshots; route smoke |
| BR-CEO-001 | History, vision, CEO message, leadership, clients/certificates | Existing | `/[locale]/about/[slug]`, `pages[]` | CMS-editable locale records | Low | Four locale detail routes |
| BR-DA-001/002 | Delivery advisory service | Partial | `/[locale]/services/[slug]` | Replace the neutral localized CMS record with approved service content | Low | Detail route and CMS save |
| BR-DP-001/002 | Digital products service | Partial | `/[locale]/services/[slug]` | Replace the neutral localized CMS record with approved service content | Low | Detail route and CMS save |
| BR-RI-001/002 | Responsible intelligence service | Partial | `/[locale]/services/[slug]` | Replace the neutral localized CMS record with approved service content | Low | Detail route and CMS save |
| BR-PRD-001–007 | Product list/details, media, contact context, brochure boundary | Partial | `/[locale]/products`, `products[]` | Add product media/document fields and compact contact behavior | Medium | List/detail, missing-media state |
| BR-GP-001–009 | Project list/details, filters, related services/products | Partial | `/[locale]/projects`, `projects[]` | Keep rail/detail shell; expose filter chips and detail routes | Low | Filters, clear state, empty state |
| BR-IH-001–004 | Innovation Hub content and media | Existing | `/[locale]/innovation-hub`, `innovation[]` | CMS-editable localized record | Low | List/detail route |
| BR-RH-001–003 | Independent regional hub content | Existing | `/[locale]/regions/{hub-a,hub-b,hub-c}`, `regions[]` | Region-specific structured footer/contact content | Low | All three locale routes |
| BR-CR-001–004 | Careers search/filter, job detail, apply form, private CV storage | Partial | `/[locale]/careers`, `POST /api/v1/careers/:jobId/apply`, `CareerApplication` | Add keyword/region filtering and focused backend validation | Medium | Multipart validation; no public CV endpoint |
| BR-NW-001/002 | News listing/detail and CMS CRUD | Existing | `/[locale]/news`, `news[]` | Native newsletter form and detail routing | Low | Listing/detail and localized links |
| BR-BG-001/002 | Blog listing/detail and CMS CRUD | Existing | `/[locale]/blogs`, `blogs[]` | Native newsletter form and detail routing | Low | Listing/detail and newsletter |
| BR-FT-001–014 | Footer, legal routes, region content, social links, chatbot | Partial | Footer in public shells, `pages[]` | Keep existing footer treatment; link legal content | Low | Legal routes and social URLs |
| BR-CK-001–004 | Cookie policy and consent persistence | Partial | `PublicHome` consent block, cookie route | Complete customize/preferences version record and native copy | Low | First visit, reopen, locale |
| BR-UE-001–008 | Newsletter prompt with local persistence | Missing | Newsletter API and inline content form | Add deferred trigger controller without changing modal styling | Medium | Dismiss/submit suppression |
| BR-RSP-001–004 | Desktop/tablet/mobile, no overflow, locale URLs | Partial | Existing CSS and new content CSS | Verify 1536, 768, 390 for affected routes | Low | Playwright screenshots and overflow check |
| BR-ML-001–004 | Independent English/Arabic/French/Dutch records | Existing | `LocalizedText`, CMS locale tabs, `locales` | No runtime translation or silent fallback | Low | Four-locale smoke |
| BR-SEO-001–004 | Localized URLs, sitemap, robots, canonical/hreflang | Partial | `sitemap.ts`, `robots.ts`, route metadata | Add per-content metadata and alternate links | Low | Sitemap/robots response |
| BR-CMS-001/002 | Structured content-only CMS | Partial | `AdminApp`, aggregate SiteData document | Add collection tabs and keep layout tokens source-owned | Low | Save/readback each collection |
| NFR-CM-004 | Local validation and private uploads | Existing | Zod API schemas, `CareerApplication`, `storage/private` | Keep private storage outside static root | Medium | File type/size and endpoint access |
| NFR-WB-001/002/004 | Performance, responsive quality, no console errors | Partial | Web app and API | Run rendered QA after each slice | Low | Build + Playwright console/visual checks |
| BR-CMS-003–012 | Auth/workflow/menu builder | Deferred | Not implemented by design lock | Production phase only | None | Deferred |
| BR-TPI-001–004 | Analytics/marketing integrations | Deferred | No third-party scripts | Provider adapter after consent/production approval | None | Deferred |
| Production storage/infrastructure | PostgreSQL, HTTPS, monitoring, email/CRM | Partial | PostgreSQL/Redis/storage adapters and deployment runbooks | Complete controlled migrations, identity integration, and hosted observability | Medium | Production release checklist |
