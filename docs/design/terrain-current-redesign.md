# Terrain-/Current-Redesign

Stand: 12. Juli 2026

## Gestaltungsprinzip

Angelkompass kombiniert zu etwa 80 Prozent eine helle, bildstarke Terrain-Oberfläche mit zu etwa 20 Prozent einem dunklen Current-Fokusmodus. Terrain trägt Marke, Orientierung und normale Arbeitsseiten. Current bleibt auf das praktische Ergebnis-Briefing und die Am-Wasser-Karte begrenzt. Dekorative Konturlinien sind keine Karten-, Tiefen- oder Sensordaten.

Zander ist ausschließlich ein UI-Teaser mit dem Status „Bald verfügbar“. Die produktiven Fachtypen und Regeln bleiben auf Barsch und Hecht begrenzt.

## Design-Tokens

| Rolle | Hell | Dunkel |
| --- | --- | --- |
| Hintergrund | `#F4F5F0` | `#071413` |
| Oberfläche | `#FFFFFF` | `#0D2422` |
| Erhöhte Fläche | `#F8F9F5` | `#11312E` |
| Text | `#0D1716` | `#F2F7F3` |
| Waldgrün | `#123C36` | `#C5F22D` |
| Signal-Lime | `#B7E21D` | `#C5F22D` |
| Current-Mint | `#48D9C2` | `#48D9C2` |

Überschriften verwenden Barlow Condensed, UI und Fließtext Manrope. Beide werden über Fontsource lokal gebündelt; die OFL-Lizenzen liegen unter `public/fonts/licenses/`.

## Bildassets und Herkunft

Alle vier Bilder wurden mit der integrierten ImageGen-Skill neu für dieses Projekt erzeugt. Es wurden keine Bilder Dritter kopiert. Die freigegebenen Projektdateien liegen unter `public/assets/terrain/`.

- `lake-morning.avif` / `lake-morning.webp`: heller mitteleuropäischer Süßwassersee am Morgen, leichter Nebel, Schilf, Steine und Wald; keine Menschen, Ausrüstung, Boote, Gebäude oder Texte.
- `perch.webp`: monochrome moderne Naturkundezeichnung eines Europäischen Barschs (`Perca fluviatilis`) in Seitenansicht.
- `pike.webp`: monochrome moderne Naturkundezeichnung eines Hechts (`Esox lucius`) in Seitenansicht.
- `zander.webp`: monochrome moderne Naturkundezeichnung eines Zanders (`Sander lucioperca`) in Seitenansicht.

Die Fischzeichnungen wurden einzeln auf flachem Magenta-Hintergrund erzeugt, mit dem ImageGen-Chroma-Key-Helfer freigestellt, auf 720 Pixel Breite skaliert und als WebP optimiert. Sie sind in der Oberfläche dekorativ; Fischname und Status stehen immer zusätzlich als Text bereit.

## Bildprompts

### Hero

```text
Use case: photorealistic-natural
Asset type: responsive homepage hero for the Angelkompass mobile outdoor PWA
Primary request: A premium natural freshwater lake shoreline at clear early morning, with light mist hovering over still water, low reeds and a few dark rocks in the foreground, a forested shore fading into soft fog in the distance. The scene should feel authentically Central European and suitable for predator fishing from the bank, calm but purposeful.
Style/medium: high-end editorial outdoor photography, realistic natural textures, subtly desaturated, no cinematic fantasy grading.
Composition/framing: wide 3:2 landscape, camera at standing eye level from the bank. Keep the left-center and upper-left calm and low-detail for bold website copy; place the strongest forest mass and shoreline detail toward the right and lower edge. Must crop well to a tall mobile hero using object-position center.
Lighting/mood: bright diffused dawn light through mist, clear enough for strong dark text overlay, tranquil premium atmosphere.
Color palette: mineral grey-green water, deep forest green, pale fog, muted stone; no bright accent colors in the photograph.
Constraints: freshwater lake only, no people, no boat, no buildings, no fishing gear, no fish visible, no mountains, no ocean, no text, no logo, no watermark.
```

### Barsch

```text
Use case: scientific-educational
Asset type: monochrome species illustration for a premium modern fishing app selection card
Primary request: A single European perch (Perca fluviatilis) shown in an accurate full-body side profile, facing right. Recognizable high-backed body, two dorsal fins with the first clearly spiny, subtle vertical flank bars, compact head, and correct fin placement.
Style/medium: refined contemporary natural-history ink illustration, crisp charcoal linework with restrained grey stippling, modern editorial rather than antique engraving.
Composition/framing: fish centered horizontally, entire body and every fin visible, generous even padding, no crop.
Background: perfectly flat solid #ff00ff chroma-key background for removal, without shadows, gradients, texture or lighting variation.
Constraints: exactly one anatomically plausible European perch; no water, plants, hook, lure, label, text, logo, border or watermark.
```

### Hecht

```text
Use case: scientific-educational
Asset type: monochrome species illustration for a premium modern fishing app selection card
Primary request: A single northern pike (Esox lucius) shown in an accurate full-body side profile, facing right. Recognizable elongated torpedo body, long flattened snout, dorsal and anal fins positioned far back near the tail, correct tail and fin placement, and a subtle pale spot pattern.
Style/medium: refined contemporary natural-history ink illustration, crisp charcoal linework with restrained grey stippling, modern editorial rather than antique engraving.
Composition/framing: fish centered horizontally, entire body, snout, tail and every fin visible, generous even padding, no crop.
Background: perfectly flat solid #ff00ff chroma-key background for removal, without shadows, gradients, texture or lighting variation.
Constraints: exactly one anatomically plausible European northern pike with a naturally relaxed mouth; no water, plants, hook, lure, label, text, logo, border or watermark.
```

### Zander

```text
Use case: scientific-educational
Asset type: monochrome species illustration for a premium modern fishing app selection card
Primary request: A single European zander (Sander lucioperca) shown in an accurate full-body side profile, facing right. Recognizable elongated but deep-bodied percid shape, pointed head with large eye, two clearly separate dorsal fins with the first spiny and second soft-rayed, subtle vertical flank bands, forked tail, and correct fin placement.
Style/medium: refined contemporary natural-history ink illustration, crisp charcoal linework with restrained grey stippling, modern editorial rather than antique engraving.
Composition/framing: fish centered horizontally, entire body and every fin visible, generous even padding, no crop.
Background: perfectly flat solid #ff00ff chroma-key background for removal, without shadows, gradients, texture or lighting variation.
Constraints: exactly one anatomically plausible European zander with a naturally relaxed mouth; no water, plants, hook, lure, label, text, logo, border or watermark.
```

Die Designreferenz unter `.codex/generated_images/` wurde nur zur Abstimmung der Terrain-Richtung verwendet und ist kein Produktionsasset.
