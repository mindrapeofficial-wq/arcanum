# Visual & audio FX layer

Presentation-only. None of this reads or writes gameplay state; it decorates what the UI already shows.

| Piece | File | Notes |
| --- | --- | --- |
| Look & feel (Cinzel display type, gold-foil titles, filigree panels, school accent, gate atmosphere) | `assets/css/polish.css` | Loaded last. Fonts are self-hosted in `assets/fonts/` (SIL OFL). |
| Particles, click sparks, cursor-tracking rim, staggered view entrance, HUD value flash, scroll line | `assets/js/fx.js` | Reads only `#mage-school`, `.resource-strip` text and `#view-host` mutations. |
| Procedural sounds (`whoosh`, `chime`, `levelup`, `impact`, `cast`, `coin`, `portal`) | `assets/js/audio.js` | WebAudio synthesis, no asset files. Voices take `(ctx,out,t)` so they can be rendered in an `OfflineAudioContext`. |

## Triggers

`toast()` dispatches `arcanum:success` / `arcanum:error`. Other events the audio layer listens to:
`arcanum:levelup`, `arcanum:impact`, `arcanum:cast`, `arcanum:coin`, `arcanum:portal`.
Currently fired: combat chronicle opened (`impact`), expedition entered (`portal`), attribute spent (`cast`).

## Switches

- Automatically off for `prefers-reduced-motion`.
- Manual: `localStorage["arcanum.fx.v1"]="off"` (or `ArcanumFx.setEnabled(false)`).
- School accent (`html[data-school]` + `--accent`) follows the player's school: viridia, aurea, cineria, nadir, oneiria.
