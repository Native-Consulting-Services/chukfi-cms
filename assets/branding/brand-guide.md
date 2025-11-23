# Chukfi CMS Brand Guidelines

## Overview

**Chukfi CMS** represents speed, agility, and intelligence - inspired by the Choctaw word for rabbit. Our visual identity reflects these core values through clean, modern design that emphasizes performance and ease of use.

## Logo

### Primary Logo

- **File**: `logo.svg`
- **Usage**: Main logo for headers, documentation, and official communications
- **Format**: Vector SVG for scalability
- **Minimum size**: 120px width
- **Clear space**: 20px on all sides

### Logo Variations

- `logo.svg` - Primary logo (full color)
- `logo-dark.svg` - Dark variant for light backgrounds
- `logo-light.svg` - Light variant for dark backgrounds
- `logo-monochrome.svg` - Single color version
- `icon.svg` - Icon only (no text)
- `favicon.ico` - 32x32 favicon for web

## Color Palette

### Primary Colors

```
Brand Blue:    #3B82F6  (rgb(59, 130, 246))
Brand Dark:    #1E293B  (rgb(30, 41, 59))
Brand Light:   #F8FAFC  (rgb(248, 250, 252))
```

### Accent Colors

```
Success:       #10B981  (rgb(16, 185, 129))
Warning:       #F59E0B  (rgb(245, 158, 11))
Error:         #EF4444  (rgb(239, 68, 68))
Neutral:       #6B7280  (rgb(107, 114, 128))
```

### Usage Guidelines

- **Primary blue** for call-to-action buttons, links, and primary UI elements
- **Dark** for headers, primary text, and navigation
- **Light** for backgrounds and subtle UI elements
- **Accent colors** for status indicators and interactive feedback

## Typography

### Primary Font: Inter

- **Usage**: Headers, UI elements, documentation
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Source**: [Google Fonts](https://fonts.google.com/specimen/Inter)

### Code Font: JetBrains Mono

- **Usage**: Code blocks, API documentation, terminal examples
- **Weights**: 400 (Regular), 500 (Medium), 700 (Bold)
- **Source**: [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono)

## Icon System

### Style

- **Outline style** icons from Heroicons
- **24px** standard size
- **1.5px** stroke width
- **Rounded corners** when applicable

### Usage

- Consistent iconography across admin dashboard
- Icons should support the rabbit/speed theme when possible
- Use icons sparingly - prioritize clarity over decoration

## Voice & Tone

### Brand Voice

- **Fast**: Emphasize speed and performance
- **Clever**: Highlight intelligent design decisions
- **Accessible**: Technical but approachable language
- **Reliable**: Trustworthy and professional

### Writing Guidelines

- Use active voice and action-oriented language
- Keep technical documentation clear and concise
- Include practical examples and quick wins
- Emphasize ease of setup and zero-dependency approach

## Asset Usage

### GitHub Repository

- Logo in README header (200px width)
- Favicon for repository social preview
- Screenshots should follow brand colors
- Documentation images should be clean and minimal

### Admin Dashboard

- Logo in navigation header (150px width)
- Brand colors throughout interface
- Consistent iconography and typography

### Marketing Materials

- High contrast for readability
- Consistent color application
- Professional, modern aesthetic
- Emphasize speed and simplicity messaging

## File Organization

```
assets/
├── branding/
│   ├── logo.svg           # Primary logo
│   ├── logo-dark.svg      # Dark variant
│   ├── logo-light.svg     # Light variant
│   ├── logo-monochrome.svg # Monochrome variant
│   ├── icon.svg           # Icon only
│   ├── favicon.ico        # Web favicon
│   └── brand-guide.md     # This file
├── screenshots/           # Product screenshots
└── social/               # Social media assets
    ├── github-social.png  # Repository social preview
    ├── twitter-card.png   # Twitter card image
    └── og-image.png       # Open Graph image
```

## Examples

### Correct Usage ✅

- Clean backgrounds with adequate contrast
- Proper logo sizing and spacing
- Consistent color application
- Professional typography hierarchy

### Incorrect Usage ❌

- Stretching or distorting the logo
- Insufficient contrast ratios
- Inconsistent color usage
- Cluttered or busy backgrounds
- Comic Sans or inappropriate fonts

## Downloads & Resources

### Logo Files

All logo variations are available in the `assets/branding/` directory:

- SVG format for web and print
- High resolution PNG exports available on request
- AI/Sketch source files available for design team

### Brand Colors (CSS)

```css
:root {
  --chukfi-blue: #3b82f6;
  --chukfi-dark: #1e293b;
  --chukfi-light: #f8fafc;
  --chukfi-success: #10b981;
  --chukfi-warning: #f59e0b;
  --chukfi-error: #ef4444;
  --chukfi-neutral: #6b7280;
}
```

### Tailwind CSS Config

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        chukfi: {
          blue: "#3B82F6",
          dark: "#1E293B",
          light: "#F8FAFC",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          neutral: "#6B7280",
        },
      },
    },
  },
};
```
