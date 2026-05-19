---
name: General Mills Industrial
colors:
  surface: '#f8f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#722b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#983c00'
  on-tertiary-container: '#ffc2a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter-desktop: 24px
  gutter-tablet: 16px
  margin-desktop: 40px
  container-max-width: 1440px
---

## Brand & Style
The design system is engineered for the high-stakes environment of modern food manufacturing. It prioritizes **Professionalism, Trustworthiness, and Utility**, ensuring that operators and managers can make split-second decisions with absolute clarity. 

Drawing from **Corporate/Modern** aesthetics with a lean toward **Industrial Functionalism**, the interface minimizes decorative elements in favor of high-contrast data visualization and clear hierarchy. The visual language evokes a sense of "digital machinery"—robust, reliable, and precise—designed to perform under the varied lighting conditions of a factory floor.

## Colors
The palette is anchored by a deep primary blue, providing a stable and authoritative foundation. 

- **Primary Blue (#0056b3):** Used for primary actions, active states, and brand identification.
- **Surface Neutrals:** A range of cool grays (#f1f3f5 to #dee2e6) are used for backgrounds and container fills to create depth without the harshness of pure white.
- **High-Contrast Text:** Primary content uses a deep charcoal (#212529) against white surfaces to ensure maximum legibility (WCAG AAA compliance where possible).
- **Functional Accents:** Success, warning, and error colors are highly saturated to ensure status indicators are immediately visible from a distance on the production line.

## Typography
This design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic structure. 

The type scale is generous, prioritizing readability at a distance. Headlines use tighter letter-spacing and heavier weights to command attention, while body text maintains a standard tracking for flow. For technical readouts and machine data, the "data-mono" style utilizes Inter's tabular font features to ensure that columns of numbers align perfectly for rapid scanning.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. While the overall container respects a maximum width on large displays, the internal grid is a 12-column fluid system that scales based on the viewport.

A strict **8px spacing grid** governs all margins and padding, ensuring mathematical harmony and predictability.
- **Desktop:** 12 columns, 24px gutters, 40px outer margins.
- **Tablet (Industrial Handhelds):** 8 columns, 16px gutters, 24px outer margins.
- **Touch Targets:** All interactive elements maintain a minimum hit area of 48x48px to accommodate gloved hands or rapid interaction in motion.

## Elevation & Depth
In a factory environment, clarity is preferred over "fuzziness." This design system eschews heavy, ambient shadows in favor of **Tonal Layers and Low-Contrast Outlines**.

- **Level 0 (Floor):** Neutral background fill (#f1f3f5).
- **Level 1 (Card/Surface):** White background with a 1px border (#dee2e6). This is the standard container for data groups.
- **Level 2 (Interactive/Hover):** A subtle, crisp shadow (4px blur, 10% opacity) is used only to indicate interactivity or temporarily elevated states like modals and dropdowns.
- **Separators:** Use 1px solid lines (#e9ecef) to define internal hierarchies within containers.

## Shapes
The shape language is disciplined and geometric. A **Soft (0.25rem)** corner radius is applied to buttons, input fields, and small UI components. This provides a modern, approachable feel while maintaining the structural integrity expected of industrial software.

Larger containers and cards may use `rounded-lg` (0.5rem) to differentiate them from functional inputs. Icons should follow a similar stroke weight (approx 1.5px - 2px) to match the crispness of the borders.

## Components
Consistent implementation of components ensures that operators can interact with the software instinctively.

- **Buttons:** 
  - *Primary:* Solid Blue (#0056b3) with White text. Bold and high contrast.
  - *Secondary:* White background with Blue border and Blue text.
  - *Size:* Minimum height of 48px for standard actions.
- **Input Fields:** 
  - 1px border (#ced4da) that thickens to 2px Primary Blue on focus.
  - Labels are always visible (never placeholder-only) to maintain context.
- **Status Chips:** 
  - Pill-shaped with a light background tint and dark text of the corresponding status color (e.g., Light Green background with Dark Green text for "Running").
- **Cards:** 
  - Pure white background, 1px border, used to group related telemetry data or machine controls.
- **Data Tables:** 
  - Use zebra-striping (alternating #f8f9fa rows) for long lists to aid horizontal scanning. Header rows are anchored with a subtle gray background.
- **Industrial Indicators:** 
  - Circular "LED" style status lights used for machine connectivity states, utilizing the high-saturation status colors.