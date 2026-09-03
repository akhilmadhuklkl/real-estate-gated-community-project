# Design System Specification

**Task:** T0007 — Build design system  
**Owner:** AKHIL  
**Status:** Completed  
**Version:** 1.0.0  
**Source:** Quiet Tropical Modernism visual direction

## 1. Purpose

This specification turns the accepted visual direction into reusable rules for design and engineering. The canonical machine-readable values live in `design-system/tokens.json`. Components must use semantic tokens and documented variants instead of introducing isolated colors, spacing, typography, radii, or motion values.

## 2. Foundations

### Semantic color roles

| Role | Light surface | Dark surface | Purpose |
| --- | --- | --- | --- |
| Page background | Ivory 50 | Forest 950 | Primary canvas. |
| Surface default | White | Forest 900 | Cards, panels, menus, and dialogs. |
| Surface quiet | Sand 100 | Forest 700 | Section contrast and supporting information. |
| Text primary | Charcoal 900 | Ivory 50 | Main content and headings. |
| Text secondary | Stone 600 | Ivory 200 | Supporting copy and metadata. |
| Action primary | Forest 700 | Ivory 50 | Primary controls and links. |
| Action emphasis | Terracotta 600 | Terracotta 400 | Limited high-attention action or state. |
| Border subtle | Stone 300 | Forest 500 | Structural dividers and card boundaries. |
| Focus indicator | Terracotta 600 | Terracotta 400 | Keyboard focus ring with sufficient separation. |

Dark surfaces are reserved for the header, footer, selected editorial sections, image overlays, and the future concierge shell. The primary reading experience remains warm and light.

### Typography roles

| Style | Family | Responsive size | Weight | Line height | Usage |
| --- | --- | --- | --- | --- | --- |
| Display XL | Display | 46–88 px | 500 | Tight | Homepage hero only. |
| Display L | Display | 38–64 px | 500 | Heading | Major page headings. |
| Heading 1 | Display | 34–52 px | 600 | Heading | Primary content sections. |
| Heading 2 | Display | 30–44 px | 600 | Heading | Subsections and feature stories. |
| Heading 3 | Body | 22–28 px | 600 | Compact | Cards and structured panels. |
| Body large | Body | 18–20 px | 400 | Body | Introductions and key narrative. |
| Body | Body | 16–18 px | 400 | Body | Standard reading text. |
| Supporting | Body | 14–16 px | 400 | Compact | Captions, assistance, and metadata. |
| Label | Body | 12–14 px | 600 | Compact | Controls, tags, and overlines. |

Use fluid sizes through `clamp()` between the stated mobile and desktop values. Keep body copy between 45 and 75 characters per line.

### Spacing

- Use the four-pixel scale from `space.1` through `space.36`.
- Component interiors normally use 12, 16, 24, or 32 px.
- Related content groups use 24–40 px.
- Major sections use 56–144 px based on viewport.
- Do not create arbitrary spacing unless a documented optical adjustment is required.

### Grid

| Viewport | Columns | Gutter | Page padding |
| --- | --- | --- | --- |
| Under 640 px | 4 | 16 px | 20–24 px |
| 640–1023 px | 8 | 20–24 px | 32–48 px |
| 1024–1279 px | 12 | 24 px | 48–64 px |
| 1280 px and above | 12 | 24–32 px | 64–88 px |

Content is capped at 1440 px. Long-form reading content is capped at 720 px.

### Shape and elevation

- Default card radius: 8 px
- Prominent media and panels: 12 px
- Controls: 4–8 px depending on size
- Tags and small badges: pill radius
- Prefer a border or tonal surface before applying shadow
- Use low shadow only for raised menus and sticky elements
- Use medium shadow only for dialogs, sheets, and the active preview panel

## 3. Accessibility contract

- Target WCAG 2.2 AA.
- Body text contrast must be at least 4.5:1; large text and essential UI graphics at least 3:1.
- Focus must remain visible with a two-pixel indicator and two-pixel offset where possible.
- Interactive targets must be at least 44 by 44 CSS pixels.
- All functionality must work with keyboard, touch, and zoom to 200%.
- Color cannot be the only state indicator.
- Icons that convey meaning require accessible names; decorative icons are hidden from assistive technology.
- Dialogs and sheets trap focus while open, close with Escape, restore focus, and have an accessible title.
- Live validation is announced without moving focus unexpectedly.
- Reduced-motion preferences remove nonessential transforms, parallax, and animated scrolling.

