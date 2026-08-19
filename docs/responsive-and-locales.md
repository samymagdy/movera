# Responsive and locale rules

The public layout is mobile-first with checkpoints at 480px, 650/820px, 1120px, and fluid desktop widths. Verify 320, 360, 390, 430, 768, 1024, 1280, and 1440px. The header becomes a deliberately designed full-height mobile menu rather than a squeezed desktop nav. Tables in the CMS collapse into stacked rows below 650px.

English, French, and Dutch are LTR. Arabic is RTL with its own font stack, line-height, heading tracking, news-row direction, and direction-aware arrows. Locale fields are independent; no runtime translation or silent language fallback is used. Seed copy is authored separately in all four locales.
