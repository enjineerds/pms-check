---
name: PMS Check
description: Quote checker for new car owners in the Philippines. Version 3, Glossy White - cool-white surfaces, black-glass buttons, calm verdict colors.
colors:
  ground: "#F1F3F8"
  surface: "#FFFFFF"
  ink: "#0A0B0F"
  ink-soft: "#4B5160"
  ink-faint: "#5F6575"
  line: "#E1E5EE"
  accent: "#FFC52E"
  accent-ink: "#12161A"
  required: "#0F8A5F"
  required-bg: "#E3F5EC"
  optional: "#A8620A"
  optional-bg: "#FCEFD8"
  skip: "#CC2F27"
  skip-bg: "#FCE5E2"
  panel: "#14171B"
  panel-ink: "#F3F5F6"
  panel-soft: "#A3AAB1"
  panel-line: "#2C3238"
  yes-bright: "#3DDC97"
  ask-bright: "#FFB547"
  no-bright: "#FF6B5E"
  gloss-top: "#050607"
  gloss-bottom: "#6B6E75"
  sheen: "#FFFFFF"
  haze: "#3B4A8A"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "34px"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "24px"
  lead:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "17px"
  read:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "16px"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "15px"
  small:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "13px"
  caption:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "12px"
rounded:
  sm: "6px"
  md: "24px"
  xl: "36px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
components:
  button-primary:
    backgroundColor: "{colors.gloss-top}"
    textColor: "{colors.panel-ink}"
    rounded: "{rounded.pill}"
    typography: "{typography.body}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  toast:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.panel-ink}"
    rounded: "{rounded.pill}"
  badge-required:
    backgroundColor: "{colors.required-bg}"
    textColor: "{colors.required}"
    rounded: "{rounded.pill}"
  badge-optional:
    backgroundColor: "{colors.optional-bg}"
    textColor: "{colors.optional}"
    rounded: "{rounded.pill}"
  badge-skip:
    backgroundColor: "{colors.skip-bg}"
    textColor: "{colors.skip}"
    rounded: "{rounded.pill}"
---

# Design System: PMS Check

> Source: Doop canvas "PMS Check - quote checker for new car owners (PH)" at localhost:4300, pages "Version 3 - Glossy white", "Version 3 - Components", "Version 3 - Landing page", token theme `v3`. App code does not exist yet (`app/web`, `app/mobile`, `app/backend` are empty), so this file records the design as drawn, not as shipped. Token hex values are exact (read from the Doop Tokens panel, theme v3). Shadow, gradient, and sizing details are read from screenshots and are marked approximate.

## Overview

**Creative North Star: "The Showroom Glass"**

A new car owner holds a service quote they cannot judge. The interface should feel like the showroom they just bought from: bright, clean, a little glossy, and honest. Surfaces are cool-white paper floating on a pale blue-grey ground. The one dark, high-gloss object on any screen is the action: a black-glass pill button that reads as the thing to press. Everything else stays quiet so the verdict colors (required, optional, skip) carry the meaning.

The product is a checker, so the system is calm and trustworthy before it is expressive. Density is low to medium on mobile (390 x 844 frames), with generous radii, single-column flow, and large tap targets. Copy is Tagalog-first (Taglish), conversational, and lowercase-friendly ("Piliin ang kotse mo", "Check a casa quote"). Peso amounts are shown plainly (PHP 2,450) next to a short verdict word ("Say yes").

Version 3 replaces earlier directions: Version 1 (original) and Version 2 (Auto Shop Tracker style, flatter and yellow-forward). Glossy White keeps the yellow accent only as a small signal, not as the main button.

