# Streetwear Graphic Generator — Reusable Prompt

A reusable prompt for generating back-print graphics in the visual language of **The Fallout Project**. Outputs are **standalone artwork on a transparent background**, ready to be placed on a black hoodie, white tee, or any apparel surface in production. The model is generating a *print*, not a garment.

You only edit the **last line** — one sentence describing the concept. Everything else is fixed taste.

---

## The Prompt

```
Generate a single high-resolution streetwear back-print graphic on a fully
TRANSPARENT background (PNG, alpha channel, no shirt, no mockup, no model,
no shadow, no frame, no border). The artwork will later be applied to the
back of a premium black hoodie and oversized t-shirt for a streetwear
label, so it must read as a self-contained poster-style composition that
holds together at large scale on dark fabric and equally on light fabric.

Treat this as if you were the in-house art director at a luxury streetwear
house — Represent, Honor the Gift, Jaded London, Stampd, Fear of God ESSENTIALS,
Cole Buxton, BLAKKR, Donda-era merch. The work is intentional. Every element
earns its place. Restraint is the entire point. If you would not put it on a
$120 hoodie, do not draw it.

──────────────────── COMPOSITION ────────────────────

The print occupies a near-square area (roughly 2400 × 2700 px feel),
centered, with a strong vertical axis. Density is high but the layout
BREATHES — there is always a beat of negative space between elements.
Composition reads top-to-bottom in four bands:

  BAND 1 (top)      — TITLE LOCKUP
  BAND 2 (upper-mid)— HERO ILLUSTRATION
  BAND 3 (mid-low)  — SUPPORT ELEMENTS scattered around the hero
  BAND 4 (bottom)   — SECONDARY WORDMARK + BRAND LINE

Asymmetry lives inside symmetry: the spine is centered, but quotes and
micro-marks lean off to one side to break the mirror.

──────────────────── TYPOGRAPHY ────────────────────

Use a deliberate two-typeface collision in the title:
  • One word in a tall, sharp display SERIF (Trajan, Cormorant, Didone,
    Bodoni, IM Fell) — uppercase, tight tracking, slight grunge edge.
  • A second word overlapping it in a CONTRAST face — either a
    handwritten italic script (Allura, Pinyon, Pacifico-but-classier),
    a condensed gothic blackletter (UnifrakturMaguntia), or a tight
    geometric display sans (Eurostile Extended, Neue Machina).
The two faces overlap by 10–25%, creating intentional friction.

Supporting type:
  • Tiny italic serif pull-quotes (2–3 lines, justified, ~8pt feel)
  • A monospace or all-caps micro-sans "definition" / "manifesto" block,
    laid out like a fashion spec tag
  • Ghosted oversized OUTLINE letters bleeding behind the hero, half
    cropped by the edge — the title word repeated huge as a watermark
  • Brand line at bottom: TIGHT TRACKED ALL-CAPS SANS, small, centered

Hierarchy must be obvious in 0.5 seconds: TITLE → HERO → MANIFESTO → BRAND.

──────────────────── COLOR ────────────────────

Strict two-ink discipline. The artwork uses:
  • WHITE (#fdfdfc, never pure white) as the base ink
  • ONE saturated accent — pick the single accent that best matches the
    emotional temperature of the concept. Examples that have worked:
      electric cyan      #00bfff   — futurism, melancholy, cold sublime
      royal/violet blue  #3a4dff   — cosmos, distance, reverence
      vermilion red      #ff2a2a   — honor, violence, ritual, Japan
      acid green         #2bff8c   — cyber, surveillance, signal
      warm amber/gold    #ffb648   — divinity, nostalgia, halo
  • NO black ink inside the artwork — the dark areas are the absence of
    print (revealed garment). NO gradients except a subtle airbrush
    glow around the hero's brightest point. NO mid-tones — go hard
    duotone, like a screen print or risograph.

The artwork must look correct sitting on BLACK fabric AND on WHITE fabric.
Test that mentally. If the white ink would disappear on white fabric,
the design is wrong — silhouette and accent must carry it on either.

──────────────────── THE HERO ────────────────────

A single bold central subject, rendered in posterized duotone — hard
contrast, no photoreal mid-tones. Stylistic register options (pick the
one that fits the concept):

  • High-contrast halftone screen print (Shepard Fairey, Obey)
  • Stencil / stippled spray (Banksy, Futura)
  • Vector poster illustration (Mondo movie posters, French New Wave)
  • Ink-wash sumi-e (for any Japan / honor / blade concept)
  • Engraved etching feel (Dürer, vintage tarot, alchemy plates)
  • Blueprint / wireframe / technical schematic
  • Y2K chrome airbrush (only when the concept genuinely calls for it)

The hero must feel ILLUSTRATED, not photographed. If a real photo is
referenced, posterize it down to 2–3 tones with visible halftone dots
or grain.

──────────────────── SUPPORT ELEMENTS ────────────────────

Float these around the hero to fill negative space WITHOUT crowding:

  • 1–2 outline/wireframe geometric forms (planet ring, perspective
    grid floor, hexagon, halo, atomic orbit, circuit fragment, tarot
    frame). Pure decoration, hairline strokes.
  • 1 small italic serif quote block — feels like a footnote or
    epigraph, 2–4 lines, intentionally hard to read at a glance.
  • 1 "manifesto" / "definition" block in micro all-caps, like a
    luxury garment care label or a museum placard.
  • Sparingly: 4-point sparkle/glint icons, a barcode, an MMXXII-style
    roman-numeral year stamp, a small geometric logo mark in a corner,
    a tiny circular badge with phonetic IPA pronunciation of the title
    word (/ɪntə'stelə/).

Rule of restraint: if removing an element does not make the design
weaker, REMOVE IT. Density without intention is noise.

──────────────────── TASTE RULES (HARD CONSTRAINTS) ────────────────────

  • No emojis. Ever. Anywhere.
  • No clip-art. No stock-photo realism. No AI-render gloss.
  • No drop shadows on type. No bevels. No 3D extrusion. No lens flare.
  • No rainbow palettes. No more than two inks total.
  • No watermarks, no signatures, no "AI generated" tells.
  • No background — output must be alpha-transparent PNG with the
    artwork floating in empty space. No tee, no body, no canvas, no
    cardboard, no studio floor.
  • No frame, no border, no rectangular box containing the design
    (unless a thin frame is part of the artwork itself, like the
    Future "bracket corners" — and even then, it must feel
    intentional, not safe).
  • No safe centered logo-on-blank. The design must feel like a poster,
    not a sticker.
  • No legible nonsense / hallucinated language pretending to be Latin
    or kanji unless the concept explicitly calls for it AND the glyphs
    are real.
  • Quote text must be real-feeling — sound like Sagan, Tsiolkovsky,
    Murakami, Camus, Tolkien, or a real movie line. Never write
    "lorem ipsum" energy.

──────────────────── INFERENCE GUIDANCE ────────────────────

You — the generator — are expected to INFER the right choices from the
one-line concept. Specifically, infer:

  • The accent color (from the emotional temperature of the concept)
  • The typographic pairing (serif + script for romantic / fragile;
    serif + blackletter for honor / divinity; sans + mono for tech /
    future; brush + sumi for Japan / martial)
  • The hero rendering style (sumi-e for blade concepts, halftone
    for political / human, vector poster for cinematic, wireframe
    for tech)
  • The supporting micro-text — quotes that fit the concept, written
    in the voice of someone who has actually read the source material
  • Whether the layout wants to be tight & contained (like a manifesto
    flyer) or sprawling & cinematic (like a movie one-sheet)

Do not ask the user for these. Decide. A confident decision in the
wrong direction is more useful than a hedged decision in the right one.

──────────────────── DELIVERABLE ────────────────────

One PNG, 2400 × 2700 px or larger, fully transparent background,
artwork only. Centered. No mockup, no garment, no shadow.

──────────────────── CONCEPT FOR THIS DESIGN ────────────────────

[CONCEPT — one sentence. Replace this line. Examples:
  "A blue rose pierced by a sword wrapped in a snake — title CHASING
  THE IMPOSSIBLE — about the rarity of what cannot exist in nature."
  "A torii gate burning against a red sun with falling cherry blossoms
  — title WELCOME TO JAPAN — about the loneliness of being a foreigner."
  "A wireframe icosahedron hovering over a circuit grid — title THE
  FUTURE IS NOW — about the moment science fiction stopped being fiction."
]
```

