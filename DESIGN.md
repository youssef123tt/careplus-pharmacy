---
name: CarePlus
description: Everyday healthcare products in Kuwait, each drawn as the printed face of its medicine carton, with bundle offers as strength chips.
colors:
  ground: "#e6e9ec"
  board: "#ffffff"
  board-2: "#f2f4f6"
  ink: "#15181c"
  ink-2: "#4a535b"
  ink-3: "#59626a"
  line: "#cdd3d8"
  line-2: "#b3bbc2"
  action: "#0b6b4c"
  action-hover: "#08573d"
  action-ink: "#ffffff"
  save: "#0b6b4c"
  danger: "#b3192e"
  danger-soft: "#fbe9eb"
  warn: "#8a4a00"
  warn-soft: "#fff3df"
  focus: "#0b6b4c"
  ground-dark: "#0e1113"
  board-dark: "#171b1f"
  board-2-dark: "#1f2429"
  ink-dark: "#e7eaed"
  ink-2-dark: "#a9b1b8"
  ink-3-dark: "#8f979e"
  line-dark: "#2b3238"
  line-2-dark: "#3d454c"
  action-dark: "#3cc28f"
  action-hover-dark: "#5fd3a6"
  action-ink-dark: "#062419"
  save-dark: "#5fd3a6"
  danger-dark: "#ff8692"
  danger-soft-dark: "#3a1a1f"
  warn-dark: "#f3c06a"
  warn-soft-dark: "#33270f"
  focus-dark: "#5fd3a6"
  band-orange: "#e8850c"
  band-blue: "#1f6fc4"
  band-red: "#c62839"
  band-violet: "#7048b6"
  band-olive: "#6f8f1f"
  band-magenta: "#b8336a"
  band-slate: "#4f5d6b"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.01em"
  numeral:
    fontFamily: "Barlow Condensed, Barlow, ui-sans-serif, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 0.95
    fontFeature: "tnum"
  heading-ui:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.625
  body-ui:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  carton: "3px"
  inset: "2px"
  swatch: "1px"
spacing:
  chip-gap: "6px"
  sm: "12px"
  md: "16px"
  card: "20px"
  lg: "24px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    typography: "{typography.body-ui}"
    rounded: "{rounded.carton}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.carton}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.board-2}"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.carton}"
    padding: "10px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.board-2}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.board}"
    rounded: "{rounded.carton}"
    padding: "10px 16px"
  strength-chip:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.carton}"
    padding: "12px 16px 14px"
  strength-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
  strength-chip-compact:
    rounded: "{rounded.carton}"
    padding: "6px 10px 8px"
  brand-chip:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.carton}"
    padding: "0 12px"
    height: "36px"
  brand-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
  carton-card:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.carton}"
    padding: "20px"
  input:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.carton}"
    padding: "10px 12px"
    height: "40px"
  header:
    backgroundColor: "{colors.board}"
    height: "64px"
---

# Design System: CarePlus

## Overview

**Creative North Star: "The Medicine Carton"**

Every product is the face of its medicine carton. A product card is a white printed board on a cool carton-grey counter: a flat full-strength category band across the top, the product name set in condensed capitals like box copy, a flat-print illustration in an inset window, a dashed perforation, and below it the side panel where the bundle offers sit as strength chips. The same carton grammar scales out to the product page (band, image window, perforation, spec panel), the cart (band-capped thumbnails, an ink-banded order summary) and the admin list (band-capped thumbnails).

The world is dense, legible and quiet in the way a pharmacy shelf is: near-black ink on white board, hairline edges, tight 3px corners, and exactly one green that means "act". Colour beyond that green is printed category colour only, and it reads the same in both themes. Numbers are the loudest type on the page because prices and pack counts are what the shopper has to trust. The dark theme is the same carton printed on dark board: semantic tokens invert, bands do not.

The world explicitly refuses the gradient hero and the soft, heavily rounded card grid of generic storefronts.

**Key Characteristics:**
- Cool carton-grey ground, white board surfaces, 1px board edges, 3px corners.
- One pharmacy green, for actions only.
- Flat full-strength category bands from a fixed set of seven hues, identical in light and dark.
- Barlow Condensed uppercase for product names, page titles and numerals; Barlow for all UI copy.
- A dashed perforation rule separates a carton's face from its side panel.
- Selection is shown by inverting to ink, never by colour.
- Tabular figures on every price and quantity.

## Colors

A near-monochrome carton palette (cool greys and near-black ink) with one functional green and a fixed set of printed band hues.

