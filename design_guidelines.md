# RelateAI Design Guidelines

## Design Approach

**Selected System**: Hybrid approach combining ChatGPT's conversational interface patterns, Linear's clean typography, and Material Design's systematic component structure. This provides the professional, trustworthy aesthetic required for an AI conversational platform while maintaining excellent usability.

**Key Principles**:
- Clarity over decoration: Every element serves a functional purpose
- Conversational focus: Design supports natural dialogue flow
- Trust through simplicity: Clean, professional interface builds user confidence
- Age-appropriate accessibility: Interface adapts seamlessly between teen/adult modes

---

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - headings, navigation, UI elements
- Secondary: System UI font stack - body text, chat messages for optimal readability

**Hierarchy**:
- Page Titles: text-3xl font-semibold (Home, Chat, Settings headers)
- Section Headers: text-xl font-medium
- Body/Chat Messages: text-base font-normal
- Labels/Metadata: text-sm font-medium
- Auxiliary Text: text-xs font-normal (timestamps, helper text)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** exclusively
- Micro spacing (p-2, gap-2): Between related elements, icon padding
- Standard spacing (p-4, gap-4, m-4): Form fields, card padding, button spacing
- Section spacing (p-8, gap-8): Page containers, content sections
- Large spacing (p-12, gap-12): Between major sections
- Extra large (p-16): Page margins on desktop

**Grid System**:
- Desktop: max-w-7xl centered container with px-8
- Chat Interface: max-w-4xl centered for optimal reading
- Settings/Forms: max-w-2xl for focused interaction
- Mobile: px-4 throughout

---

## Page-Specific Layouts

### Signup/Login Page
- Centered card design (max-w-md) with p-8
- Form fields stacked vertically with gap-4
- Two-column layout on desktop for Signup/Login toggle tabs
- Age field with clear indicator text below
- Primary action button full-width on mobile, auto-width on desktop

### Home/About Page
- NO traditional hero section
- Clean header with RelateAI branding and navigation (h-16)
- Main content: centered max-w-3xl with py-12
- Description paragraph: text-lg leading-relaxed
- "Chat Now" CTA: prominent, centered below description with mt-8
- Features grid: 3 columns on desktop (grid-cols-1 md:grid-cols-3 gap-8), single column mobile
- Each feature card: p-6, rounded-lg border, with icon (h-12 w-12), title (text-lg font-medium), description (text-sm)

### Chat Page
- Full-height layout (h-screen flex flex-col)
- Top bar (h-16): Vault selector dropdown on left, settings icon on right
- Chat container: flex-1 overflow-y-auto with max-w-4xl mx-auto px-4
- Message bubbles: max-w-2xl, p-4 rounded-2xl
  - User messages: ml-auto (right-aligned)
  - AI messages: mr-auto (left-aligned)
- Each message group includes timestamp (text-xs) with mt-1
- Input area: fixed bottom, full-width with max-w-4xl mx-auto
  - Input field with p-4, rounded-full on desktop, rounded-lg on mobile
  - Send button: h-12 w-12 rounded-full positioned absolute right
- Vault selector: "Coming Soon" badges for Family/Friends vaults with opacity-50

### Settings Page
- Sidebar navigation on desktop (w-64), collapsible on mobile
- Main content area with max-w-3xl
- Settings groups separated by py-8 with border-b
- **Appearance Section**:
  - Theme cards in grid-cols-3 gap-4
  - Each theme card: p-4, border rounded-lg, clickable
  - Active theme: border-2 with accent indicator
- **Profile Section**:
  - Form layout with gap-6
  - Labels: text-sm font-medium mb-2
  - Input fields: p-3 rounded-lg full-width
  - Edit mode: inline editing with Save/Cancel buttons at bottom
- **Age Handling Toggle**:
  - Switch component with label and description text
  - Passcode modal: centered overlay with backdrop blur
  - Modal content: max-w-sm p-6 rounded-xl

---

## Component Library

### Navigation
- Desktop: Horizontal nav bar (h-16) with logo left, links center, user menu right
- Mobile: Hamburger menu icon, slide-out drawer with py-4 gap-2 links
- Active state: font-semibold with indicator

### Buttons
- Primary: px-6 py-3 rounded-lg font-medium
- Secondary: px-6 py-3 rounded-lg border font-medium
- Icon buttons: h-10 w-10 rounded-full flex items-center justify-center
- Disabled state: opacity-50 cursor-not-allowed

### Form Inputs
- Text fields: px-4 py-3 rounded-lg border w-full
- Select dropdowns: Same as text fields with chevron icon
- Focus state: ring-2 ring-offset-2
- Error state: border with error text below (text-sm)
- All inputs have consistent h-12 height

### Cards
- Standard card: p-6 rounded-xl border
- Chat message bubble: p-4 rounded-2xl (rounded-tl-sm for AI, rounded-tr-sm for user)
- Feature card: p-6 rounded-lg border with hover elevation

### Modals/Overlays
- Backdrop: fixed inset-0 with backdrop-blur-sm
- Modal content: max-w-md mx-auto my-auto p-6 rounded-xl
- Close button: absolute top-4 right-4 h-8 w-8

### Icons
**Library**: Heroicons (via CDN)
- Navigation icons: h-5 w-5
- Feature icons: h-12 w-12
- Button icons: h-5 w-5
- Form field icons: h-4 w-4

### Badges
- "Coming Soon": px-3 py-1 rounded-full text-xs font-medium
- Mode indicator (Teen/Adult): px-2 py-1 rounded text-xs

---

## Images

**Hero Image**: NO hero image for this application. RelateAI is a utility-focused chat application where immediate functionality takes precedence over visual storytelling.

**Optional Supporting Images**:
- Feature icons on Home page (illustrative icons from Heroicons, NOT photographs)
- User avatar placeholders in chat (generated initials or default icon)
- Empty state illustrations for vault selection (simple line art, optional)

---

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: None (instant navigation)
- Message appearance: Subtle fade-in (duration-200) as AI responds
- Modal open/close: Scale and fade (duration-200)
- Button hover: Transform scale-105 (duration-150)
- NO scroll-triggered animations
- NO background effects or parallax

---

## Responsive Breakpoints

- Mobile: < 768px - Single column, full-width components, bottom navigation
- Tablet: 768px - 1024px - Two-column where appropriate, sidebar visible
- Desktop: > 1024px - Multi-column layouts, fixed sidebar, hover states active

---

## Accessibility Standards

- All interactive elements have min-height of 44px (h-11 minimum)
- Focus indicators on all clickable elements (ring-2)
- Sufficient contrast maintained (handled by color system)
- Semantic HTML structure throughout
- ARIA labels for icon-only buttons
- Form validation messages announced to screen readers