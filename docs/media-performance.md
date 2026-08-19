# Local media and image performance

All visual assets used by the public site and CMS are served from this repository or from the API's local `/uploads/` storage. The application does not use remote fonts, image CDNs, or externally hosted visual assets.

## Upload pipeline

Admin image uploads are processed by `POST /api/v1/media` before they are saved:

- accepted input formats are JPEG, PNG, WebP, GIF, and AVIF;
- the source is limited to 32 MB and 100 million pixels;
- EXIF orientation is applied and the source file is never published;
- the longest output dimension is capped at 2,400 pixels;
- local WebP variants are generated at 320, 640, 960, 1,280, 1,920, and up to 2,400 pixels;
- the largest generated variant is the lightbox/full-size source, while normal page images use `srcset` and `sizes` to request the smallest suitable variant;
- generated files are served with immutable one-year caching and are addressed by UUID-based names.

The public `MediaImage` component is the standard renderer for CMS media. It carries the media metadata, responsive variants, lazy/eager loading choice, and optional detail-page lightbox source together. New UI should use it instead of manually rendering a CMS media URL.

## Static asset policy

Static visual assets should be local WebP (or SVG for icons/illustrations). Superseded large raster sources are excluded from Docker builds in `.dockerignore`; their optimized local replacements remain in `apps/web/public`. The API also canonicalizes previously saved paths such as the old hero, assistant, logo, portrait, and triangle raster URLs to the current WebP paths when site data is read.

Run the repository guard after adding or changing media:

```bash
npm run media:check
```

It checks the active public raster budget, verifies local visual references, rejects external visual/font URLs, and confirms the API upload optimizer guards are present. It is a budget and regression guard—not a promise of a fixed Lighthouse grade on every device or network. Measure the deployed build with the target viewport and network profile as well.

## Adding a new image

Use the Admin → Settings or structured content uploader. Do not commit an 8K/16K source into `apps/web/public` and do not paste a remote image URL into a media field. If a prebuilt static asset is needed, convert it to an appropriately sized local WebP, reference it from the owning component/data source, run `npm run media:check`, and verify desktop/mobile rendering plus the detail-page lightbox where applicable.
