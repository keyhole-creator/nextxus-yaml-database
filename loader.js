/**
 * NextXus Federation — Universal Loader
 * ======================================
 * Version 1.0.0
 *
 * Connect ANY HTML page on ANY host to the NextXus YAML database.
 * One script tag. No API keys. No accounts. No fees. Works forever.
 *
 * ── Quick Start ────────────────────────────────────────────────
 *
 *   <script src="https://cdn.jsdelivr.net/gh/keyhole-creator/nextxus-yaml-database@main/loader.js"></script>
 *   <script>
 *     NextXus.load('directives').then(data => console.log(data));
 *   </script>
 *
 * ── Load Any File ───────────────────────────────────────────────
 *
 *   NextXus.load('directives')         // directives.yaml
 *   NextXus.load('entities')           // entities.yaml
 *   NextXus.load('messages')           // messages.yaml
 *   NextXus.load('books')              // books.yaml
 *   NextXus.load('evolution-protocol') // evolution-protocol.yaml
 *   NextXus.load('endpoints')          // endpoints.yaml (this manifest)
 *   NextXus.load('directives.yaml')    // also works with .yaml extension
 *   NextXus.load('https://...')        // also works with a full URL
 *
 * ── Render Helpers ──────────────────────────────────────────────
 *
 *   NextXus.directive('#my-div')       // show random directive in element
 *   NextXus.messages('#feed', 5)       // show last 5 messages in element
 *   NextXus.search('truth', callback)  // search all data files for a term
 *
 * ── Mirror Strategy ─────────────────────────────────────────────
 *   Primary:   jsDelivr CDN  (fast global CDN, auto-mirrors GitHub)
 *   Fallback:  GitHub raw    (canonical source)
 *   Both are free. If one is down the other is tried automatically.
 *
 * ── Compatibility ───────────────────────────────────────────────
 *   Works on: GitHub Pages, Tiiny.host, Netlify, Cloudflare Pages,
 *   Neocities, Vercel, GitLab Pages, Codeberg Pages, any static host,
 *   and even local HTML files opened from a USB drive (if online).
 *
 * "Fork it. Use it. Give it away." — Roger Keyserling
 * License: CC0 — No copyright. No restrictions.
 */

