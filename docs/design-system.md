# MOVERA design system

Tokens live at the top of `apps/web/app/globals.css`. The public palette is near-black navy (`--bg`), deep blue surfaces (`--surface`, `--surface-2`), cool white text, muted blue-gray copy, electric blue primary action, cyan edge light, and a restrained violet accent. The current system uses 22px presentation radii, 9–13px control radii, thin luminous borders, and soft ambient depth rather than heavy shadows.

The public type system uses a Segoe/Inter-compatible sans stack, with Arabic-specific line-height and letter-spacing adjustments under `.locale-ar`. Hero copy is fluid with `clamp()`, while controls remain compact. Buttons are 38–42px visible height with 44px-friendly touch layout. Motion is CSS-first and disables continuous animation under `prefers-reduced-motion`.

The CMS owns no design tokens. Its restrained light admin palette is local to `apps/admin/app/globals.css`.