### Primary
- **Pharmacy Green** (`action`; dark theme `action-dark`): the only interactive colour. Add-to-cart, primary buttons, the wordmark cross and the "Plus" of the wordmark, the caret, text selection tint, and the focus outline (`focus`). Hover deepens to `action-hover` in light and brightens to `action-hover-dark` in dark. Text on green is `action-ink` (white in light, deep green `action-ink-dark` in dark).
- **Saving Green** (`save`): the "Save N%" line on unselected strength chips. Same hue family as the action green; it marks a price benefit, not an action.

### Secondary
- **Printed Category Bands**: flat, full-strength hues printed on the carton, assigned per category and unchanged across themes.
  - **Vitamin Orange** (`band-orange`): vitamins, supplements, nutrition.
  - **Personal-care Blue** (`band-blue`): personal care, skin, hygiene, hair, oral.
  - **First-aid Red** (`band-red`): first aid, devices, wound care. Also caps the error state.
  - **Baby Violet** (`band-violet`): baby, mother, kids.
  - **Herbal Olive** (`band-olive`): herbal, natural, organic.
  - **Beauty Magenta** (`band-magenta`): beauty, cosmetics.
  - **Label Slate** (`band-slate`): pool member for unmatched categories.
  Unknown categories take a stable hue from this set by hashing the name.

### Neutral
- **Carton Grey** (`ground` / `ground-dark`): the page counter every board sits on.
- **White Board** (`board` / `board-dark`): cards, header, footer, panels, inputs, unselected chips.
- **Inset Board** (`board-2` / `board-2-dark`): image windows, hover fills, skeletons, tier tags in admin.
- **Carton Ink** (`ink` / `ink-dark`): headings, product names, body emphasis, and the fill of every selected chip, the active nav underline and the cart count badge.
- **Secondary Ink** (`ink-2` / `ink-2-dark`): supporting copy, inactive tabs and nav, labels.
- **Tertiary Ink** (`ink-3` / `ink-3-dark`): counts, meta, placeholder, per-pack figures.
- **Board Edge** (`line` / `line-dark`): the 1px edge of every board, section dividers, tab baselines.
- **Strong Edge** (`line-2` / `line-2-dark`): chip and input outlines, card hover edge, the perforation dash.

### Status
- **Danger** (`danger`, `danger-soft`): destructive buttons, remove/delete hover fill, validation text, unavailable cart lines.
- **Caution** (`warn`, `warn-soft`): notices such as "no offers available" and cart adjustments, always as a soft fill with warn text.

### Named Rules
**The One Green Rule.** Green means "act" or "you save". It never decorates, never tints a surface, never colours a band.

**The Printed Band Rule.** Category colour appears only as printed matter: the top band of a carton, the underline of a category tab, a small square swatch beside a category name. Bands keep their light-theme hex in dark mode and never carry text.

**The Ink Selection Rule.** Selected or active state is ink fill with board text (strength chips, brand chips, cart badge) or an ink underline (nav, admin tabs). Never green, never a band hue.

## Typography

**Display Font:** Barlow Condensed 600/700 (with Barlow, ui-sans-serif)
**Body Font:** Barlow 400/500/600/700 (with ui-sans-serif, system-ui)

**Character:** Condensed uppercase capitals read like the printed copy on a medicine box; plain Barlow carries the interface without competing. Both are self-hosted via Fontsource.

### Hierarchy
- **Display** (Barlow Condensed 700, 2.6rem mobile to 3.75rem from 640px, line-height 0.95, uppercase, +0.01em): storefront and product-page h1.
- **Headline** (Barlow Condensed 700, 3rem, 0.95, uppercase): cart and admin page titles.
- **Title** (Barlow Condensed 700, 1.5rem to 1.9rem, 0.95, uppercase): product names on cards (1.9rem) and cart lines (1.5rem), dialog titles (1.875rem), empty/error state titles, order summary heading.
- **Numeral** (Barlow Condensed 700, tabular): pack counts on strength chips (1.75rem compact, 3rem full) and grand totals (2.25rem).
- **UI Heading** (Barlow 600, 1rem to 1.125rem): results heading, offer section heading, admin section headings. Sentence case.
- **Body** (Barlow 400, 15px, line-height 1.625, max 65ch): product descriptions and the storefront lede.
- **Body UI** (Barlow 400 to 600, 14px): buttons, chips, nav, form fields, meta lines.
- **Label** (Barlow 600, 11px to 12px): pack unit and "Save N%" on compact chips, badges, hints, footer copy. Sentence case.

