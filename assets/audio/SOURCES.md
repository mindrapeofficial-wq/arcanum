# ARCANUM audio sources

## Kenney Interface Sounds

The UI sound effects in `assets/audio/sfx/` come from Kenney's Interface Sounds pack.

- Original asset page: https://kenney.nl/assets/interface-sounds
- WAV mirror used for import: https://github.com/Calinou/kenney-interface-sounds
- License: CC0 1.0
- Attribution: not required, retained here for provenance.

### Imported mapping

| ARCANUM asset | Original file |
| --- | --- |
| `ui-select.wav.b64` | `select_001.wav` |
| `ui-confirm-1.wav.b64` | `confirmation_001.wav` |
| `ui-confirm-2.wav.b64` | `confirmation_002.wav` |
| `ui-open.wav.b64` | `maximize_004.wav` |
| `ui-error.wav.b64` | `error_008.wav` |

The files are stored as Base64 text so they can be committed through the project tooling. `assets/js/audio.js` decodes them locally into WAV Blob URLs at runtime.

## Existing music

`Dungeon Lobby.mp3` predates this change. Its provenance and license are intentionally not modified or asserted by this document.

## Procedural arcane voices

`whoosh`, `chime`, `levelup`, `impact`, `cast`, `coin` and `portal` in `assets/js/audio.js` are
synthesised at runtime with WebAudio (FM bells, filtered noise sweeps, sub thumps, generated reverb).
They use no external audio files and have no licensing requirements.
