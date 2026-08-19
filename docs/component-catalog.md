# Component catalogue

| Component | Source | Responsibility |
|---|---|---|
| `PublicHome` | `apps/web/components/PublicHome.tsx` | Locale-aware public homepage composition, fixed dark/light artwork, header, news ticker, hero, sections, cookie UI, and chatbot |
| `HomepageFirstSection` | `apps/web/components/HomepageFirstSection.tsx` | First-view hero/triangle composition, regional hub selector, and statistics rail |
| `HomepageContentBands` | `apps/web/components/HomepageContentBands.tsx` | Renders the persisted homepage band order, visibility, localized copy, and selected live items for locations, news, products, projects, careers, and customers |
| `HomepageEditor` | `apps/admin/components/AdminApp.tsx` | Admin controls for homepage copy, bar visibility/order/item selection, statistics, localized hero media, and save/reset/undo/redo |
| `RotatingNewsSelector` | `apps/admin/components/AdminApp.tsx` | News-collection controls for selecting and ordering the headlines used by the independent public header ticker |
| `PublicContentPage` | `apps/web/components/PublicContentPage.tsx` | Locale-aware listing/detail shells, regional pages, search, newsletter and careers forms |
| `LogoMark`, icons | `apps/web/components/icons.tsx` | Developer-owned SVG marks and directional icons |
| `sampleData` | `apps/web/components/sampleData.ts` | Resilient local development fallback; API content remains authoritative when available |
| `AdminApp` | `apps/admin/components/AdminApp.tsx` | Structured content tables, locale fields, homepage editor, media focal-point editor |
| API store | `apps/api/src/store.ts` | Local persistence, content CRUD, search, and private submission adapters |

Public homepage bars are composed from the persisted `HomepageContent.bands` order. The header ticker reads `HomepageContent.latestNews`, which is selected in Admin → Content Editor → News and is independent from the homepage News band. Editors can change approved copy, links, bar visibility, selected item IDs, statistics, and media metadata/captions; layout and design tokens remain code-owned. The chatbot and cookie panel are local stateful interactions; the chat request is sent to `POST /api/v1/chat`.