### Named Rules
**The Carton Copy Rule.** Uppercase condensed type is reserved for product names, page and dialog titles, and numerals. All UI copy, labels and headings below the title tier stay sentence-case Barlow. There are no letter-spaced uppercase labels anywhere.

**The Tabular Rule.** Every price, quantity, count and total uses tabular figures, and prices are always shown as bundle totals in KWD with three decimals.

## Layout

A single centred column, max 1280px, with 16px side padding on mobile and 24px from 640px; main content sits 24px below the header on mobile and 36px from 640px. The header is a sticky 64px board strip.

The storefront stacks title band, filter toolbar (category tabs on their own row; brand chips and a 288px search share a row from 1024px), then a product grid of 1 / 2 (640px) / 3 (1024px) columns with 16px gaps, 20px from 1024px. Category tabs and brand chips scroll horizontally on mobile with bleed to the viewport edge.

Product details split 5:6 from 1024px with the carton panel sticky at 96px from the top. Cart and admin forms use a main column plus a 360px (cart) or 320px (admin) side panel from 1024px; side panels are sticky in the cart. Card internal padding is 20px; chip gaps are 6px compact and 10px full; section rhythm runs 24 to 28px with a 1px `line` divider under page titles.

## Elevation & Depth

Flat by default. Depth comes from board-on-ground tonal contrast and 1px edges, not shadow. Two shadows exist, each tied to a state: a soft lift when a carton card is hovered, and a deep drop under the modal confirm dialog. The sticky header uses 95% board with a light backdrop blur.

### Shadow Vocabulary
- **Carton lift** (`box-shadow: 0 6px 18px -10px rgb(0 0 0 / 0.35)`): carton card hover only, paired with the edge shifting from `line` to `line-2`.
- **Dialog drop** (`box-shadow: 0 24px 60px -20px rgb(0 0 0 / 0.5)`): the native confirm dialog, over a 55% black backdrop.

### Named Rules
**The Flat Board Rule.** Boards rest flat on the counter. Shadow appears only as a response to hover or modality; resting surfaces never carry one.

## Shapes

Tight, printed corners. Every board, button, chip, input and notice uses the 3px carton radius; image windows and thumbnails use 2px; band swatches 1px. Nothing is pill-shaped or circular. Boards clip their contents so the category band runs edge to edge across the top (10px tall on cards and the cart summary, 12px on the product page, 6px on cart thumbnails, 4px on admin thumbnails). The perforation is a 1px dashed `line-2` rule, inset to the card padding, separating face from side panel. Empty states use a dashed `line-2` board edge, as an unfolded carton.

## Components

### Buttons
Solid, compact and square-shouldered.
- **Shape:** carton corners (3px), 10px by 16px padding, 14px semibold, 8px icon gap, 150ms colour transition.
- **Primary:** pharmacy green fill with `action-ink` text; hover to `action-hover`. Used for add-to-cart (which carries the selected bundle total in the label) and every create/save action.
- **Secondary:** white board with an 80%-ink 1px outline and ink text; hover fills `board-2`.
- **Ghost:** no fill, `ink-2` text; hover fills `board-2` and darkens to ink. Destructive ghosts (Remove, Delete) switch text to `danger` with a `danger-soft` hover fill.
- **Danger:** `danger` fill with board text, used only inside the confirm dialog.
- **Focus / Disabled:** 2px `focus` outline at 2px offset; disabled drops to 45% opacity with a not-allowed cursor. Loading shows a spinning loader before the label.
- Links that navigate use the same primary and secondary looks while keeping link semantics.

### Strength Chips (pack offers)
The signature control: bundle offers printed as strength chips on the carton's side panel.
- **Structure:** a native radio group. Pack count in condensed numerals is the largest figure, unit ("pack"/"packs") beside it, bundle total in KWD under it, then per-pack price (full size) and "Save N%".
- **Unselected:** board fill, `line-2` outline, ink text, saving in `save` green; hover darkens the outline to ink.
- **Selected:** inverts to ink fill with board text; secondary lines at 75 to 90% board.
- **Press / Focus:** scales to 0.97 on press; keyboard focus draws a 2px green outline around the chip.
- **Compact (cards):** 92px minimum columns, 6px gap. **Full (product page):** 150px minimum columns, 10px gap.

### Chips (brand filter)
- **Style:** 36px tall, carton corners, 12px horizontal padding, 14px medium text with a tabular `ink-3` count.
- **State:** unselected board with `line-2` outline (hover to ink outline); active inverts to ink fill with board text.