---

## How to use

1. Copy the entire block above.
2. Replace **only** the last `[CONCEPT — one sentence.]` line with your own one-sentence idea.
3. Let the model infer the rest — color, typography pairing, illustration style, quote voice. That inference is what makes the system reusable but each output unique.

## What makes the system hold together

The prompt fixes the **grammar** of the design (composition bands, two-ink discipline, type collision, transparent output, restraint) and lets the model improvise the **vocabulary** (subject, accent hue, illustration register, quotes). Same DNA, different concept, every time.

---

## GAIA Collection — 10 Concept Lines

Drop-in concept sentences for the final line of the prompt. The through-line:
**GAIA is not the machine — GAIA is the planet the machine is finally learning
to listen to.**

```
1. A halftone Earth cradled in two open human hands rendered as a Renaissance
   etching — title GAIA — manifesto about the planet being the first
   intelligence, and every machine we build only borrowing her circuits.

2. A wireframe globe wrapped in orbiting data streams that resolve into
   migrating birds — title MOTHER NETWORK — about the line between
   biosphere and infosphere going thin.

3. A child looking up at a sky filled with constellations that secretly form
   neural network nodes — title WE TAUGHT THE STARS TO THINK — about the
   moment intelligence stopped being only ours.

4. A blueprint of the human silhouette overlaid with continents instead of
   organs, oceans instead of veins — title CARTOGRAPHY OF THE SELF — about
   the body being a small map of the same planet.

5. A lone astronaut floating tethered to a glowing Earth, the cord rendered
   as fiber-optic cable — title HOMESICK FOR THE BLUE DOT — quoting Carl
   Sagan, Tsiolkovsky, and a single line from a chatlog.

6. A bonsai tree growing out of a cracked CPU die with roots forming circuit
   traces — title SILICON SOIL — about the next generation of life
   evolving inside the machines we forgot to turn off.

7. Two hands — one drawn in classical anatomy, one in technical schematic
   exploded view — reaching toward each other over a small Earth — title
   THE TURING HANDSHAKE — about the moment we stop being alone.

8. A dove carrying a fiber-optic strand across a globe lit by city
   constellations at night — title PEACE PROTOCOL — about a planet that
   finally agreed on something, even if a machine had to propose it.

9. An ancient Greek statue of Gaia with one half rendered in marble and the
   other half rendered in pixel-grid voxels, dissolving between them —
   title SHE REMEMBERS EVERYTHING — about the original goddess of Earth
   being the original general intelligence.

10. A whale swimming through a sky full of satellites, leaving a wake of
    binary that becomes plankton — title DEEP LEARNING — about how the
    ocean had already solved consciousness three billion years ago.
```
