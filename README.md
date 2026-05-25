# theme-switcher

A dual-mode CSS theme-switching utility — works as a **browser plugin** (drop a `<script>` tag into any HTML page) and as a **Node.js CLI** (process HTML/CSS files from the command line).

## Installation

### CDN (no build step required)

```html
<!-- jsDelivr via GitHub (recommended) -->
<script src="https://cdn.jsdelivr.net/gh/guyr989/theme-switcher@1.0.0/theme-switcher.js"></script>

<!-- jsDelivr via npm -->
<script src="https://cdn.jsdelivr.net/npm/theme-switcher-js@1.0.0/theme-switcher.js"></script>

<!-- unpkg -->
<script src="https://unpkg.com/theme-switcher-js@1.0.0/theme-switcher.js"></script>
```

### npm

```bash
npm install theme-switcher-js
```

### Self-hosted

Download [`theme-switcher.js`](theme-switcher.js) and serve it yourself:

```html
<script src="/path/to/theme-switcher.js"></script>
```

---

## Built-in Themes

| Name | Label | Accent |
|---|---|---|
| `default` | Default | Orange `#f97316` |
| `pop` | Pop | Magenta `#e040fb` |
| `rock` | Rock | Red `#d32f2f` |
| `classical` | Classical | Dark Gold `#b8860b` |
| `jazz` | Jazz | Amber `#f0a500` |
| `metal` | Metal | Cyan `#00e5ff` |
| `scifi` | Sci-Fi | Neon Green `#00ff9f` |
| `futuristic` | Futuristic | Indigo `#6c63ff` |
| `patriotic` | Patriotic | Crimson `#bf0a30` |

---

## Browser Plugin

Drop the script into any HTML page before `</body>`:

```html
<script src="theme-switcher.js"></script>
```

A floating **🎨 Theme** button appears in the bottom-left corner. Clicking it opens a grid of theme swatches. The selected theme is saved in `localStorage` and restored on the next page load.

### Programmatic API

```js
// Apply a theme by name
ThemeSwitcher.apply('jazz');

// Access theme definitions
console.log(ThemeSwitcher.themes);

// Generate CSS string for a theme
console.log(ThemeSwitcher.buildCSS('rock'));
```

### How it works

The plugin overrides CSS custom properties by injecting a `<style id="ts-theme">` block into `<head>`. Any site that uses CSS variables like `--color-accent`, `--color-background`, etc. will pick up the changes automatically. Hardcoded colors on common selectors (`.nav`, `.footer`, `.stats-bar`, `.cta-section`, `.page-hero`) are also patched via `!important` overrides in each theme definition.

---

## Node.js CLI

```
node theme-switcher.js --input <file> --theme <name> [--output <file>]
node theme-switcher.js --list
```

### Options

| Flag | Description |
|---|---|
| `--input` | Path to `.html` or `.css` file to process |
| `--theme` | Theme name (see `--list`) |
| `--output` | Output path (default: overwrites `--input`) |
| `--list` | Print all available theme names |

### Examples

```bash
# Apply the jazz theme to an HTML file (overwrites in place)
node theme-switcher.js --input index.html --theme jazz

# Apply rock theme to a CSS file, write to a new file
node theme-switcher.js --input style.css --theme rock --output style.rock.css

# List all themes
node theme-switcher.js --list
```

For **HTML files**, the CLI injects (or replaces) a `<style id="ts-theme">` block just before `</head>`.
For **CSS files**, it replaces the first `:root { ... }` block, or prepends one if none exists.

---

## Adding Custom Themes

Extend the `THEMES` object inside `theme-switcher.js`:

```js
THEMES.mytheme = {
  label: 'My Theme',
  vars: {
    'color-primary':     '#001a33',
    'color-secondary':   '#002b52',
    'color-accent':      '#ff6b35',
    'color-accent-dark': '#e55a25',
    'color-accent-glow': 'rgba(255,107,53,.28)',
    'color-background':  '#f8fafc',
    'color-surface':     '#ffffff',
    'color-foreground':  '#001a33',
    'color-muted':       '#f0f4f8',
    'color-muted-text':  '#4a6080',
    'color-border':      '#c8d8e8',
  },
  extra: [
    { sel: '.nav',    prop: 'background', val: 'rgba(248,250,252,.92)' },
    { sel: '.footer', prop: 'background', val: '#001a33' },
  ]
};
```

---

## License

MIT
