---
name: Bornfidis
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e5e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#46464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76767e'
  outline-variant: '#c6c6ce'
  surface-tint: '#575d78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141a32'
  on-primary-container: '#7c839f'
  inverse-primary: '#bfc5e4'
  secondary: '#5f5e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2dd'
  on-secondary-container: '#656461'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261900'
  on-tertiary-container: '#a17f3b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#bfc5e4'
  on-primary-fixed: '#141a32'
  on-primary-fixed-variant: '#3f465f'
  secondary-fixed: '#e5e2dd'
  secondary-fixed-dim: '#c8c6c2'
  on-secondary-fixed: '#1c1c19'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#e9c176'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5d4201'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e5e2e4'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: 0.1em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
  stack-xl: 80px
---

## Brand & Style

This design system establishes a visual language defined as a "luxury culinary operating system." It moves away from the frantic, high-density aesthetics of traditional SaaS to embrace an **Editorial Minimalism** that mirrors the experience of a high-end physical space. The brand personality is poised, authoritative, and operationally intelligent, designed for high-stakes hospitality environments where calm focus is a prerequisite for excellence.

The target audience consists of culinary professionals and hospitality executives who value precision and heritage. The emotional response is one of "ordered luxury"—every element feels intentional, from the generous whitespace that allows content to breathe, to the sharp, architectural lines that suggest structural integrity. The style avoids trendy rounded corners and vibrant shadows, opting instead for a flat, sophisticated structure that uses high-quality typography and cinematic imagery to communicate value.

## Colors

The palette is anchored in a high-contrast relationship between **Dark Navy** and **Bone White**, evoking the timelessness of a printed menu or a bespoke suit. 

- **Primary (Dark Navy):** Used for primary navigation, deep backgrounds, and high-emphasis headlines. It provides the grounding weight of the system.
- **Secondary (Bone White):** The primary canvas color. It is warmer and more sophisticated than pure white, reducing eye strain and feeling more "physical" than digital.
- **Tertiary (Muted Gold):** Reserved for "moments of excellence"—achievement markers, premium tier indicators, and subtle call-to-action highlights. 
- **Accent (Forest Green):** Used strategically for operational success states, culinary heritage elements, and subtle "on" indicators.
- **Neutrals:** We utilize a range of greys derived from the bone white hue to ensure dividers and borders feel like part of the organic environment rather than sterile digital lines.

## Typography

The typographic strategy relies on a dramatic contrast between the literary **Libre Caslon Text** and the utilitarian **Inter**. 

Headlines are set in Serif to reinforce the editorial feel, suggesting a narrative rather than just data. Large display sizes use tight letter spacing for an architectural look. For UI controls, data tables, and operational text, **Inter** provides maximum legibility and a neutral "tool-like" feel. 

Special attention is paid to the **Label-Caps** style; used for metadata and section headers, this uppercase treatment adds a layer of formal organization to complex dashboards. Body text maintains a generous line height to ensure readability in fast-paced kitchen or office environments.

## Layout & Spacing

This design system employs an **Asymmetrical Grid System** that draws inspiration from modern editorial layouts. We prioritize "The Luxury of Space," where whitespace is treated as a functional element to separate disparate operational tasks.

- **Desktop:** A 12-column fixed-center grid with wide 64px margins. Use asymmetrical compositions (e.g., a 4-column sidebar with an 8-column content area, but with inner elements offset) to avoid a standard "portal" look.
- **Tablet:** 8-column fluid grid.
- **Mobile:** 4-column fluid grid.

Horizontal dividers should be hairline-thin (0.5px or 1px) using a muted bone-tinted grey. Content is grouped into logical "plates" rather than boxes, using large vertical stacks (`stack-xl`) to define distinct sections of the user journey.

## Elevation & Depth

To maintain a premium, tactile feel, this design system rejects heavy shadows and floating layers. Instead, it utilizes **Tonal Layering** and **Low-Contrast Outlines**.

1.  **Base Layer:** The Bone White (#F9F6F1) surface is the foundation.
2.  **Raised Elements:** Use a subtle shift to pure White (#FFFFFF) to indicate interaction zones or active cards.
3.  **Depth:** Depth is communicated through 1px borders in a slightly darker tone than the surface (#D1CDC7). 
4.  **Interaction:** On hover, elements do not "lift" with shadows. Instead, they shift in tone (e.g., Bone White to White) or the border color transitions to Muted Gold. 
5.  **Overlays:** Modal windows use a semi-transparent Dark Navy backdrop blur to maintain the cinematic focus on the task at hand.

## Shapes

The visual language is strictly **Sharp**. A border radius of 0px is applied to all UI elements—buttons, cards, input fields, and imagery. This reinforces the architectural and "professional tool" aesthetic. 

The sharp corners convey precision, discipline, and a high-end kitchen's "stainless steel" efficiency. Avoid any soft or pill-shaped containers. All containers are defined by their structural lines and the tension between their edges.

## Components

- **Buttons:** Sharp 0px corners. Primary buttons are Dark Navy with Bone White text. Secondary buttons are transparent with a 1px Dark Navy border. Ghost buttons use the Label-Caps typography.
- **Cards:** Zero border radius. No shadows. Use a 1px border (#D1CDC7) or a subtle tonal shift to define the boundary. Images within cards must be high-contrast and cinematic.
- **Inputs:** Underline-style or fully boxed with 0px radius. Use Inter for input text. Focus states are indicated by the border color transitioning to Muted Gold.
- **Lists:** High-density data should be presented with generous row heights and thin horizontal dividers. Use Libre Caslon for numerical data in summaries to add a "financial report" level of prestige.
- **Operational Intelligence:** Use "Status Pills" that are actually sharp rectangles. A small, circular "Forest Green" dot next to a sharp-edged label indicates an active status.
- **Imagery:** Large-scale, full-bleed imagery should be used at the start of workflows to set the tone. All photos should have a consistent, slightly desaturated, and warm-toned grade.
