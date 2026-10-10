# Responsive Design Strategy

The layout is crafted for seamless readability across all device profiles:

## 1. Breakpoint Grid
- **Desktop Ultrawide & Baseline**: 1440px / 1280px / 1024px. Standard content container is bounded to `max-w-7xl` (`1280px`) with 24px–32px horizontal padding.
- **Tablet**: 768px (`md:`). Grid columns transition gracefully from 4/3 columns to 2 columns with stacked side-panels.
- **Mobile Handsets**: 430px / 390px / 375px. Single-column layouts with touch-friendly controls.

## 2. Mobile Re-architecture Details
- **Sticky Cap Compliance**: Combined fixed/sticky top elements (top disclaimer banner + navbar) occupy less than 12% of mobile viewport height, leaving $\ge 88\%$ for content.
- **Touch Target Sizing**: All interactive buttons, tabs, segmented selectors, and links have a minimum target of $44\text{px} \times 44\text{px}$.
- **Horizontal Scroll Protection**: Complex data tables (such as the Feature Matrix and Lab Analyzer) are equipped with clean horizontal scrolling containers (`overflow-x-auto`) to preserve table semantics without page blowouts.
- **Mobile Menu Sheet**: Accessible drawer menu with clean text links and high-contrast CTA buttons.
