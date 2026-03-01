# Design System Integration Prompt

> **Copy everything below this line into a new Claude session to apply this design system to any site.**

---

## Instructions

I need you to integrate a specific design system into my website. Below is the complete specification extracted from an existing production site (FastNetDesk). Apply this look and feel comprehensively. Adapt component names and framework syntax as needed for my stack, but preserve the exact visual properties, values, and techniques.

---

## 1. Color Palette

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0EA5E9` | Buttons, links, active states, accents |
| Primary Hover | Generated from palette step 500 | Interactive hover states |
| Primary Pressed | Generated from palette step 700 | Click/active states |
| Primary Glow | `#38BDF8` | Dark mode glows, lightning effects, neon accents |
| Primary Deep | `#0369A1` | Gradient endpoints, icon backgrounds |
| Primary Light | `#E0F2FE` | Lightning core, subtle highlights |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| Info | `#2080F0` | Informational badges/alerts |
| Success | `#10B981` | Success states, confirmations |
| Warning | `#F59E0B` | Warning alerts, caution states |
| Error | `#EF4444` | Error states, destructive actions |

### Surface Colors (Light Mode)
| Token | Value | Usage |
|-------|-------|-------|
| Container BG | `rgb(248, 250, 255)` | Card backgrounds, content areas |
| Layout BG | `rgb(237, 242, 251)` | Page background, sidebar background |
| Inverted BG | `rgb(8, 20, 42)` | Dark surfaces (inverted sidebars) |
| Base Text | `rgb(15, 23, 42)` | Primary text color |

### Surface Colors (Dark Mode)
| Token | Value | Usage |
|-------|-------|-------|
| Container BG | `rgb(15, 23, 42)` | Card backgrounds |
| Layout BG | `rgb(8, 15, 30)` | Page background |
| Base Text | `rgb(226, 232, 240)` | Primary text color |

### Accent / Branding Colors
| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#F5C344` | Cursor accents, special highlights |
| Accent Blue | `#2D7DD2` | Selection highlights, secondary accents |
| Dark Gold | `#FFD700` | Dark mode gold variant |

---

## 2. Glassmorphism System

This is the signature visual technique. Apply it to prominent cards, modals, and hero sections.

### Glass Card (Primary - e.g., Login Card, Hero Card)
```css
/* Light Mode */
.glass-card {
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  padding: 16px 28px;
  box-shadow:
    0 14px 40px 0 rgba(31, 38, 135, 0.25),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.7);
  max-width: 520px;
  min-width: 420px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 32px 96px 0 rgba(31, 38, 135, 0.35),
    inset 0 2px 0 0 rgba(255, 255, 255, 0.9);
}

/* Dark Mode */
.dark .glass-card {
  background: rgba(18, 18, 18, 0.6);
  border: 2.5px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 24px 72px 0 rgba(0, 0, 0, 0.6),
    inset 0 2px 0 0 rgba(255, 255, 255, 0.2);
}

/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(60px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.96);
  }
}
```

### Glass Card (Secondary - e.g., Feature Cards, Info Cards)
```css
.glass-card-secondary {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-secondary:hover {
  transform: translateY(-6px);
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 20px 60px rgba(31, 38, 135, 0.2);
}

/* Dark Mode */
.dark .glass-card-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
}
```

---

## 3. Animated Gradient Background

The hero/login area uses an animated gradient with floating orbs. This creates a living, dynamic feel.

### Base Gradient
```css
.animated-background {
  background: linear-gradient(135deg, #38BDF8 0%, #0F172A 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

/* Dark Mode */
.dark .animated-background {
  background: linear-gradient(135deg, #0a0f1e 0%, #020617 100%);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Floating Orbs (4 tiers)
Place 20-24 absolutely positioned circular elements with a brand image or gradient fill, spread across the background at various sizes and animation speeds:

| Tier | Size Range | Opacity (Light) | Opacity (Dark) | Animation Duration |
|------|-----------|-----------------|----------------|--------------------|
| Background (large) | 180-300px | 0.12-0.22 | 0.30 | 28-38s |
| Mid-ground | 100-160px | 0.30-0.50 | 0.55 | 18-24s |
| Foreground (small) | 55-95px | 0.55-0.80 | 0.80 | 11-16s |
| Tiny (detail) | 30-48px | 0.75-0.90 | 0.90 | 8-11s |

Each orb gets a unique float animation:
```css
@keyframes floatSlow {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(15px, -20px) rotate(2deg); }
  50% { transform: translate(-10px, 15px) rotate(-3deg); }
  75% { transform: translate(20px, 10px) rotate(4deg); }
}

@keyframes floatMedium {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, 15px) rotate(4deg); }
  66% { transform: translate(15px, -25px) rotate(-5deg); }
}

