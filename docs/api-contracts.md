# API contracts

- `GET /health` → `{ ok, data: { service, database, timestamp } }`
- `GET /api/v1/site` → complete `SiteData`
- `GET /api/v1/content/:type` → `ContentItem[]` for `news`, `projects`, or `services`
- `POST /api/v1/content/:type` and `PUT /api/v1/content/:type/:id` → validated `ContentItem`
- `DELETE /api/v1/content/:type/:id` → moves the item into the recoverable CMS Trash and returns its snapshot; full About pages remain lifecycle-locked
- `GET /api/v1/admin/trash` → Super Admin-only recoverable content snapshots
- `POST /api/v1/admin/trash/:type/:id/restore` → restores a trashed item to its original collection position and status
- `DELETE /api/v1/admin/trash/:type/:id` → permanently deletes one trashed item
- `DELETE /api/v1/admin/trash` with `{ ids?: string[] }` → permanently deletes selected items, or empties Trash when `ids` is omitted
- `PUT /api/v1/homepage` → validated homepage document in the next schema pass
- `POST /api/v1/media` → local upload URL and media ID
- `POST /api/v1/contact` → localized validation errors or submission ID
- `POST /api/v1/chat` → locale-aware answer and relevant local links

Shared field shapes live in `packages/contracts/src/index.ts`. The public and admin frontends call the backend only; neither accesses local storage directly.
