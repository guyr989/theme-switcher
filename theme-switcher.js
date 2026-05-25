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

  /*
   * COLOR THEORY NOTES
   * ─────────────────────────────────────────────────────────────────────
   * Every palette follows four rules:
   *
   * 1. 60-30-10 rule  — background(60) · surface+muted(30) · accent(10)
   * 2. Hue-tinted neutrals — no pure grays; every neutral carries the
   *    dominant hue so the palette feels cohesive, not pasted together.
   * 3. Harmonic accent — accent is either COMPLEMENTARY (opposite hue,
   *    max visual pop) or ANALOGOUS (adjacent hue, elegant harmony).
   * 4. Saturation arc — darks: richly saturated · lights: same hue, washed.
   *    The glow is the accent hex converted to rgba at 22% opacity.
   * ───────────────────────────────────────────────────────────────────── */

  var THEMES = {

    // ── Default — OgEnergy brand ────────────────────────────────────────
    // Complementary pair: deep slate-navy (primary) + vivid orange (accent).
    // Blue–orange is the strongest natural complementary contrast.
    default: {
      label: 'Default (OgEnergy)',
      vars: {
        'color-primary':       '#0d1526',  // deep slate-navy
        'color-secondary':     '#1a2640',
        'color-accent':        '#f97316',  // vivid orange — complement to navy
        'color-accent-dark':   '#e06010',
        'color-accent-glow':   'rgba(249,115,22,.22)',
        'color-background':    '#f9fbff',  // barely blue-white (tinted neutral)
        'color-surface':       '#ffffff',
        'color-foreground':    '#0d1526',
        'color-muted':         '#eef2fa',  // blue-tinted muted
        'color-muted-text':    '#4f6080',  // blue-gray — same hue family
        'color-border':        '#d8e0f0',
      },
      extra: []
    },

    // ── MUSIC THEMES ────────────────────────────────────────────────────

    // Pop — split-complementary: deep violet + hot magenta accent.
    // Maxed saturation on the accent (bubblegum energy).
    // Backgrounds tinted with the primary violet hue.
    pop: {
      label: 'Pop',
      vars: {
        'color-primary':       '#1e0040',  // deep violet
        'color-secondary':     '#320065',  // vivid purple
        'color-accent':        '#f200aa',  // hot magenta — max saturation
        'color-accent-dark':   '#c2008a',
        'color-accent-glow':   'rgba(242,0,170,.22)',
        'color-background':    '#fff4fe',  // barely pink-tinted
        'color-surface':       '#fffaff',
        'color-foreground':    '#1e0040',
        'color-muted':         '#f5e0ff',  // light violet — same hue as primary
        'color-muted-text':    '#8b16c0',  // vivid purple, readable on light
        'color-border':        '#e0b8f8',  // soft violet
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(255,244,254,.92)' },
        { sel: '.footer',     prop: 'background', val: '#1e0040' },
        { sel: '.stats-bar',  prop: 'background', val: '#320065' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#1e0040 0%,#560090 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#1e0040 0%,#560090 55%,#8a007a 100%)' },
      ]
    },

    // Rock — near-monochromatic dark + blood-red accent (analogous warmth).
    // Warm tint in every neutral — the whole palette breathes heat.
    rock: {
      label: 'Rock',
      vars: {
        'color-primary':       '#110808',  // near-black, warm red tint
        'color-secondary':     '#1e0e0e',  // dark warm-charcoal
        'color-accent':        '#c41a00',  // blood red — desaturated for grit
        'color-accent-dark':   '#9a1500',
        'color-accent-glow':   'rgba(196,26,0,.25)',
        'color-background':    '#f7f3f2',  // bone-white (warm tinted, not pure)
        'color-surface':       '#ffffff',
        'color-foreground':    '#110808',
        'color-muted':         '#eee8e6',  // warm gray
        'color-muted-text':    '#6e5550',  // warm brownish-gray
        'color-border':        '#d6cbc8',  // warm gray border
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(247,243,242,.92)' },
        { sel: '.footer',     prop: 'background', val: '#110808' },
        { sel: '.stats-bar',  prop: 'background', val: '#1e0e0e' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#110808 0%,#400000 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#110808 0%,#400000 60%,#1e0e0e 100%)' },
      ]
    },

    // Classical — analogous warm harmony: mahogany → rich brown → antique gold.
    // All colors share the 25°–45° warm-orange hue range.
    // Parchment backgrounds evoke aged scores and concert halls.
    classical: {
      label: 'Classical',
      vars: {
        'color-primary':       '#1c0a00',  // deep mahogany
        'color-secondary':     '#361500',  // rich warm brown
        'color-accent':        '#c8940a',  // antique gold — analogous to brown
        'color-accent-dark':   '#9e7308',
        'color-accent-glow':   'rgba(200,148,10,.22)',
        'color-background':    '#fffcf0',  // warm cream / parchment
        'color-surface':       '#fffff8',  // very warm white
        'color-foreground':    '#1c0a00',
        'color-muted':         '#f8edd8',  // light parchment
        'color-muted-text':    '#8a6830',  // warm brown — same hue family
        'color-border':        '#e8d4a0',  // wheat / tan
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(255,252,240,.92)' },
        { sel: '.footer',     prop: 'background', val: '#1c0a00' },
        { sel: '.stats-bar',  prop: 'background', val: '#361500' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#1c0a00 0%,#6b3c00 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#1c0a00 0%,#5a3000 55%,#361500 100%)' },
      ]
    },

    // Jazz — complementary contrast: deep midnight navy vs warm amber/gold.
    // Navy (210°) and amber (40°) sit ~170° apart — nearly perfect complement.
    // Light side is warm-parchment; dark side is cool-blue → classic smoky contrast.
    jazz: {
      label: 'Jazz',
      vars: {
        'color-primary':       '#04101e',  // midnight navy-black
        'color-secondary':     '#071c34',  // deep navy
        'color-accent':        '#e0960c',  // warm amber — complement to navy
        'color-accent-dark':   '#b87808',
        'color-accent-glow':   'rgba(224,150,12,.22)',
        'color-background':    '#f7f4ec',  // warm parchment (cigarette-smoke warmth)
        'color-surface':       '#fefdf6',  // warm white
        'color-foreground':    '#04101e',
        'color-muted':         '#ede7d6',  // warm sand
        'color-muted-text':    '#5c4c2e',  // warm brown — same hue as background
        'color-border':        '#d8caa8',  // warm tan
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(247,244,236,.92)' },
        { sel: '.footer',     prop: 'background', val: '#04101e' },
        { sel: '.stats-bar',  prop: 'background', val: '#071c34' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#04101e 0%,#1a3560 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#04101e 0%,#071c34 55%,#1a3060 100%)' },
      ]
    },

    // Metal — cold industrial monochromatic + electric cyan accent.
    // Everything is blue-shifted; the cyan accent feels like electric sparks on steel.
    // Cold tinted neutrals reinforce the machine-like precision.
    metal: {
      label: 'Metal',
      vars: {
        'color-primary':       '#06090e',  // cold near-black (blue tint)
        'color-secondary':     '#0c1520',  // dark steel-blue
        'color-accent':        '#00b4f0',  // electric cyan — cold complement to the dark
        'color-accent-dark':   '#0090c0',
        'color-accent-glow':   'rgba(0,180,240,.22)',
        'color-background':    '#edf3f8',  // cold blue-gray light
        'color-surface':       '#f6fafd',  // cold white
        'color-foreground':    '#06090e',
        'color-muted':         '#dce8f0',  // cold light blue
        'color-muted-text':    '#3a5870',  // cold blue-gray — same hue as accent
        'color-border':        '#aac4d8',  // cool steel blue
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(237,243,248,.92)' },
        { sel: '.footer',     prop: 'background', val: '#06090e' },
        { sel: '.stats-bar',  prop: 'background', val: '#0c1520' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#06090e 0%,#0c2540 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#06090e 0%,#0c2540 55%,#1a3050 100%)' },
      ]
    },

    // ── SPECIALTY THEMES ────────────────────────────────────────────────

    // Sci-Fi — dark forest/alien base + maxed-saturation biotech green.
    // The neon green (HSL 150°, 100%, 45%) pops against the near-black green base.
    // All neutrals are green-tinted — like looking through a NVG lens.
    scifi: {
      label: 'Sci-Fi',
      vars: {
        'color-primary':       '#010f06',  // near-black with green tint
        'color-secondary':     '#021a0a',  // dark alien forest
        'color-accent':        '#00e87a',  // biotech green — max saturation
        'color-accent-dark':   '#00be62',
        'color-accent-glow':   'rgba(0,232,122,.22)',
        'color-background':    '#f0faf5',  // barely green-tinted
        'color-surface':       '#f7fffc',  // green-white
        'color-foreground':    '#010f06',
        'color-muted':         '#d8f5e8',  // light mint
        'color-muted-text':    '#1a6e48',  // dark green — same hue, readable
        'color-border':        '#9ed8be',  // medium mint
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(240,250,245,.92)' },
        { sel: '.footer',     prop: 'background', val: '#010f06' },
        { sel: '.stats-bar',  prop: 'background', val: '#021a0a' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#010f06 0%,#003d20 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#010f06 0%,#003d20 55%,#021a0a 100%)' },
      ]
    },

    // Futuristic — deep indigo base + vivid violet accent (analogous harmony).
    // Primary (indigo ~255°) and accent (violet ~270°) are analogous — 15° apart.
    // Result: iridescent, holographic, single-hue depth rather than jarring contrast.
    futuristic: {
      label: 'Futuristic',
      vars: {
        'color-primary':       '#05003a',  // deep space indigo
        'color-secondary':     '#0c0060',  // vivid dark indigo
        'color-accent':        '#7c3aed',  // vivid violet — analogous to indigo
        'color-accent-dark':   '#5b21b6',
        'color-accent-glow':   'rgba(124,58,237,.25)',
        'color-background':    '#f7f5ff',  // barely violet-tinted
        'color-surface':       '#fdfcff',  // violet-white
        'color-foreground':    '#05003a',
        'color-muted':         '#ede8ff',  // light lavender
        'color-muted-text':    '#5b34c8',  // vivid purple — readable on light
        'color-border':        '#ccc0ff',  // soft lavender
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(247,245,255,.92)' },
        { sel: '.footer',     prop: 'background', val: '#05003a' },
        { sel: '.stats-bar',  prop: 'background', val: '#0c0060' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#05003a 0%,#1a00b8 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#05003a 0%,#0c0060 55%,#2400c8 100%)' },
      ]
    },

    // Patriotic — split-complementary: deep navy (210°) + bold crimson (355°).
    // Red and blue are ~145° apart — strong tension, officially bold.
    // Light side carries a faint cool-blue tint — crisp and authoritative.
    patriotic: {
      label: 'Patriotic',
      vars: {
        'color-primary':       '#00183a',  // deep navy
        'color-secondary':     '#002768',  // true flag-blue
        'color-accent':        '#c01021',  // bold crimson
        'color-accent-dark':   '#920c1a',
        'color-accent-glow':   'rgba(192,16,33,.22)',
        'color-background':    '#f4f7ff',  // barely blue-tinted (official, clean)
        'color-surface':       '#ffffff',
        'color-foreground':    '#00183a',
        'color-muted':         '#e6ecf8',  // light blue
        'color-muted-text':    '#2a4888',  // medium navy — same hue as primary
        'color-border':        '#afc0e0',  // soft blue
      },
      extra: [
        { sel: '.nav',        prop: 'background', val: 'rgba(244,247,255,.92)' },
        { sel: '.footer',     prop: 'background', val: '#00183a' },
        { sel: '.stats-bar',  prop: 'background', val: '#002768' },
        { sel: '.cta-section',prop: 'background', val: 'linear-gradient(135deg,#00183a 0%,#002768 100%)' },
        { sel: '.page-hero',  prop: 'background', val: 'linear-gradient(150deg,#00183a 0%,#002768 55%,#c01021 100%)' },
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
