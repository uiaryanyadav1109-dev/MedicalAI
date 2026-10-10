# Accessibility & WCAG Compliance

Medical information interfaces carry a profound responsibility for accessibility. The website follows WCAG 2.1 AA standards:

## 1. Color Contrast & Multi-Sensory State Signaling
- **Contrast Ratios**: All body text achieves $\ge 4.5:1$ contrast against light background canvases. Large headers achieve $\ge 3:1$.
- **No Hue-Only State Signaling**: Medical urgency and analyte deviations are never signaled by color alone. Every colored badge or indicator is accompanied by explicit text labels (e.g. "Within Range", "Borderline Elevation", "Red Flag Alert").

## 2. Keyboard Navigation & Focus Rings
- All interactive triggers (`<button>`, `<a>`, `<input>`) maintain visible focus rings (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`).
- Logical DOM tab ordering mirrors visual layout flow.
- Modals trap focus and can be dismissed via Escape key or dedicated close button.

## 3. Screen Reader Support & ARIA Attributes
- Semantic landmark elements (`<header>`, `<main>`, `<footer>`, `<aside>`, `<nav>`, `<section>`).
- Accordions and mobile drawers use `aria-expanded` and `aria-label` tags.
- Decorative SVGs and icons use `aria-hidden="true"`.

## 4. Reduced Motion
- Uses CSS transitions constrained to compositor properties (`transform`, `opacity`).
- Respects `prefers-reduced-motion` settings.