**Key Characteristics:**
- Cool-white surfaces (#FFFFFF) on a blue-tinted ground (#F1F3F8). Never warm cream, never pure grey.
- One black-glass gradient button per screen (gloss-top #050607 to gloss-bottom #6B6E75).
- Verdicts as paired text + tint colors: green required, amber optional, red skip.
- Large soft radii (24px cards, 36px sheets, full pill buttons), 6px only for tiny inner chips.
- Plus Jakarta Sans throughout, weight carries hierarchy rather than a second family.
- A dark panel (#14171B) is reserved for emphasis moments: the advisor line preview on the landing page, toasts, tickets.

## Colors

Cool, near-white neutrals with a blue cast, one warm yellow signal, and three restrained verdict hues. Each verdict has a text/icon color and a pale background tint, plus a "bright" variant used only on the dark panel.

### Primary
- **Black Glass** (gloss-top #050607 to gloss-bottom #6B6E75): The primary button fill, a top-to-bottom gradient that reads as polished dark glass. It is the single dominant action on a screen. A white sheen (#FFFFFF at low alpha) rides the top edge (approximate).
- **Showroom Yellow** (#FFC52E, ink #12161A): The signal accent. Small marks, the "Say yes" style highlights on dark surfaces, callout dots. Text on it is always accent-ink #12161A. Not used for large fills or the main CTA in v3.

### Secondary (verdicts)
- **Required Green** (#0F8A5F on #E3F5EC): Service is in the manufacturer's schedule. "Say yes." Check icon in a pale green disc.
- **Optional Amber** (#A8620A on #FCEFD8): Useful but not due, or "ask first." Question mark in a pale amber disc.
- **Skip Red** (#CC2F27 on #FCE5E2): Not in the schedule or upsell. "Hindi muna, salamat po." X icon in a pale red disc.

### Tertiary (on dark panel only)
- **Yes Bright** (#3DDC97), **Ask Bright** (#FFB547), **No Bright** (#FF6B5E): Lifted verdict colors for text and dots on the #14171B panel, where the light-mode hues would lose contrast.
- **Haze Blue** (#3B4A8A): Atmospheric tint behind glossy surfaces (approximate use: soft glow in hero art and tile depth). Never a text or button color.

### Neutral
- **Ground** (#F1F3F8): App and page background, a faintly blue off-white.
- **Surface** (#FFFFFF): Cards, list containers, sheets, inputs.
- **Ink** (#0A0B0F): Primary text, headings, selected controls.
- **Ink Soft** (#4B5160): Secondary text, descriptions.
- **Ink Faint** (#5F6575): Captions, helper text, inactive tab labels. Kept dark enough to stay readable on white.
- **Line** (#E1E5EE): Hairline dividers and card edges.
- **Panel** (#14171B), **Panel Ink** (#F3F5F6), **Panel Soft** (#A3AAB1), **Panel Line** (#2C3238): The inverted dark set for panels, toasts, tickets.
- **Sheen** (#FFFFFF): Highlight layer for gloss effects.

### Named Rules
**The One Glass Rule.** One black-glass element is the primary action per screen. A second black gradient on the same screen is a bug. Secondary actions are white pills with a line border.

**The Verdict Is Color Plus Word Rule.** Required, optional, and skip are never conveyed by color alone. Pair the tint with an icon (check, question, X) and a word.

**The Blue-White Rule.** Neutrals carry a cool blue cast (#F1F3F8 ground, #E1E5EE lines). Do not mix in warm greys or beige.

## Typography

**Display Font:** Plus Jakarta Sans (with sans-serif)
**Body Font:** Plus Jakarta Sans (with sans-serif)
**Label/Mono Font:** Plus Jakarta Sans (the `font-mono` token also maps to it; no true monospace is used)

**Character:** One geometric humanist sans, tight and friendly. Large bold headings with tight tracking over regular-weight body. In the Components page, the one-line schedule note under a line item ("In Toyota's schedule. Skipping can void warranty.") renders in a serif face; this appears to be a fallback or deliberate editorial voice and is not a tokenized family. Confirm before reusing.

### Hierarchy
- **Display** (bold/extra-bold, 34px, tight line-height ~1.1): Screen questions on mobile, e.g. "Anong kotse ang minamaneho mo?"
- **Title** (bold, 24px): Section and sheet titles.
- **Lead** (medium, 17px): Intro sentences under a title.
- **Read** (regular, 16px): Longer explanation text, quote reasoning. Keep to about 60-70ch.
- **Body** (regular to medium, 15px): List rows, form values, button labels.
- **Small** (regular, 13px): Row sub-labels (variant, year range, "Hakbang 1 ng 4").
- **Caption** (medium, 12px): Tab labels, section labels ("Variant", "Taon"), badges.

### Named Rules
**The Weight, Not Family Rule.** Hierarchy comes from size and weight in Plus Jakarta Sans. Do not add a second typeface to create emphasis.

## Layout

Mobile-first. The reference frame is 390 x 844. Single column, page padding 16px, content cards inset on the #F1F3F8 ground. Header is a back chip + title + step counter ("Hakbang 1 ng 4") at the top; the primary glass button is pinned to the bottom with safe-area breathing room; a three-tab bar (Home, Car, Account) appears on main screens.

Spacing scale: 4, 8, 12, 16, 24, 32 (space-1 to space-6). Use 16 inside rows, 24 between groups, 32 between major blocks. List rows are separated by hairline #E1E5EE rather than gaps.

The landing page (desktop and mobile frames) follows a long vertical story: hero with phone mockup, a three-card explainer, a "three steps" row of phones, a dark section (#14171B) with two phones, an FAQ grid, and a dark waitlist capture card. Desktop uses a centered container with two-column hero and three-up card grids; mobile collapses to one column with stacked phones.

## Elevation & Depth

Hybrid: soft tonal layering plus glass highlights. White surfaces sit on the blue-grey ground with very faint, wide, low-opacity shadows (approximate: large blur, around 4-10% black). The black-glass button carries a stronger, slightly tighter drop shadow and an inner top highlight so it looks raised and polished. The toast and ticket on #14171B are the highest elevation and have a darker, larger shadow.

Depth is state-driven: surfaces are quiet at rest, and elevation or contrast rises for the primary action and transient overlays (toast, sheet).

### Named Rules
**The Gloss Is Earned Rule.** Gradient plus sheen belongs only to the primary button, the dark toast, and the hero car image. Cards and rows stay matte white.

## Shapes

Soft and rounded. 24px (md) for cards and list containers, 36px (xl) for large sheets and hero containers, 999px (pill) for buttons, chips, toasts, and badges, 6px (sm) for small inner elements. Selected states use a 1.5-2px ink (#0A0B0F) outline on a white pill or row (see "Variant" radio rows). Verdict icons sit in circular tinted discs. The hero car is a cut-out, softly lit photograph, never framed in a box.

## Components

### Buttons
- **Shape:** Full pill (999px), full-width on mobile, about 48-52px tall (approximate).
- **Primary (button-primary):** Black glass gradient (#050607 to #6B6E75), text Panel Ink #F3F5F6, medium/semibold 15px, centered label ("Check a casa quote", "Magpatuloy"). Soft drop shadow, inner white sheen on the top edge.
- **Secondary (button-secondary):** White (#FFFFFF) fill, ink text, 1px line (#E1E5EE) or ink border; used for "Bumalik sa..." and alternate paths.
- **Pressed / Hover:** Slight darkening and shadow tightening (to be confirmed in code; not shown on canvas).
- **Disabled:** Not drawn. Use ink-faint text on #E1E5EE.

### Tile (V3Tile)
- **Corner Style:** 24px.
- **Background:** White gradient into faint haze at the lower edge, with a car icon at top-left and a state word at top-right ("Off").
- **Content:** Large title bottom-left ("Check a casa quote"), 17-24px bold.
- **Shadow:** Faint, wide, bottom-weighted.

### Header (V3Header)
- **Style:** Circular back chip (light haze fill), title ("10,000 km PMS") in bold body, subtitle in small ink-faint ("Bayan Motors - Today").

### Line Item (V3Line)
- **Style:** Row on white: verdict disc (24px circle, tinted) + title ("Change oil + oil filter") + price right-aligned (PHP 2,450) + verdict word beneath price ("Say yes" in required green) + one-line schedule note below. Hairline divider between rows.

### Toast (V3Toast)
- **Style:** Dark pill (#14171B with glass gradient), panel-ink text ("Aircon cleaning added - PHP 1,800"), and an "Undo" chip on the right (lighter circle/pill, #2C3238 range). Appears bottom-center above the tab bar.

### Tab Bar (V3TabBar)
- **Style:** White bar, three items (Home, Car, Account) with line icons above 12px captions. Active item in ink; inactive in ink-faint.

### Inputs / Search and Selection
- **Search field:** White pill-rounded field on a white card, magnifier icon, placeholder in ink-faint ("Hanapin ang modelo mo").
- **Choice rows (variant):** White pill rows with radio dot; selected row gets an ink outline and filled dot.
- **Year chips:** Pill chips; selected = filled ink with white text, unselected = light-grey fill.
- **Segmented control (Transmisyon):** Light-grey track, selected segment white with soft shadow.
- **Model list:** Single white 24px container, rows with car icon, bold model name, small variant/year line, chevron, hairline separators.

### Car Image (V3Car)
- **Style:** Cut-out white sedan on white/haze background with soft floor shadow. The only photographic element in-app.

### Advisor Panel (signature)
- **Style:** Dark (#14171B) rounded card listing the advisor's proposed lines in panel-ink, used on the "Ipakita sa advisor" screen and in the landing hero. Verdict labels use the bright variants (Yes/Ask/No Bright).

## Do's and Don'ts

### Do:
- **Do** keep the page ground #F1F3F8 and cards #FFFFFF; the contrast between them is the base depth cue.
- **Do** use exactly one black-glass primary button per screen, full-width at the bottom on mobile.
- **Do** pair every verdict color with its icon and word (required = check + "Say yes", optional = question, skip = X).
- **Do** use the paired text/background tokens (e.g. #0F8A5F on #E3F5EC) for verdict badges; use the bright variants only on #14171B.
- **Do** round generously: 24px cards, 36px sheets, pill buttons and chips.
- **Do** write UI copy in Tagalog/Taglish by default, short and polite ("po", "salamat"), with peso amounts shown as PHP with thousands separators.
- **Do** keep Ink Faint (#5F6575) for captions so contrast on white stays readable.

### Don't:
- **Don't** use Showroom Yellow (#FFC52E) as a large fill or as the main CTA in Version 3; that was Version 2's look.
- **Don't** add a second gradient or glossy element to cards, rows, or inputs.
- **Don't** introduce warm greys, beige, or pure black (#000000) backgrounds; the dark surface is #14171B.
- **Don't** convey required/optional/skip by color alone.
- **Don't** add a second typeface; the serif note line in the Components page is unconfirmed and should not spread.
- **Don't** put light-mode verdict text colors on the dark panel, or bright variants on white.
- **Don't** use hard 1px black borders on cards; use #E1E5EE hairlines or tonal separation.

## Open items

- Exact shadow, gradient angle, and sheen alpha values are not in the Doop Tokens panel. Capture them when the first component code exists, then re-run `/impeccable document` to refresh this file and write the `.impeccable/design.json` sidecar.
- Hover, pressed, focus, and disabled states are not drawn in the canvas.
- Confirm whether the serif line in the line-item note is intended.