## 4. Component inventory

### Actions

#### Button

Variants: `primary`, `secondary`, `quiet`, `inverse`, and `destructive`.

Sizes: `sm` 40 px, `md` 44 px, and `lg` 52 px minimum height. Buttons support leading or trailing icons, loading state, disabled state, and full-width mobile presentation. Loading must preserve the label width and expose progress semantically.

#### Text link

Default links use an underline or another persistent non-color affordance in body text. Navigation links may use weight and an animated landscape line, provided focus and current-page states remain explicit.

#### Icon button

Requires an accessible name and 44 px target even when the visible icon is smaller. Tooltips supplement but never replace accessible labels.

### Navigation

#### Site header

States: transparent-over-hero, light scrolled, dark scrolled, and menu open. Desktop shows primary destinations and the visit action. Mobile uses a labelled menu control and never hides contact alternatives.

#### Mobile navigation drawer

Uses a modal dialog pattern, logical heading structure, visible close control, current-page state, and grouped conversion actions. Background content becomes inert.

#### Breadcrumbs

Appear on detail and utility pages. Collapse intermediate segments carefully on mobile while preserving the current page announcement.

#### Section navigation

Use for long Community, Amenities, Specifications, and Legal pages. The current section must be communicated beyond color.

### Content

#### Editorial section

Variants: text-first, image-first, full-bleed, split, quote, and evidence panel. Maintains reading width and a consistent responsive stacking order.

#### Villa card

Contains one image, villa name, up to three approved facts, optional status, comparison control, and one primary detail action. The entire card must not become one ambiguous link when it contains multiple controls.

#### Amenity card

Contains image or illustration, name, short description, and explicit delivery state. Proposed and delivered states must not rely only on color.

#### Fact item

Contains value, unit, label, optional qualification, source link, and reviewed date. Missing data displays “To be confirmed,” not zero or an empty decorative value.

#### Evidence tag

Variants: verified, temporary reference, proposed, estimated, superseded, and unavailable. Tags use icon, label, and semantic color together.

#### Gallery

Supports keyboard navigation, meaningful captions, media categories, image dimensions, loading placeholders, and a dialog viewer. Autoplay is excluded.

#### Plan viewer

Provides zoom in, zoom out, reset, level or plan selection, accessible point list, legend, source, and unavailable state. It must remain useful without drag gestures.

### Forms

#### Text field and text area

Persistent visible label, optional indicator, concise assistance, error relationship, and success state where useful. Placeholder text is never the only label.

#### Select and combobox

Native select is preferred for short stable lists. Searchable comboboxes require full keyboard and screen-reader behavior.

#### Date and time selection

Provide native-compatible entry plus an accessible picker. Disallow unavailable dates without hiding them and expose timezone or operating hours.

#### Consent control

Unchecked by default. The label states what will be shared and why, with a direct privacy link.

#### Form summary

Submission errors produce a focusable summary linking to invalid fields. Success uses a reference identifier without echoing sensitive values.

### Feedback and overlays

#### Alert

Variants: information, success, warning, and error. Alerts include a visible heading for complex messages and do not disappear before they can be read.

#### Toast

Used for supplementary confirmation only. Critical errors remain in context. Pause dismissal on hover or focus and respect extended reading needs.

#### Dialog

Used for focused decisions and media viewing. Avoid stacking dialogs. Destructive actions require clear consequences and deliberate confirmation.

#### Bottom sheet

Primary mobile container for the future contextual preview. It has an accessible title, drag affordance plus explicit close control, snap states, and full-screen fallback.

#### Skeleton

Matches the final layout, avoids pulsing under reduced motion, and never replaces meaningful error or empty states.

### Concierge-ready components

#### Conversation launcher

Placed clear of mobile action bars and consent controls. Label it with its purpose rather than using an unexplained symbol.

#### Message

Variants: visitor, assistant, system, error, and escalation. Factual answers accommodate citations and last-updated details.

#### Suggested prompt

Short action control that submits only after intentional activation. Suggestions must not imply unsupported capabilities.

#### Contextual preview

