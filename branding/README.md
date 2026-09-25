# Lumenfall Branding

The production identity is the **Rift Crystal** mark in `lumenfall-mark.svg`.

## Direction

- A luminous faceted crystal is the core symbol.
- Two open gold arcs frame the crystal like a Rift rather than a shield or religious cross.
- A curved gold orbit gives the mark motion and separates it from the old geometric cross-like sigil.
- Primary production background: `#081027`.
- Gold / lumen accent: approximately `#E6B759`.
- Violet / prism accent: approximately `#8C78FF`.

## Usage

The SVG is the source of truth. Do not manually redraw the header logo or Android launcher icon.

- The in-game HUD and startup intro load this SVG directly.
- GitHub Actions rasterizes it with Sharp for the Android launcher icon.
- The adaptive-icon foreground uses extra safe-zone padding.
- The native Android splash is generated from the same mark on the production navy background.

This keeps the installed APK, startup sequence and in-game branding visually consistent.