@keyframes floatFast {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(15px, -12px) rotate(5deg); }
  50% { transform: translate(-18px, 20px) rotate(-8deg); }
  75% { transform: translate(22px, -15px) rotate(10deg); }
}
```

Orbs should use `will-change: transform` and `pointer-events: none`. Respect `prefers-reduced-motion` by disabling animations.

### Lightning Sparks (Optional Canvas Effect)
For an extra premium touch, render lightning bolts between nearby orbs on a canvas overlay:
- Bolt color: `#38BDF8` with `#0EA5E9` shadow glow
- Core color: `#E0F2FE`
- Spawn interval: 0.8-2.3s, lifetime: 150-350ms
- Max orb distance for connection: 400px

---

## 4. Typography

### Font Stack
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
  'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
```

### Monospace Font Stack (for terminals, code)
```css
font-family: "Cascadia Code", "Fira Code", "Courier New", monospace;
```

### Type Scale

| Element | Size | Weight | Letter Spacing |
|---------|------|--------|----------------|
| Hero Headline | 36px | 700 | - |
| Page Title | 28px | 500 | - |
| Section Title | 18px | 700 | -0.02em |
| Card Title | 16px | 700 | - |
| Module Title | 15px | 600 | -0.01em |
| Subtitle / Body Large | 15px | 500 | -0.01em |
| Body / Buttons | 14-15px | 400-600 | 0.01em (buttons) |
| Small Text / Captions | 13px | 500 | - |
| Fine Print / Labels | 12px | 500 | -0.01em |

### Base Line Height
```css
line-height: 1.5;
```

---

## 5. Spacing Scale

Use an 8px base grid with these standard stops:

| Token | Value | Common Usage |
|-------|-------|-------------|
| xs | 4px | Tight gaps, icon spacing |
| sm | 8px | Form margins, compact gaps |
| md | 12px | Component internal padding |
| base | 16px | Standard padding, content gaps |
| lg | 20px | Section padding (mobile) |
| xl | 24px | Card padding, medium sections |
| 2xl | 28px | Glass card horizontal padding |
| 3xl | 32px | Layout gaps, major sections |
| 4xl | 48px | Footer height, large spacing |

---

## 6. Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| sm | 6px | UI component default (buttons, inputs, tags, dropdowns) |
| md | 8px | Cards, content wrappers |
| lg | 12px | Icon containers, featured elements |
| xl | 16px | Feature/info cards |
| 2xl | 20px | Glass cards (tablet) |
| 3xl | 24px | Glass cards (desktop), hero elements |

---

## 7. Box Shadows

```css
/* Header shadow */
box-shadow: 0 1px 2px rgb(8 47 73 / 0.10);

/* Sidebar shadow */
box-shadow: 2px 0 8px 0 rgb(8 47 73 / 0.07);

/* Card wrapper (subtle) */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Glass card (resting) */
box-shadow:
  0 14px 40px 0 rgba(31, 38, 135, 0.25),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.7);

/* Glass card (hover/elevated) */
box-shadow:
  0 32px 96px 0 rgba(31, 38, 135, 0.35),
  inset 0 2px 0 0 rgba(255, 255, 255, 0.9);

/* Dark mode glass card */
box-shadow:
  0 24px 72px 0 rgba(0, 0, 0, 0.6),
  inset 0 2px 0 0 rgba(255, 255, 255, 0.2);

/* Feature card hover */
box-shadow: 0 20px 60px rgba(31, 38, 135, 0.2);
```

---

## 8. Hover & Interaction Effects

### Standard Card Hover
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
/* On hover: */
transform: translateY(-6px);
```

### Glass Card Hover
```css
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
/* On hover: */
transform: translateY(-2px);
/* + enhanced box-shadow (see shadows section) */
```

### Icon Hover
```css
transition: all 0.3s ease;
/* On hover: */
transform: scale(1.1) rotate(5deg);
```

### Logo Hover
```css
transition: all 0.3s ease;
/* On hover: */
transform: scale(1.05);
filter: drop-shadow(0 4px 12px rgba(14, 165, 233, 0.4));
```

### Button Hover
```css
/* Buttons use the primary color system - hover uses palette step 500, pressed uses step 700 */
```

---

## 9. Page Transitions

Apply to route/page changes. Default is `fade-slide`:

```css
/* fade-slide (default) */
.fade-slide-enter-active { transition: all 0.3s; }
.fade-slide-leave-active { transition: all 0.3s; }
.fade-slide-enter-from { opacity: 0; transform: translateX(30px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(30px); }

/* fade-bottom (for modals/overlays) */
.fade-bottom-enter-active { transition: all 0.3s; }
.fade-bottom-leave-active { transition: all 0.25s; }
.fade-bottom-enter-from { opacity: 0; transform: translateY(10%); }
.fade-bottom-leave-to { opacity: 0; transform: translateY(10%); }

/* fade-scale (for popups) */
.fade-scale-enter-active,
.fade-scale-leave-active { transition: all 0.28s; }
.fade-scale-enter-from { opacity: 0; transform: scale(0.8); }
.fade-scale-leave-to { opacity: 0; transform: scale(1.2); }

/* zoom-fade (for dialogs) */
.zoom-fade-enter-active { transition: all 0.3s; }
.zoom-fade-leave-active { transition: all 0.2s; }
.zoom-fade-enter-from { opacity: 0; transform: scale(0.92); }
.zoom-fade-leave-to { opacity: 0; transform: scale(1.06); }
```