Allowed deterministic types: villa summary, comparison, floor plan, master plan, gallery, amenity, location map, document, evidence reference, and contact card. Arbitrary generated markup is prohibited.

#### Contact card

Displays only approved professional information with role, channel, hours, language, source, and explicit user action before transmission.

## 5. State matrix

Every interactive component must define:

- Default
- Hover when applicable
- Focus-visible
- Active or pressed
- Selected or current when applicable
- Loading
- Disabled
- Read-only when applicable
- Success
- Warning
- Error
- Empty or unavailable

Disabled controls must not be used to hide missing requirements. Explain why an action is unavailable when the reason is useful to the visitor.

## 6. Responsive component rules

- Preserve information priority when changing layout; do not merely reorder by source markup convenience.
- Convert split editorial layouts to a deliberate image-and-copy sequence on mobile.
- Avoid horizontal page overflow at 320 CSS pixels.
- Comparison tables may scroll within a labelled region while their attribute labels remain understandable.
- Sticky mobile actions must respect safe-area insets and never cover focused fields or footer content.
- Navigation, gallery, plans, forms, and preview panels require tests at mobile, tablet, laptop, and wide-desktop widths.
- Container queries may be used for reusable cards and panels; page layout uses documented viewport breakpoints.

## 7. Iconography

- Use a consistent two-pixel outlined icon family.
- Default visible sizes: 16, 20, and 24 px.
- Do not mix filled, photographic, and outlined icon styles without a semantic reason.
- Avoid using amenity icons as the only description; always include text.
- Directional icons must adapt correctly for right-to-left language support when introduced.

## 8. Imagery tokens

| Ratio | Intended use |
| --- | --- |
| 16:9 | Hero, community overview, video, and wide architectural stories. |
| 3:2 | Villa galleries and editorial features. |
| 4:5 | Villa and amenity cards. |
| 1:1 | Material details, compact media, and contact portraits when approved. |

Use `object-fit: cover` only with an intentional focal point. Structured media records should store desktop and mobile focal coordinates, descriptive alternative text, caption, source, rights status, and reviewed date.

## 9. Motion tokens and rules

- Fast 160 ms: hover, focus, and small control feedback.
- Standard 240 ms: menus, filters, tabs, and disclosure transitions.
- Editorial 560 ms: restrained section and image reveals.
- Standard easing: `[0.2, 0, 0, 1]`.
- Entrance easing: `[0.16, 1, 0.3, 1]`.
- Avoid animating layout dimensions when transform or opacity achieves the same communication.
- Do not delay navigation, form submission, or access to critical information for animation.

## 10. Content language

- Prefer precise, calm, human language.
- Use sentence case for headings and controls.
- Buttons describe their result: “Explore villas,” “View floor plan,” or “Schedule a visit.”
- Avoid “Click here,” unexplained abbreviations, artificial urgency, unsupported superlatives, and investment guarantees.
- Clearly qualify temporary, proposed, estimated, unavailable, and last-reviewed information.

## 11. Temporary prototype treatment

Preview builds using temporary reference assets display a persistent development notice. Components consuming those assets must receive an evidence state so the notice cannot be removed solely through presentation code.

Generated concept imagery is always labelled as a concept and cannot use the verified-project treatment.

## 12. Engineering contract

- Generate application theme values from `design-system/tokens.json` during scaffolding.
- Components consume semantic aliases rather than raw palette values.
- No component introduces an undocumented breakpoint, z-index, spacing step, font, or animation duration.
- Build accessible primitives before page-specific compositions.
- Keep content and evidence metadata outside presentational components.
- Cover variants and states with component examples or focused tests.
- Run automated accessibility checks and complete keyboard review for every interactive primitive.
- Record intentional exceptions in a reviewed decision document.

## 13. Acceptance evidence

T0007 is complete because the design system provides:

- Machine-readable color, typography, spacing, sizing, radius, shadow, motion, breakpoint, and layering tokens.
- Semantic usage rules for light and dark surfaces.
- A responsive grid and type hierarchy.
- Specifications for navigation, content, property, form, feedback, overlay, and concierge-ready components.
- A consistent state matrix.
- WCAG 2.2 AA interaction requirements.
- Responsive, imagery, iconography, motion, language, and prototype rules.
- A direct engineering contract for application scaffolding.
