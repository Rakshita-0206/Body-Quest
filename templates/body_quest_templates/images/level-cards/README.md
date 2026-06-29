# Level select card images

Drop your artwork here and update `LEVEL_CARD_UI` in `frontend/js/state.js` if you change filenames or extensions.

| Level | Replace this file | Suggested theme |
|-------|-------------------|-----------------|
| 1 | `level-1-card.png` | Green/cyan · body map / organ identification |
| 2 | `level-2-card.png` | Gold/yellow · diagnosis / brain / food chain |
| 3 | `level-3-card.png` | Red · critical care / heart / emergency |

**Recommended size:** 400×400 px (square) or similar aspect ratio. PNG or WebP with transparent background works best.

Until your PNGs are added, the app loads the matching `.svg` placeholders in this folder.

After adding PNGs, set each `visual` path in `js/state.js` (`LEVEL_CARD_UI`) to e.g. `images/level-cards/level-1-card.png`.
