# Design System: Trust within Flow

This document outlines the visual language and structural logic for the design system. It is engineered for B2B Enterprise SaaS environments where high-density data must coexist with an editorial, premium feel. We move beyond "standard" software interfaces by embracing tonal depth, sophisticated layering, and an absolute rejection of rigid structural lines.

---

## 1. Overview & Creative North Star: "The Architectural Flow"

The Creative North Star for this system is **The Architectural Flow**. 

Most B2B platforms feel like spreadsheets—rigid, boxed-in, and exhausting. Our goal is to create a digital workspace that feels like a modern, glass-walled office: open, airy, yet structurally sound. We achieve "Trust within Flow" by trading heavy borders for **Tonal Elevation**. By using varying shades of grey and blue (surfaces) rather than lines, we create a layout that feels organic and interconnected rather than fragmented.

### Design Principles
*   **Intentional Asymmetry:** Use generous, varying whitespace (`gap-8` vs `gap-4`) to guide the eye toward primary actions.
*   **Atmospheric Depth:** Rely on background shifts and `backdrop-blur` rather than drop shadows to indicate hierarchy.
*   **Editorial Authority:** High-contrast typography scales that prioritize legibility and professional poise.

---

## 2. Color & Surface Logic

We leverage a sophisticated palette where **Core Blue** (`primary-container`: #0f4c81) provides the foundation of stability, and **Action Teal** (`secondary`: #006b5c) signals insight and progression.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off the UI. 
Traditional borders create visual "noise" that clusters the interface. Instead, define boundaries through:
1.  **Background Shifts:** Place a `surface-container-lowest` card (#ffffff) on a `surface-container-low` background (#f2f4f6).
2.  **Negative Space:** Use the Spacing Scale (specifically `gap-6` and `gap-8`) to imply groupings.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
*   **Level 0 (Base):** `surface` (#f7f9fb) — The canvas.
*   **Level 1 (Sections):** `surface-container-low` (#f2f4f6) — Large layout areas (e.g., Sidebars or Feed backgrounds).
*   **Level 2 (Cards):** `surface-container-lowest` (#ffffff) — Individual workspace cards or data modules.
*   **Level 3 (Floating):** `surface-bright` with 80% opacity and 12px blur — For menus and tooltips.

### The "Glass & Gradient" Rule
To inject "soul" into the B2B experience, use a subtle linear gradient on primary CTAs: `primary` (#00355f) to `primary-container` (#0f4c81). This creates a soft, convex 3D effect that feels premium and tactile.

---

## 3. Typography: The Editorial Voice

We utilize a dual-font strategy to balance character with utility.

*   **Headlines (Manrope):** Chosen for its geometric precision. Use `display-md` for high-level dashboard summaries to create an "Editorial" feel.
*   **Body (Inter/Pretendard Variable):** The workhorse. This variable font ensures perfect readability at small scales (`body-sm`) for data-heavy tables.

| Role | Token | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-sm` | 2.25rem | 700 | Narrative hero moments |
| **Headline**| `headline-sm`| 1.5rem | 600 | Section headers |
| **Title**   | `title-md`   | 1.125rem| 500 | Card titles / Navigation |
| **Body**    | `body-md`    | 0.875rem| 400 | General UI text |
| **Label**   | `label-sm`   | 0.6875rem| 600 | All-caps metadata / Badges |

---

## 4. Elevation & Depth: Tonal Layering

We reject the "Material 2" style of heavy drop shadows. Depth in this system is achieved through **Ambient Light**.

*   **The Layering Principle:** A `surface-container-highest` element is perceived as "closer" to the user than a `surface` element. 
*   **Ambient Shadows:** If a floating element (like a Modal) requires a shadow, use a custom blur: `0px 20px 40px rgba(25, 28, 30, 0.06)`. The shadow color must be a tint of `on-surface` (#191c1e), never pure black.
*   **The "Ghost Border":** If a border is required for accessibility (e.g., in high-contrast modes), use `outline-variant` (#c2c7d1) at **15% opacity**. It should be felt, not seen.

---

## 5. Signature Components

### Workspace Cards (`workspace-card`)
The fundamental unit of the system.
*   **Background:** `surface-container-lowest` (#ffffff).
*   **Radius:** `rounded-md` (12px / 0.75rem).
*   **Interaction:** On hover, shift background to `surface-bright` and apply a 4% `on-surface` ambient shadow. **No borders.**

### Buttons
*   **btn-primary:** Uses the "Signature Gradient" (Primary to Primary-Container). White text.
*   **btn-teal:** Uses `secondary` (#006b5c). Reserved strictly for "Success" actions or "Insight Generation" (AI).
*   **btn-secondary:** Transparent background with an `outline-variant` ghost border (20% opacity).

### Badges (`badge-accent/teal/neutral`)
*   **Structure:** Pill-shaped (`rounded-full`), `label-sm` font, medium weight.
*   **Teal Badge:** `secondary-container` background with `on-secondary-container` text. Use for "Active" or "Optimized" states.

### Input Fields (`input-surface`)
*   **Style:** `surface-container-high` background. 
*   **Focus State:** Background remains the same, but a 2px "Ghost Border" of `primary` appears at 40% opacity. 
*   **Logic:** Inputs should feel "recessed" into the page, rather than sitting on top of it.

---

## 6. Do’s and Don'ts

### Do
*   **DO** use whitespace as a separator. If you think you need a divider line, try adding `gap-6` (2rem) first.
*   **DO** use `secondary-fixed-dim` (#44ddc1) for subtle data visualizations (sparklines, progress bars).
*   **DO** ensure all interactive elements have a `rounded-md` (12px) corner radius to maintain the "Soft Modern" personality.

### Don’t
*   **DON'T** use pure black (#000000) for text. Always use `on-surface` (#191c1e).
*   **DON'T** stack more than three levels of surface containers (e.g., a card inside a container inside a sidebar). This breaks the "Flow" and creates visual clutter.
*   **DON'T** use 100% opaque borders. High-contrast lines trap the user's eye and prevent the "Trust within Flow" experience.