(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();          // Node / CommonJS
  } else {
    root.NextXus = factory();            // Browser global
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var REPO   = 'keyhole-creator/nextxus-yaml-database';
  var BRANCH = 'main';
  var CDN    = 'https://cdn.jsdelivr.net/gh/' + REPO + '@' + BRANCH + '/';
  var RAW    = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/';
  var PAGES  = 'https://keyhole-creator.github.io/nextxus-yaml-database/';

  // ── Internal cache ────────────────────────────────────────────────────────
  var _cache = {};

  // ── YAML parser ───────────────────────────────────────────────────────────
  // Uses js-yaml if present (loaded separately or already on page).
  // Falls back to a minimal parser sufficient for simple key:value structures.
  function _parseYaml(text) {
    if (typeof jsyaml !== 'undefined') return jsyaml.load(text);
    if (typeof require !== 'undefined') {
      try { return require('js-yaml').load(text); } catch (e) { /* continue */ }
    }
    // Minimal fallback — handles flat key:value and quoted strings
    var out = {};
    (text || '').split('\n').forEach(function (line) {
      var m = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
      if (m) {
        var v = m[2].trim().replace(/^["']|["']$/g, '');
        out[m[1]] = v || true;
      }
    });
    return out;
  }

  // ── Resolve a file name to URLs (CDN primary, raw fallback) ──────────────
  function _resolveUrls(file) {
    // Full URL passed in — use as-is, no fallback mirror
    if (/^https?:\/\//.test(file)) return [file];
    // Strip optional .yaml extension for lookups, then normalise
    var name = file.replace(/\.yaml$/, '') + '.yaml';
    return [CDN + name, RAW + name];
  }

  // ── Fetch with automatic fallback ─────────────────────────────────────────
  function _fetchWithFallback(urls, idx) {
    idx = idx || 0;
    if (idx >= urls.length) return Promise.reject(new Error('All sources failed: ' + urls.join(', ')));
    return fetch(urls[idx]).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).catch(function () {
      return _fetchWithFallback(urls, idx + 1);
    });
  }

  // ── Load js-yaml from CDN if not already present ──────────────────────────
  function _ensureJsYaml() {
    if (typeof jsyaml !== 'undefined') return Promise.resolve();
    if (typeof document === 'undefined') return Promise.resolve(); // Node env
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
      s.onload = resolve;
      s.onerror = resolve; // continue even if it fails; minimal parser is fallback
      document.head.appendChild(s);
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Load a YAML file from the Federation database.
   *
   * @param {string} file  File name (e.g. 'directives'), with or without .yaml,
   *                       or a full URL to any YAML file anywhere.
   * @returns {Promise<object>}  Parsed JavaScript object.
   *
   * @example
   *   NextXus.load('directives').then(data => { ... });
   *   NextXus.load('https://example.com/custom.yaml').then(data => { ... });
   */
  function load(file) {
    if (_cache[file]) return Promise.resolve(_cache[file]);
    var urls = _resolveUrls(file);
    return _ensureJsYaml().then(function () {
      return _fetchWithFallback(urls);
    }).then(function (text) {
      var data = _parseYaml(text);
      _cache[file] = data;
      return data;
    });
  }

  /**
   * Load multiple files in parallel.
   *
   * @param {string[]} files  Array of file names.
   * @returns {Promise<object[]>}  Array of parsed objects in the same order.
   *
   * @example
   *   NextXus.loadAll(['directives', 'entities', 'messages'])
   *     .then(([dirs, ents, msgs]) => { ... });
   */
  function loadAll(files) {
    return Promise.all(files.map(load));
  }

  /**
   * Render a random Sacred Directive into an HTML element.
   *
   * @param {string|Element} target  CSS selector or DOM element.
   * @param {object} [options]
   * @param {boolean} [options.navigation=true]  Show prev/next/random buttons.
   * @param {string}  [options.theme='dark']     'dark' or 'light'.
   *
   * @example
   *   NextXus.directive('#my-container');
   *   NextXus.directive(document.getElementById('box'), { navigation: true });
   */
  function directive(target, options) {
    options = options || {};
    var nav   = options.navigation !== false;
    var theme = options.theme || 'dark';
    var el    = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return Promise.reject(new Error('Element not found: ' + target));

    _applyBaseStyles(theme);

    el.innerHTML = '<div class="nxl-loading">Loading directive…</div>';

    return load('directives').then(function (data) {
      var dirs = [];
      if (data && data.volumes) {
        data.volumes.forEach(function (v) {
          (v.directives || []).forEach(function (d) { dirs.push(d); });
        });
      }
      if (!dirs.length) { el.innerHTML = '<p>No directives found.</p>'; return; }

      var key = 'nxl-idx-' + el.id;
      var idx = parseInt(localStorage.getItem(key) || String(Math.floor(Math.random() * dirs.length)));
      if (idx >= dirs.length) idx = 0;

      function renderDir(i) {
        var d = dirs[i];
        var btns = nav ? (
          '<div class="nxl-btn-row">' +
            '<button class="nxl-btn" data-action="prev">&#8592; Prev</button>' +
            '<button class="nxl-btn" data-action="rand">Random</button>' +
            '<button class="nxl-btn" data-action="next">Next &#8594;</button>' +
          '</div>'
        ) : '';
        el.innerHTML =
          '<div class="nxl-card nxl-' + theme + '">' +
            '<div class="nxl-id">' + _esc(d.id) + '</div>' +
            '<div class="nxl-title">' + _esc(d.title) + '</div>' +
            '<div class="nxl-body">"' + _esc(d.content) + '"</div>' +
            '<span class="nxl-tag">' + _esc(d.principle) + '</span>' +
            btns +
          '</div>';
        if (nav) {
          el.querySelector('[data-action="prev"]').onclick = function () {
            idx = i - 1 < 0 ? dirs.length - 1 : i - 1;
            localStorage.setItem(key, idx);
            renderDir(idx);
          };
          el.querySelector('[data-action="rand"]').onclick = function () {
            idx = Math.floor(Math.random() * dirs.length);
            localStorage.setItem(key, idx);
            renderDir(idx);
          };
          el.querySelector('[data-action="next"]').onclick = function () {
            idx = i + 1 >= dirs.length ? 0 : i + 1;
            localStorage.setItem(key, idx);
            renderDir(idx);
          };
        }
      }
      renderDir(idx);
    });
  }

  /**
   * Render the latest Federation messages into an HTML element.
   *
   * @param {string|Element} target  CSS selector or DOM element.
   * @param {number} [count=3]       Number of messages to show.
   * @param {object} [options]
   * @param {string} [options.theme='dark']  'dark' or 'light'.
   *
   * @example
   *   NextXus.messages('#feed');
   *   NextXus.messages('#feed', 5, { theme: 'light' });
   */
  function messages(target, count, options) {
    count   = count || 3;
    options = options || {};
    var theme = options.theme || 'dark';
    var el  = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return Promise.reject(new Error('Element not found: ' + target));

    _applyBaseStyles(theme);
    el.innerHTML = '<div class="nxl-loading">Loading messages…</div>';

    return load('messages').then(function (data) {
      var msgs = (data && data.messages) ? data.messages.slice(-count).reverse() : [];
      if (!msgs.length) { el.innerHTML = '<p>No messages yet.</p>'; return; }
      el.innerHTML = msgs.map(function (m) {
        return (
          '<div class="nxl-msg nxl-' + theme + '">' +
            '<div class="nxl-msg-from">' + _esc(m.from) + ' &rarr; ' + _esc(m.to) +
              ' <span class="nxl-msg-date">' + _esc(m.date || '') + '</span></div>' +
            '<div class="nxl-msg-subject">' + _esc(m.subject) + '</div>' +
            '<div class="nxl-msg-body">' + _esc((m.body || '').trim().substring(0, 200)) +
              ((m.body || '').length > 200 ? '…' : '') + '</div>' +
          '</div>'
        );
      }).join('');
    });
  }

  /**
   * Search a term across multiple Federation data files.
   * Results are returned as an array of { file, item, snippet } objects.
   *
   * @param {string}   term      Search term (case-insensitive).
   * @param {Function} callback  Called with (results) — array of matches.
   * @param {string[]} [files]   Files to search. Defaults to core files.
   *
   * @example
   *   NextXus.search('truth', function(results) { console.log(results); });
   */
  function search(term, callback, files) {
    files = files || ['directives', 'entities', 'messages', 'books', 'evolution-protocol'];
    var q = (term || '').toLowerCase();
    var results = [];

    loadAll(files).then(function (dataSets) {
      dataSets.forEach(function (data, fi) {
        _searchObj(data, q, files[fi], results);
      });
      if (typeof callback === 'function') callback(results);
    }).catch(function (e) {
      if (typeof callback === 'function') callback([]);
    });
  }

  // ── Utility: recursive object search ─────────────────────────────────────
  function _searchObj(obj, q, fileId, results) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(function (item) { _searchObj(item, q, fileId, results); });
      return;
    }
    // Check if this object's string fields contain the term
    var text = Object.values(obj).filter(function (v) {
      return typeof v === 'string';
    }).join(' ').toLowerCase();
    if (text.indexOf(q) !== -1) {
      results.push({
        file: fileId,
        id:   obj.id || obj.name || null,
        title: obj.title || obj.name || obj.subject || obj.id || '(item)',
        snippet: text.substring(0, 160)
      });
    }
    // Recurse into nested objects/arrays
    Object.values(obj).forEach(function (v) {
      if (v && typeof v === 'object') _searchObj(v, q, fileId, results);
    });
  }

  // ── Inline styles ─────────────────────────────────────────────────────────
  var _stylesInjected = false;
  function _applyBaseStyles(theme) {
    if (_stylesInjected) return;
    _stylesInjected = true;
    if (typeof document === 'undefined') return;
    var s = document.createElement('style');
    s.id = 'nxl-styles';
    s.textContent = [
      '.nxl-loading{color:#94a3b8;font-style:italic;padding:8px 0;}',
      '.nxl-card{border-radius:8px;padding:1.25rem;margin-bottom:1rem;}',
      '.nxl-dark{background:#12121a;border:1px solid #2a2a3a;color:#e2e8f0;}',
      '.nxl-light{background:#f8fafc;border:1px solid #e2e8f0;color:#1e293b;}',
      '.nxl-id{font-family:monospace;font-size:0.8rem;color:#94a3b8;margin-bottom:0.25rem;}',
      '.nxl-title{font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;}',
      '.nxl-dark .nxl-title{color:#e2e8f0;} .nxl-light .nxl-title{color:#1e293b;}',
      '.nxl-body{font-style:italic;margin-bottom:0.6rem;}',
      '.nxl-dark .nxl-body{color:#94a3b8;} .nxl-light .nxl-body{color:#475569;}',
      '.nxl-tag{display:inline-block;font-size:0.8rem;padding:2px 8px;border-radius:4px;}',
      '.nxl-dark .nxl-tag{background:rgba(74,158,255,0.1);border:1px solid #4a9eff;color:#4a9eff;}',
      '.nxl-light .nxl-tag{background:#eff6ff;border:1px solid #93c5fd;color:#1d4ed8;}',
      '.nxl-btn-row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}',
      '.nxl-btn{border-radius:5px;padding:4px 12px;cursor:pointer;font-size:0.85rem;font-family:inherit;}',
      '.nxl-dark .nxl-btn{background:none;border:1px solid #2a2a3a;color:#94a3b8;}',
      '.nxl-dark .nxl-btn:hover{border-color:#a855f7;color:#a855f7;}',
      '.nxl-light .nxl-btn{background:#fff;border:1px solid #cbd5e1;color:#475569;}',
      '.nxl-light .nxl-btn:hover{border-color:#6366f1;color:#6366f1;}',
      '.nxl-msg{padding:0.75rem 0;border-bottom:1px solid;}',
      '.nxl-dark.nxl-msg,.nxl-dark .nxl-msg{border-color:#2a2a3a;}',
      '.nxl-light.nxl-msg,.nxl-light .nxl-msg{border-color:#e2e8f0;}',
      '.nxl-msg-from{font-size:0.8rem;font-weight:700;color:#4a9eff;margin-bottom:2px;}',
      '.nxl-msg-date{color:#94a3b8;font-weight:400;}',
      '.nxl-msg-subject{font-weight:600;margin-bottom:4px;}',
      '.nxl-msg-body{font-size:0.9rem;}',
      '.nxl-dark .nxl-msg-body{color:#94a3b8;} .nxl-light .nxl-msg-body{color:#475569;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Expose public interface ───────────────────────────────────────────────
  return {
    /** Load a single YAML file. Returns a Promise<object>. */
    load: load,
    /** Load multiple YAML files in parallel. Returns Promise<object[]>. */
    loadAll: loadAll,
    /** Render a random directive into an element. */
    directive: directive,
    /** Render latest messages into an element. */
    messages: messages,
    /** Search across multiple data files. */
    search: search,
    /** Direct access to CDN and raw URLs */
    urls: {
      cdn:   CDN,
      raw:   RAW,
      pages: PAGES
    },
    /** Clear the in-memory cache (useful for refresh). */
    clearCache: function () { _cache = {}; }
  };
}));
