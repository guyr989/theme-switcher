/**
 * theme-switcher.js
 *
 * Dual-mode: browser plugin + Node.js CLI
 *
 * Browser: inject <script src="theme-switcher.js"> into any HTML page.
 *   Injects a floating theme picker that overrides CSS custom properties.
 *   Theme is persisted via localStorage under key "ts-theme".
 *
 * CLI:
 *   node theme-switcher.js --input file.html --theme rock [--output out.html]
 *   node theme-switcher.js --input style.css  --theme jazz [--output out.css]
 *   node theme-switcher.js --list
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(); // Node.js
  } else {
    factory(root); // Browser
  }
}(typeof window !== 'undefined' ? window : global, function (win) {

  /* ─────────────────────────────────────────────────────────────────────
   * THEME DEFINITIONS
   * Each theme has:
   *   vars   – CSS custom property overrides (keys without --)
   *   extra  – array of { selector, property, value } for hardcoded colors
   * ───────────────────────────────────────────────────────────────────── */

  var THEMES = {

    default: {
      label: 'Default (OgEnergy)',
      vars: {
        'color-primary':       '#0f172a',
        'color-secondary':     '#1e293b',
        'color-accent':        '#f97316',
        'color-accent-dark':   '#ea580c',
        'color-accent-glow':   'rgba(249,115,22,.25)',
        'color-background':    '#fafafa',
        'color-surface':       '#ffffff',
        'color-foreground':    '#0f172a',
        'color-muted':         '#f1f5f9',
        'color-muted-text':    '#64748b',
        'color-border':        '#e2e8f0',
      },
      extra: []
    },

    /* ── MUSIC THEMES ───────────────────────────────────────────────── */

    pop: {
      label: 'Pop',
      vars: {
        'color-primary':       '#1a0533',
        'color-secondary':     '#2d0a52',
        'color-accent':        '#e040fb',
        'color-accent-dark':   '#aa00ff',
        'color-accent-glow':   'rgba(224,64,251,.28)',
        'color-background':    '#fdf4ff',
        'color-surface':       '#ffffff',
        'color-foreground':    '#1a0533',
        'color-muted':         '#f3e5f5',
        'color-muted-text':    '#7b1fa2',
        'color-border':        '#e1bee7',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(253,244,255,.92)' },
        { sel: '.footer',     prop: 'background', val: '#1a0533' },
        { sel: '.stats-bar',  prop: 'background', val: '#2d0a52' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#1a0533 0%,#4a148c 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#1a0533 0%,#4a148c 60%,#880e4f 100%)' },
      ]
    },

    rock: {
      label: 'Rock',
      vars: {
        'color-primary':       '#0d0d0d',
        'color-secondary':     '#1a1a1a',
        'color-accent':        '#d32f2f',
        'color-accent-dark':   '#b71c1c',
        'color-accent-glow':   'rgba(211,47,47,.30)',
        'color-background':    '#f5f5f5',
        'color-surface':       '#ffffff',
        'color-foreground':    '#0d0d0d',
        'color-muted':         '#eeeeee',
        'color-muted-text':    '#616161',
        'color-border':        '#bdbdbd',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(245,245,245,.92)' },
        { sel: '.footer',     prop: 'background', val: '#0d0d0d' },
        { sel: '.stats-bar',  prop: 'background', val: '#1a1a1a' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#0d0d0d 0%,#3e0000 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#0d0d0d 0%,#3e0000 60%,#212121 100%)' },
      ]
    },

    classical: {
      label: 'Classical',
      vars: {
        'color-primary':       '#1a1200',
        'color-secondary':     '#3e2a00',
        'color-accent':        '#b8860b',
        'color-accent-dark':   '#8b6508',
        'color-accent-glow':   'rgba(184,134,11,.28)',
        'color-background':    '#fffdf5',
        'color-surface':       '#ffffff',
        'color-foreground':    '#1a1200',
        'color-muted':         '#fdf6e3',
        'color-muted-text':    '#7c6002',
        'color-border':        '#e8d8a0',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(255,253,245,.92)' },
        { sel: '.footer',     prop: 'background', val: '#1a1200' },
        { sel: '.stats-bar',  prop: 'background', val: '#3e2a00' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#1a1200 0%,#6b4c00 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#1a1200 0%,#5c3d00 60%,#3e2a00 100%)' },
      ]
    },

    jazz: {
      label: 'Jazz',
      vars: {
        'color-primary':       '#0a1628',
        'color-secondary':     '#112244',
        'color-accent':        '#f0a500',
        'color-accent-dark':   '#c8880a',
        'color-accent-glow':   'rgba(240,165,0,.28)',
        'color-background':    '#f8f5ee',
        'color-surface':       '#ffffff',
        'color-foreground':    '#0a1628',
        'color-muted':         '#f0ebe0',
        'color-muted-text':    '#5d4e2a',
        'color-border':        '#ddd0b0',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(248,245,238,.92)' },
        { sel: '.footer',     prop: 'background', val: '#0a1628' },
        { sel: '.stats-bar',  prop: 'background', val: '#112244' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#0a1628 0%,#2a3f6b 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#0a1628 0%,#112244 60%,#2a3a60 100%)' },
      ]
    },

    metal: {
      label: 'Metal',
      vars: {
        'color-primary':       '#080c10',
        'color-secondary':     '#111820',
        'color-accent':        '#00e5ff',
        'color-accent-dark':   '#00b8d4',
        'color-accent-glow':   'rgba(0,229,255,.28)',
        'color-background':    '#f0f4f8',
        'color-surface':       '#ffffff',
        'color-foreground':    '#080c10',
        'color-muted':         '#e8ecf0',
        'color-muted-text':    '#455a64',
        'color-border':        '#b0bec5',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(240,244,248,.92)' },
        { sel: '.footer',     prop: 'background', val: '#080c10' },
        { sel: '.stats-bar',  prop: 'background', val: '#111820' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#080c10 0%,#0d2135 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#080c10 0%,#0d2135 60%,#1a2a3a 100%)' },
      ]
    },

    /* ── SPECIALTY THEMES ───────────────────────────────────────────── */

    scifi: {
      label: 'Sci-Fi',
      vars: {
        'color-primary':       '#050d1a',
        'color-secondary':     '#091628',
        'color-accent':        '#00ff9f',
        'color-accent-dark':   '#00cc7a',
        'color-accent-glow':   'rgba(0,255,159,.28)',
        'color-background':    '#f0faf6',
        'color-surface':       '#ffffff',
        'color-foreground':    '#050d1a',
        'color-muted':         '#e0f5ed',
        'color-muted-text':    '#2e7d64',
        'color-border':        '#a7e8d0',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(240,250,246,.92)' },
        { sel: '.footer',     prop: 'background', val: '#050d1a' },
        { sel: '.stats-bar',  prop: 'background', val: '#091628' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#050d1a 0%,#003d2a 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#050d1a 0%,#003d2a 60%,#091628 100%)' },
      ]
    },

    futuristic: {
      label: 'Futuristic',
      vars: {
        'color-primary':       '#07003d',
        'color-secondary':     '#0e0066',
        'color-accent':        '#6c63ff',
        'color-accent-dark':   '#4a40e8',
        'color-accent-glow':   'rgba(108,99,255,.30)',
        'color-background':    '#f5f4ff',
        'color-surface':       '#ffffff',
        'color-foreground':    '#07003d',
        'color-muted':         '#ede9ff',
        'color-muted-text':    '#4a3fbf',
        'color-border':        '#c9c4f5',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(245,244,255,.92)' },
        { sel: '.footer',     prop: 'background', val: '#07003d' },
        { sel: '.stats-bar',  prop: 'background', val: '#0e0066' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#07003d 0%,#1a00b8 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#07003d 0%,#0e0066 60%,#2400c8 100%)' },
      ]
    },

    patriotic: {
      label: 'Patriotic',
      vars: {
        'color-primary':       '#00205b',
        'color-secondary':     '#003087',
        'color-accent':        '#bf0a30',
        'color-accent-dark':   '#8b0020',
        'color-accent-glow':   'rgba(191,10,48,.28)',
        'color-background':    '#f8f9ff',
        'color-surface':       '#ffffff',
        'color-foreground':    '#00205b',
        'color-muted':         '#eef1ff',
        'color-muted-text':    '#334d8f',
        'color-border':        '#b0bbdd',
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(248,249,255,.92)' },
        { sel: '.footer',     prop: 'background', val: '#00205b' },
        { sel: '.stats-bar',  prop: 'background', val: '#003087' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#00205b 0%,#003087 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#00205b 0%,#003087 60%,#bf0a30 100%)' },
      ]
    },

  };

  /* ─────────────────────────────────────────────────────────────────────
   * SHARED HELPERS
   * ───────────────────────────────────────────────────────────────────── */

  function themeNames() {
    return Object.keys(THEMES);
  }

  /**
   * Build a <style> block string for the given theme name.
   * Used both by the CLI (text injection) and browser (style element).
   */
  function buildCSS(themeName) {
    var t = THEMES[themeName];
    if (!t) return '';
    var lines = [':root {'];
    var vars = t.vars;
    for (var k in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, k)) {
        lines.push('  --' + k + ': ' + vars[k] + ';');
      }
    }
    lines.push('}');
    if (t.extra && t.extra.length) {
      for (var i = 0; i < t.extra.length; i++) {
        var e = t.extra[i];
        lines.push(e.sel + ' { ' + e.prop + ': ' + e.val + ' !important; }');
      }
    }
    return lines.join('\n');
  }

  /* ─────────────────────────────────────────────────────────────────────
   * BROWSER MODE
   * ───────────────────────────────────────────────────────────────────── */

  if (typeof win !== 'undefined' && win.document) {

    var STORAGE_KEY = 'ts-theme';
    var PICKER_ID   = 'ts-picker';
    var STYLE_ID    = 'ts-theme';

    function applyTheme(name) {
      if (!THEMES[name]) name = 'default';
      var el = document.getElementById(STYLE_ID);
      if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ID;
        document.head.appendChild(el);
      }
      el.textContent = buildCSS(name);
      localStorage.setItem(STORAGE_KEY, name);

      // Update picker active state
      var btns = document.querySelectorAll('.ts-btn');
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].getAttribute('data-theme') === name) {
          btns[i].classList.add('ts-active');
        } else {
          btns[i].classList.remove('ts-active');
        }
      }
    }

    function buildPicker() {
      if (document.getElementById(PICKER_ID)) return;

      var names = themeNames();
      var wrapper = document.createElement('div');
      wrapper.id = PICKER_ID;

      var stored = localStorage.getItem(STORAGE_KEY) || 'default';

      /* Inline styles so the picker works on any site without external CSS */
      var pickerStyles = [
        'position:fixed',
        'bottom:1.5rem',
        'left:1.5rem',
        'z-index:2147483647',
        'font-family:system-ui,sans-serif',
        'font-size:13px',
      ].join(';');

      var panelStyles = [
        'background:#fff',
        'border:1px solid #e2e8f0',
        'border-radius:12px',
        'box-shadow:0 8px 32px rgba(0,0,0,.15)',
        'padding:.75rem',
        'min-width:220px',
        'display:none',
      ].join(';');

      var toggleBtnStyles = [
        'display:flex',
        'align-items:center',
        'gap:.4rem',
        'background:#fff',
        'border:1px solid #e2e8f0',
        'border-radius:9999px',
        'padding:.45rem .9rem',
        'cursor:pointer',
        'font-size:.8rem',
        'font-weight:700',
        'color:#0f172a',
        'box-shadow:0 2px 8px rgba(0,0,0,.12)',
        'transition:box-shadow 200ms',
      ].join(';');

      var panel = document.createElement('div');
      panel.id = 'ts-panel';
      panel.style.cssText = panelStyles;

      var heading = document.createElement('div');
      heading.textContent = 'Theme';
      heading.style.cssText = 'font-weight:700;color:#0f172a;margin-bottom:.5rem;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;';
      panel.appendChild(heading);

      var grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:.35rem;';

      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var t = THEMES[name];
        var btn = document.createElement('button');
        btn.className = 'ts-btn';
        btn.setAttribute('data-theme', name);
        var isActive = name === stored;

        btn.style.cssText = [
          'display:flex',
          'align-items:center',
          'gap:.4rem',
          'background:' + (isActive ? '#f1f5f9' : 'transparent'),
          'border:1.5px solid ' + (isActive ? t.vars['color-accent'] : '#e2e8f0'),
          'border-radius:8px',
          'padding:.3rem .5rem',
          'cursor:pointer',
          'font-size:.75rem',
          'font-weight:600',
          'color:#0f172a',
          'text-align:start',
          'transition:border-color 150ms',
        ].join(';');

        if (isActive) btn.classList.add('ts-active');

        // Color swatch
        var swatch = document.createElement('span');
        swatch.style.cssText = [
          'display:inline-block',
          'width:12px',
          'height:12px',
          'border-radius:50%',
          'background:' + t.vars['color-accent'],
          'flex-shrink:0',
          'border:1px solid rgba(0,0,0,.1)',
        ].join(';');
        btn.appendChild(swatch);
        btn.appendChild(document.createTextNode(t.label));

        (function (n, b, accent) {
          b.addEventListener('mouseenter', function () {
            b.style.borderColor = accent;
          });
          b.addEventListener('mouseleave', function () {
            if (!b.classList.contains('ts-active')) {
              b.style.borderColor = '#e2e8f0';
            }
          });
          b.addEventListener('click', function () {
            applyTheme(n);
            // update border on all buttons
            var all = document.querySelectorAll('.ts-btn');
            for (var j = 0; j < all.length; j++) {
              var a = all[j].getAttribute('data-theme');
              all[j].style.borderColor = (a === n) ? THEMES[a].vars['color-accent'] : '#e2e8f0';
              all[j].style.background  = (a === n) ? '#f1f5f9' : 'transparent';
            }
          });
        }(name, btn, t.vars['color-accent']));

        grid.appendChild(btn);
      }
      panel.appendChild(grid);

      var toggleBtn = document.createElement('button');
      toggleBtn.style.cssText = toggleBtnStyles;

      var paletteIcon = '🎨';
      toggleBtn.innerHTML = paletteIcon + ' <span>Theme</span>';

      var panelOpen = false;
      function togglePanel() {
        panelOpen = !panelOpen;
        panel.style.display = panelOpen ? 'block' : 'none';
      }

      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePanel();
      });

      function onDocClick(e) {
        if (!wrapper.contains(e.target)) {
          panelOpen = false;
          panel.style.display = 'none';
        }
      }
      document.addEventListener('click', onDocClick);

      wrapper.style.cssText = pickerStyles;
      wrapper.appendChild(panel);
      wrapper.appendChild(toggleBtn);
      document.body.appendChild(wrapper);

      // Apply stored theme on load
      if (stored !== 'default') applyTheme(stored);
    }

    // Init after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildPicker);
    } else {
      buildPicker();
    }

    // Expose for programmatic use
    win.ThemeSwitcher = { apply: applyTheme, themes: THEMES, buildCSS: buildCSS };
    return win.ThemeSwitcher;
  }

  /* ─────────────────────────────────────────────────────────────────────
   * NODE.JS CLI MODE
   * ───────────────────────────────────────────────────────────────────── */

  var fs   = require('fs');
  var path = require('path');

  var args = process.argv.slice(2);

  function printUsage() {
    console.log([
      '',
      'Usage:',
      '  node theme-switcher.js --input <file> --theme <name> [--output <file>]',
      '  node theme-switcher.js --list',
      '',
      'Options:',
      '  --input   Path to .html or .css file',
      '  --theme   Theme name (see --list)',
      '  --output  Output path (default: overwrites input)',
      '  --list    Print all available theme names',
      '',
    ].join('\n'));
  }

  function getArg(flag) {
    var idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  }

  if (args.indexOf('--list') !== -1) {
    console.log('\nAvailable themes:\n');
    var names = themeNames();
    for (var i = 0; i < names.length; i++) {
      console.log('  ' + names[i] + '\t— ' + THEMES[names[i]].label);
    }
    console.log('');
    process.exit(0);
  }

  var inputFile  = getArg('--input');
  var themeName  = getArg('--theme');
  var outputFile = getArg('--output') || inputFile;

  if (!inputFile || !themeName) {
    console.error('\nError: --input and --theme are required.\n');
    printUsage();
    process.exit(1);
  }

  if (!THEMES[themeName]) {
    console.error('\nError: Unknown theme "' + themeName + '". Run with --list to see options.\n');
    process.exit(1);
  }

  var ext     = path.extname(inputFile).toLowerCase();
  var content = fs.readFileSync(inputFile, 'utf8');
  var cssBlock = buildCSS(themeName);

  if (ext === '.css') {
    /* Replace or prepend :root block */
    var rootRe = /:root\s*\{[^}]*\}/;
    if (rootRe.test(content)) {
      content = content.replace(rootRe, cssBlock);
    } else {
      content = cssBlock + '\n\n' + content;
    }
  } else {
    /* HTML: inject/replace <style id="ts-theme"> block before </head> */
    var styleTagRe = /<style id="ts-theme"[^>]*>[\s\S]*?<\/style>/i;
    var injection  = '<style id="ts-theme">\n' + cssBlock + '\n</style>';
    if (styleTagRe.test(content)) {
      content = content.replace(styleTagRe, injection);
    } else {
      content = content.replace(/<\/head>/i, injection + '\n</head>');
    }
  }

  fs.writeFileSync(outputFile, content, 'utf8');
  console.log('\nTheme "' + themeName + '" applied to ' + outputFile + '\n');

}));
