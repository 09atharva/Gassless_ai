---
name: Cinematic Dark Web3
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#33394c'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f31'
  surface-container-high: '#23293c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce1fb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dce1fb'
  inverse-on-surface: '#2a3043'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#2fd9f4'
  on-tertiary: '#00363e'
  tertiary-container: '#009fb4'
  on-tertiary-container: '#002f36'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#a2eeff'
  tertiary-fixed-dim: '#2fd9f4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#0c1324'
  on-background: '#dce1fb'
  surface-variant: '#2e3447'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 40px
  container-max: 1200px
---

## Brand & Style

This design system embodies a "Dark Luxury" aesthetic, specifically tailored for the high-performance Web3 ecosystem. The visual narrative is built on the concept of **Intelligent Depth**—moving beyond flat surfaces into a world of cinematic layers, cosmic gradients, and precise engineering.

The style is a fusion of **Minimalism** and **Glassmorphism**, heavily influenced by the "Pro" toolkits of Linear and Apple. It rejects the generic SaaS look in favor of a dark, immersive environment where information feels projected rather than printed. The emotional response should be one of absolute trust, technical superiority, and calm sophistication.

**Key Visual Principles:**
- **Atmospheric Depth:** Use of deep ink-blue backgrounds with floating translucent layers.
- **Precision Accents:** Electric blue signals the "flow" of gasless transactions.
- **Cinematic Motion:** Transitions are slow, deliberate, and expensive-feeling.
- **Technical Polish:** Micro-details like 1px inner glows and noise-textured backgrounds.

## Colors

The palette is anchored in the deep void of space, utilizing a multi-layered dark blue spectrum to create visual hierarchy without relying on borders alone.

- **The Void (Base):** `#020617` is the foundation. It should feel bottomless.
- **The Flow (Accent):** `#3B82F6` (Electric Blue) is used for primary actions and "active" states.
- **Atmospheric Glows:** Use Violet (`#7C3AED`) and Cyan (`#22D3EE`) sparingly for secondary data visualizations or ambient background mesh gradients to suggest intelligence and activity.
- **The Light:** Primary text is an off-white (`#F8FAFC`) to reduce eye strain against the deep dark backgrounds, while muted text uses cool slates to maintain the blue-toned harmony.

## Typography

The typography system leverages **Geist** for its technical precision and humanist balance, echoing the developer-centric nature of a gasless platform. 

- **Display & Headlines:** Feature aggressive negative letter-spacing (`-0.04em`) to create a tight, architectural feel. Bold weights are preferred for brand-level messaging.
- **Body:** Maintains a generous line height (`1.6`) to ensure readability amidst the dark, glowing UI.
- **Labels:** We introduce **JetBrains Mono** for specialized labels, wallet addresses, and technical metadata to reinforce the "built on Base" engineering narrative.
- **Hierarchical Contrast:** Use color (Primary White vs. Muted Slate) rather than just size to distinguish between critical data and supporting information.

## Layout & Spacing

This design system uses a 12-column fixed grid for desktop, transitioning to a fluid 4-column layout for mobile. 

- **Vertical Rhythm:** Built on a 4px baseline. All components should utilize multiples of 4 for padding and margins to maintain mathematical rigor.
- **Negative Space:** Embrace large horizontal gutters and wide margins (`40px+`). The goal is to let the "Ambient Background Mesh" breathe between content blocks.
- **Component Spacing:** Use `24px` (gutter) as the standard gap between related card elements.

## Elevation & Depth

Depth is not communicated via traditional drop shadows, but through **Luminous Layering**:

1.  **Level 0 (The Background):** `#020617` with a subtle noise grain overlay and animated mesh gradients (low opacity).
2.  **Level 1 (The Glass Plate):** Semi-transparent surfaces using `rgba(255, 255, 255, 0.03)` with a `20px` backdrop-blur.
3.  **Level 2 (The Focus):** Elements like active cards or modals use a 1px solid border (`rgba(255, 255, 255, 0.1)`) and a subtle **#3B82F6 inner glow** (blur: 2px, spread: 0px) to simulate a light-pipe effect along the edges.

**Shadows:** When used for extreme elevation (modals), use a large, soft blur (60px) with a blue tint (`rgba(59, 130, 246, 0.1)`) rather than black.

## Shapes

The shape language is "Soft-Modern." We avoid the clinical nature of sharp corners and the playfulness of full pills.

- **Standard Elements:** `0.5rem` (8px) for buttons and inputs.
- **Containers/Cards:** `1rem` (16px) for main content areas.
- **Visual Continuity:** Every container should have a 1px stroke. Use a linear gradient for the stroke (top-left to bottom-right) from `white/15%` to `white/5%` to simulate natural light hitting a physical edge.

## Components

### Buttons
- **Primary:** Solid `#3B82F6` with a white label. On hover, apply a `0px 0px 20px rgba(59, 130, 246, 0.5)` outer glow.
- **Ghost:** Transparent background with the 1px light-pipe border. Hover triggers a subtle "fill" animation from the center.

### Cards & Containers
- Cards should never have a flat background color. Use a radial gradient: `circle at top left, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%`.
- Add a 1px inner border (`inset`) with color `#3B82F6` at 10% opacity.

### Input Fields
- Dark, recessed look. `background: rgba(0,0,0,0.2)`. Focus state should expand the border glow and slightly brighten the backdrop blur.

### Interaction Details
- **Magnetic Hover:** Icons and buttons should have a 5-10px magnetic pull towards the cursor.
- **Animated Trails:** For primary "Gasless" features, use a CSS animation to run a highlight beam along the card border.
- **Entrance:** Content should fade in and "un-blur" simultaneously over 0.8s.

### Web3 Specifics
- **Status Chips:** Use small, glowing dots (Pulse animation) next to network names (e.g., "Base Sepolia").
- **Wallet Connect:** A prominent glass-morphic button in the top right, utilizing the Violet-to-Cyan gradient as a subtle background hover effect.