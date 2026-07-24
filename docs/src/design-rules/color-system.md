# Color System & Button Standardization

This specification defines the LIAO Brand Color System and mandatory button hierarchy. All values correspond to tokens defined in `tailwind.config.js`.

## Core Brand Palette

| Color Name | Token | Hex Value | Primary Application |
| :--- | :--- | :--- | :--- |
| **LIAO Blue** | `liao-blue` / `primary-600` | `#1D70B8` | Primary navigation, main filter tabs, key page actions, form submissions. |
| **LIAO Green** | `liao-green` / `success-600` | `#429946` | Secondary actions, profile triggers, secondary toggles. |
| **LIAO Red** | `liao-red` / `danger-500` | `#E32D2D` | High-impact call-to-action gradient start. |
| **LIAO Yellow** | `liao-yellow` / `warning-400` | `#F9B233` | High-impact call-to-action gradient end. |

## Button Hierarchy Specifications

### 1. Primary & Navigation Buttons (LIAO Blue)
* **Classes**: `.btn-primary` | `bg-liao-blue` | `bg-primary-600 hover:bg-primary-700`
* **Application**: Main page buttons, default form submissions, primary navigation, and top-level filter tabs (`FilterTabs`).
* **Styling**: Solid blue background with subtle blue shadow (`shadow-primary-600/20`), without dark gradients.

### 2. Secondary Actions & Card Triggers (LIAO Green)
* **Classes**: `.btn-secondary` | `bg-liao-green` | `bg-success-600 hover:bg-success-700`
* **Application**: Profile detail buttons ("Sobre" in `MemberCard` and `TutorCard`), content view triggers ("Ler Mais" in `Projects`), supporting actions.
* **Constraint**: Dark-to-green gradients (`from-black to-success-900`) are strictly forbidden. Secondary buttons must use pure green styling.

### 3. Special Conversion Call-to-Action Buttons (Red-Yellow Gradient)
* **Classes**: `.btn-special` | `bg-gradient-to-r from-liao-red via-red-500 to-liao-yellow`
* **Application**: High-priority conversion actions ("Enviar Inscrição", Processo Seletivo applications).
* **Styling**: Vibrant red-to-yellow gradient with scale transition (`hover:scale-[1.03]`).
* **Constraint**: Must NOT be used on Event Detail pages (`/events/:slug`), which must adhere exclusively to their event-specific Prisma color model.

## Mandatory Development Rules

1. Do not use black gradients in action or card buttons.
2. Use `<Button />` (`src/components/ui/Button.tsx`) or `<FilterTabs />` (`src/components/ui/FilterTabs.tsx`) instead of custom button markups.
3. Adhere strictly to the color roles: Blue for Primary/Nav, Green for Secondary, Red-Yellow for Special CTAs.
4. **Event Details Page Color Protocol**: The Event Detail page (`/events/:slug` / `EventDetails`) is strictly scoped to the colors specified in its Prisma `Event` model (`palette`, `themeMode`). Universal style overrides or replacement classes (such as `.btn-special` or `.btn-primary`) MUST NOT be applied to buttons or elements on the event page (e.g. the "Quero me Inscrever" button). All interactive elements, CTAs, and accents on an event page must derive their visual styling strictly from the event's dynamic color palette (`var(--event-primary)`, `var(--event-secondary)`, etc.).