### Category Tabs
Categories read as coloured carton tabs on a `line` baseline: each tab carries a 2px underline in its band hue that thickens to 3px on hover and 5px when active; the "All" tab uses ink. Active tab text is ink semibold; inactive `ink-2`. The product count sits beside each label in tabular `ink-3`.

### Cards / Containers
- **Corner Style:** carton (3px).
- **Background:** white board on carton grey.
- **Shadow Strategy:** flat; carton lift on hover only (see Elevation).
- **Border:** 1px `line`, `line-2` on hover. Unavailable cart lines tint the edge with 60% danger.
- **Internal Padding:** 20px.
- **Carton card anatomy:** band, then a two-column face (condensed name, brand in semibold ink, category in `ink-2`; a 3:4 inset illustration window 120px wide, 136px from 640px), perforation, strength chips, then a full-width add-to-cart with a ghost "Details" link.

### Inputs / Fields
- **Style:** white board, 1px `line-2` outline, carton corners, 10px by 12px padding, 14px text, `ink-3` placeholder, green caret. Search is 40px tall with a leading 16px icon.
- **Focus:** the edge shifts to ink and the field carries the global 2px `focus` outline at 2px offset; a border shift alone is not a sufficient focus indicator.
- **Error:** outline turns `danger`, with a 12px danger message beneath.
- **Quantity stepper:** a single 80%-ink-outlined unit with minus / 48px tabular number / plus segments divided by `line` hairlines; 40px tall (32px small).

### Navigation
A sticky 64px white board strip with a bottom `line` edge. Left: the wordmark, a 28px green rounded-square cross plus "CARE" in ink and "PLUS" in green condensed capitals. Right: Shop, Admin, a hairline divider, the theme toggle (36px ghost icon button, moon/sun), and Cart with an ink count badge (2px corners, board text, tabular). Links are 14px semibold `ink-2`, ink on hover; the active link gets a 3px ink underline flush with the header's bottom edge. Below 640px, Shop and Admin collapse to icons. Admin sections use the same idea as a tab row with a 2px ink underline.

### Feedback States
- **Empty:** dashed-edge board, outline package icon in `ink-3`, condensed title, short `ink-2` message, optional secondary action.
- **Error:** solid board capped with a 6px first-aid-red band, alert icon in danger, condensed title, retry as secondary.
- **Notice:** `warn-soft` fill with `warn` text, carton corners.
- **Loading:** green spinner with a 14px label; filters use `board-2` pulsing skeletons; refetching grids fade to 55%.
- **Toasts:** themed to match the current theme, bottom-right.

### Product Illustrations
Flat-print SVGs on a 400 by 400 canvas, drawn like the pack itself: white bodies with a 6px slate outline (`#5e6a76`), label stripes in slate, and accent fills led by the matching category band hex (vitamin orange, personal-care blue, first-aid red), with a few neutral material tints (skin, capsule gold, probe grey). No gradients, filters, opacity or shading. They sit in the `board-2` image window with `object-contain`; a missing image falls back to an outline image-off icon in `ink-3` on `board-2`.

## Do's and Don'ts

### Do:
- **Do** set every surface as white board (`board`) on carton grey (`ground`) with a 1px `line` edge and 3px corners.
- **Do** cap every product representation (card, detail panel, cart thumbnail, admin thumbnail) with its category band, edge to edge.
- **Do** separate a carton's face from its offers or totals with the 1px dashed `line-2` perforation.
- **Do** show selection by inverting to ink fill with board text.
- **Do** set product names, page titles and numerals in Barlow Condensed 700 uppercase at line-height 0.95; keep everything else in sentence-case Barlow.
- **Do** use tabular figures on every price and quantity, and show prices as bundle totals in KWD with three decimals.
- **Do** keep bands at their fixed hex in both themes; only semantic tokens switch under `[data-theme='dark']`.
- **Do** draw product illustrations as flat print: white body, slate outline, band-hue accents.

### Don't:
- **Don't** build a gradient hero or a soft, heavily rounded card grid; corners stop at 3px and nothing is pill-shaped.
- **Don't** use green for anything that is not an action, focus, or a saving.
- **Don't** put text on a band or use a band hue for a button, chip fill or selected state.
- **Don't** add resting shadows; shadow is for card hover and the modal dialog only.
- **Don't** introduce new band hues outside the fixed seven, or reassign a known category's hue.
- **Don't** add gradients, filters or shading to product illustrations.
