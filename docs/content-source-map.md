# MOVERA content source map

The committed MOVERA content baseline makes a fresh deployment render the same
four-language public experience and defines the structure expected by the CMS.

The API seed and refresh workflow read
`packages/contracts/src/starterSiteData.ts`. First-viewport copy is maintained
under `apps/web/content/home-first-viewport/locales`, and public editorial media
is stored under the application public directories. Keep factual claims,
customer names, credentials, certificates, and leadership profiles out of the
content model unless they are verified and approved.

Uploaded media is stored by the API under `storage/uploads` and served through
local URLs. Private files remain under `storage/private`. Keep these boundaries
separate when backing up or deploying the application, and never commit either
runtime directory to Git.