---

## 10. Dark Mode Strategy

Use the **class-based** strategy: toggle a `dark` class on `<html>`.

```css
/* Apply dark overrides using .dark parent selector */
html.dark {
  --container-bg: rgb(15, 23, 42);
  --layout-bg: rgb(8, 15, 30);
  --base-text: rgb(226, 232, 240);
}
```

Support three modes: `light`, `dark`, `auto` (follows `prefers-color-scheme`).

Key dark mode adjustments:
- Glass cards: increase background opacity, use `rgba(18, 18, 18, 0.6)`
- Borders: soften to `rgba(255, 255, 255, 0.2)`
- Animated background: darker gradients (`#0a0f1e` to `#020617`)
- Floating orbs: reduce opacity for large orbs, maintain for small ones
- Text: use `rgba(255, 255, 255, 0.98)` for headings

---

## 11. Responsive Design

**Approach:** Desktop-first with `max-width` media queries.

### Breakpoints
| Name | Width | Purpose |
|------|-------|---------|
| xxl | >1400px | Full desktop with all features |
| xl | 1024-1400px | Smaller desktop, slight reductions |
| lg | 768-1024px | Tablet, maintained layout with tighter spacing |
| md | <768px | Mobile, single column, hide secondary sections |
| sm | <480px | Small mobile, further reductions |

### Key Responsive Behaviors
- **>768px:** 50/50 split layouts, full glass card with 60px blur, all orbs visible
- **<768px:** Single column, hide feature/decorative sections, glass blur reduced to 40px, border-radius reduced to 20px, touch-friendly input heights (58px min)
- **<480px:** Further padding reduction, border-radius to 18px, input heights 54px, orbs reduced to ~10

### Touch Target Sizing (Mobile)
```css
@media (max-width: 768px) {
  input, button, .interactive-element {
    min-height: 58px;
  }
}
@media (max-width: 480px) {
  input, button, .interactive-element {
    min-height: 54px;
  }
}
```

---

## 12. Layout System

### Main App Layout
- **Header:** 56px height, sticky, with subtle bottom shadow
- **Sidebar:** 220px expanded, 64px collapsed
- **Tab bar:** 44px height
- **Footer:** 48px height
- **Content padding:** 16px

### Login/Hero Layout
```css
.hero-content {
  display: flex;
  max-width: 1800px;
  padding: 32px;
  gap: 32px;
}
.left-section { flex: 0 0 50%; }   /* Feature/info content */
.right-section { flex: 0 0 50%; }  /* Glass card / form */

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    padding: 20px;
  }
  .left-section { display: none; } /* or stack below */
  .right-section { flex: 1; }
}
```

---

## 13. Scrollbar Styling
```css
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.5);
}
::-webkit-scrollbar-track {
  border-radius: 10px;
}
```

---

## 14. Accessibility & Performance

- Respect `prefers-reduced-motion`: disable all floating/gradient animations
- All interactive elements must have visible focus states
- Use `will-change: transform` on animated elements (orbs)
- Use `pointer-events: none` on decorative elements (orbs, background)
- Provide `@supports not (backdrop-filter)` fallbacks for glassmorphism
- Minimum touch targets: 44px on mobile

---

## 15. Implementation Checklist

When applying this design system to a new site:

1. [ ] Set up CSS custom properties for the full color palette
2. [ ] Implement class-based dark mode (`html.dark`)
3. [ ] Create glassmorphism card component(s) - primary and secondary variants
4. [ ] Build animated gradient background with floating orbs
5. [ ] Apply the typography scale and system font stack
6. [ ] Set up the spacing scale (8px grid)
7. [ ] Apply border-radius tokens consistently
8. [ ] Implement box shadow hierarchy
9. [ ] Add hover/interaction effects (translateY, scale, enhanced shadows)
10. [ ] Set up page transitions (fade-slide default)
11. [ ] Make responsive with desktop-first breakpoints
12. [ ] Style scrollbars
13. [ ] Add `prefers-reduced-motion` support
14. [ ] Add `backdrop-filter` fallbacks
15. [ ] Test light mode, dark mode, and auto mode

---

## Summary of the Visual Identity

This design system creates a **premium, modern, glass-forward aesthetic** characterized by:

- **Glassmorphism** as the primary card treatment (frosted glass with deep blur)
- **Animated gradient backgrounds** with floating translucent orbs creating depth and motion
- **Sky blue primary palette** (`#0EA5E9`) with supporting semantic colors
- **Generous white space** on an 8px grid
- **Smooth, physics-inspired transitions** using cubic-bezier easing
- **Layered depth** through progressive blur, opacity tiers, and inset highlights
- **Full dark mode** support that deepens rather than merely inverts
- **Desktop-first responsive** that gracefully simplifies for mobile

The overall feeling is: clean, professional, slightly futuristic, with just enough motion to feel alive without being distracting.
