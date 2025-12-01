# Dark Mode Implementation Guide

Chukfi CMS features comprehensive dark mode support across the entire admin dashboard.

## Overview

The dark mode system is built using Tailwind CSS v4's dark mode utilities with class-based strategy. It provides:

- **Automatic detection** of system preferences
- **Manual toggle** via theme switcher button
- **Persistent preference** saved to localStorage
- **No flash on load** with inline script initialization
- **Full coverage** across all admin components

## Architecture

### Theme Initialization

The theme is initialized in `frontend/src/layouts/Layout.astro` using an inline script:

```javascript
(function () {
  let theme = localStorage.getItem("theme");
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
})();
```

This runs **before page render** to prevent flash of unstyled content (FOUC).

### Theme Toggle Component

Location: `frontend/src/components/ThemeToggle.tsx`

Features:

- Sun icon for light mode toggle
- Moon icon for dark mode toggle
- Smooth transitions
- Accessible with aria-label
- Hydration-safe (prevents mismatch)

Usage in AdminLayout:

```astro
<ThemeToggle client:load />
```

## Component Coverage

All admin components have been updated with comprehensive dark mode support:

### Layout Components

- ✅ **AdminLayout** - Sidebar, header, main content area
- ✅ **SidebarNav** - Navigation links with hover/active states
- ✅ **UserMenu** - Dropdown menu with proper contrast

### Dashboard Components

- ✅ **Dashboard Page** - Stats cards, quick actions, recent collections
- ✅ **RecentActivity** - Timeline, avatars, action badges
- ✅ **MediaStats** - Stat cards with icon badges

### User Management

- ✅ **UsersList** - Table, search, filters, modals
- ✅ **AddUserButton** - Modal form with inputs
- ✅ **ProfileSettings** - Form sections, avatar upload, inputs

### Role Management

- ✅ **RolesList** - Table, badges, delete confirmations
- ✅ **CreateRoleButton** - Modal form
- ✅ **EditPermissionsModal** - Permission checkboxes, CRUD toggles

### Media Management

- ✅ **MediaLibrary** - Grid/list views, previews, actions
- ✅ **MediaUploadButton** - Upload modal, drag-drop, preview
- ✅ **MediaStats** - File type statistics

### Collections

- ✅ **CollectionsList** - Table, search, status badges

### Activity Logging

- ✅ **ActivityPage** - Filters, pagination, activity list
- ✅ **ActivityDetailsModal** - Full activity details

### Settings

- ✅ **SettingsPanel** - All settings sections, inputs, toggles

## Color Palette

### Background Colors

- **Light containers**: `bg-white` → `dark:bg-gray-800`
- **Light backgrounds**: `bg-gray-50` → `dark:bg-gray-900`
- **Nested cards**: `bg-gray-100` → `dark:bg-gray-700`
- **Overlays**: `bg-gray-500` → `dark:bg-gray-900`

### Text Colors

- **Primary text**: `text-gray-900` → `dark:text-white`
- **Secondary text**: `text-gray-500` → `dark:text-gray-400`
- **Tertiary text**: `text-gray-600` → `dark:text-gray-300`
- **Labels**: `text-gray-700` → `dark:text-gray-300`

### Border Colors

- **Borders**: `border-gray-300` → `dark:border-gray-600`
- **Dividers**: `divide-gray-200` → `dark:divide-gray-700`
- **Rings**: `ring-gray-300` → `dark:ring-gray-600`

### Interactive Elements

- **Primary buttons**: `bg-indigo-600` → `dark:bg-indigo-500`
- **Button hover**: `hover:bg-indigo-700` → `dark:hover:bg-indigo-600`
- **Input fields**: `bg-white` → `dark:bg-gray-700`
- **Input borders**: `border-gray-300` → `dark:border-gray-600`
- **Placeholder**: `placeholder-gray-500` → `dark:placeholder-gray-400`

### Status Colors

All status indicators have dark mode variants:

- **Success**: `bg-green-100 text-green-800` → `dark:bg-green-900 dark:text-green-300`
- **Error**: `bg-red-100 text-red-800` → `dark:bg-red-900 dark:text-red-300`
- **Warning**: `bg-yellow-100 text-yellow-800` → `dark:bg-yellow-900 dark:text-yellow-300`
- **Info**: `bg-blue-100 text-blue-800` → `dark:bg-blue-900 dark:text-blue-300`

### Role Badges

- **Super Admin**: Purple with `dark:bg-purple-900 dark:text-purple-300`
- **Admin**: Red with `dark:bg-red-900 dark:text-red-300`
- **Editor**: Blue with `dark:bg-blue-900 dark:text-blue-300`
- **Author**: Green with `dark:bg-green-900 dark:text-green-300`
- **Viewer**: Gray with `dark:bg-gray-700 dark:text-gray-300`

