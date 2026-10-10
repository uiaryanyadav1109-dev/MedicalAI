# Animation & Motion System

Motion in Medical AI is purposeful, restrained, and calm.

## 1. Latency Budgets & Settling Curves
- Micro-interactions (hover states, segmented button selections, tab clicks) settle in $\le 200\text{ms}$.
- Standard transition easing curve: `cubic-bezier(0.16, 1, 0.3, 1)` for smooth mechanical settling without bouncing.

## 2. Compositor-Only Rules
- Animated properties are strictly limited to `opacity` and `transform`. Layout geometry (`width`, `height`, `margin`) is never animated on scroll or hover.

## 3. Specific Motion Choreography
- **Voice Acoustic Waveform**: Rhythmic, calibrated SVG/CSS bar movements that alternate states (Listening, Processing, Responding) to convey microphone activity without distracting flashing.
- **Vitals Trend Graphs**: Clean SVG polyline rendering with crisp coordinate points.
- **Assessment Modal**: Smooth fade-in overlay and progressive progress indicator transitions.
- **Prefers Reduced Motion**: Automatically disables non-essential animations when requested by system settings.