## Implementation Pattern

When adding dark mode to a new component, follow this pattern:

### 1. Container Backgrounds

```tsx
className = "bg-white dark:bg-gray-800";
```

### 2. Text Colors

```tsx
className = "text-gray-900 dark:text-white"; // Primary
className = "text-gray-500 dark:text-gray-400"; // Secondary
className = "text-gray-700 dark:text-gray-300"; // Labels
```

### 3. Input Fields

```tsx
className="bg-white dark:bg-gray-700
           border-gray-300 dark:border-gray-600
           text-gray-900 dark:text-white
           placeholder-gray-500 dark:placeholder-gray-400"
```

### 4. Buttons

```tsx
// Primary button
className="bg-indigo-600 dark:bg-indigo-500
           hover:bg-indigo-700 dark:hover:bg-indigo-600
           text-white"

// Secondary button
className="bg-white dark:bg-gray-700
           border-gray-300 dark:border-gray-600
           text-gray-700 dark:text-gray-200
           hover:bg-gray-50 dark:hover:bg-gray-600"
```

### 5. Modals

```tsx
// Overlay
className="bg-gray-500 dark:bg-gray-900 opacity-75"

// Modal content
className="bg-white dark:bg-gray-800
           shadow-xl"
```

### 6. Tables

```tsx
// Header
className="bg-gray-50 dark:bg-gray-900
           text-gray-900 dark:text-white"

// Body
className="bg-white dark:bg-gray-800
           divide-y divide-gray-200 dark:divide-gray-700"
```

### 7. Hover States

```tsx
className = "hover:bg-gray-50 dark:hover:bg-gray-700";
```

### 8. Focus States

```tsx
className="focus:ring-indigo-500 dark:focus:ring-indigo-400
           focus:ring-offset-white dark:focus:ring-offset-gray-800"
```

## Best Practices

### 1. Maintain Contrast Ratios

Ensure text meets WCAG AA standards (4.5:1 for normal text):

- Light mode: Dark text on light backgrounds
- Dark mode: Light text on dark backgrounds

### 2. Test Both Modes

Always test components in both light and dark modes to ensure:

- Text is readable
- Borders are visible
- Icons are clear
- Hover states are distinguishable
- Focus indicators are visible

### 3. Use Semantic Colors

Keep color semantics consistent:

- Red for errors/danger
- Green for success
- Yellow for warnings
- Blue for information
- Indigo for primary actions

### 4. Avoid Pure Black/White

Use near-black and near-white for better visual comfort:

- Dark mode background: `#111827` (gray-900) not `#000000`
- Dark mode text: `#ffffff` not `#f9fafb`

### 5. Consistent Depth Hierarchy

Maintain visual depth in dark mode:

- Background: gray-900
- Cards: gray-800
- Nested cards: gray-700
- Hover states: gray-750/600

## Testing Dark Mode

### Manual Testing

1. Click the theme toggle button in the admin header
2. Verify all components display correctly
3. Check that preference is saved (refresh page)
4. Test system preference detection:
   - Clear localStorage: `localStorage.removeItem('theme')`
   - Change system dark mode setting
   - Refresh page

### Browser DevTools

Use Chrome DevTools to emulate dark mode:

1. Open DevTools (F12)
2. Open Command Palette (Ctrl+Shift+P)
3. Type "Render"
4. Select "Emulate CSS media feature prefers-color-scheme: dark"

### Accessibility Testing

Verify contrast ratios:

1. Use Chrome DevTools Accessibility panel
2. Check contrast ratios for all text
3. Ensure focus indicators are visible
4. Test with screen readers

## Troubleshooting

### Theme Not Persisting

**Problem**: Theme resets on page refresh

**Solution**: Check localStorage is working:

```javascript
console.log(localStorage.getItem("theme"));
```

### Flash of Unstyled Content

**Problem**: Page flashes light mode before switching to dark

**Solution**: Ensure inline script in Layout.astro runs before body renders

### Hydration Mismatch Errors

**Problem**: React hydration errors with theme toggle

**Solution**: Use `mounted` state in components:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <LoadingState />;
```

### Colors Not Changing

**Problem**: Some elements don't respond to dark mode

**Solution**: Check that:

1. Tailwind config has `darkMode: 'class'`
2. Element has both light and `dark:` classes
3. Parent elements don't block dark mode cascade

## Future Enhancements

Potential improvements:

- [ ] Auto-switch based on time of day
- [ ] Multiple theme variants (blue, purple, green)
- [ ] User-customizable color schemes
- [ ] High contrast mode for accessibility
- [ ] Separate theme preferences per workspace
- [ ] Theme preview before applying
- [ ] Smooth transitions between themes
- [ ] Theme sync across browser tabs
