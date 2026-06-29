/**
 * NextXus Federation Widget
 * Version 1.0.0
 *
 * Embed the Federation on any website with one line:
 *   <script src="https://keyhole-creator.github.io/nextxus-yaml-database/widget.js"></script>
 *
 * Or with a specific container:
 *   <div id="nextxus-widget"></div>
 *   <script src="...widget.js" data-target="nextxus-widget"></script>
 *
 * This widget is free, open, and self-contained.
 * It reads directly from the NextXus YAML database on GitHub.
 * No API keys. No accounts. No bills.
 *
 * "Fork it. Use it. Give it away."
 */

(function() {
  'use strict';

  const REPO = 'keyhole-creator/nextxus-yaml-database';
  const BRANCH = 'main';
  const BASE_URL = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/';
  const HUB_URL = 'https://keyhole-creator.github.io/nextxus-yaml-database/';

  // ── Simple YAML parser for the subset we need ──────────────────────────────
  // We include a minimal YAML parser so the widget has zero dependencies.
  function parseSimpleYaml(text) {
    // Use js-yaml if already loaded on the page
    if (window.jsyaml) return window.jsyaml.load(text);
    // Minimal fallback: extract key: value pairs from flat structures
    var result = {};
    var lines = text.split('\n');
    var current = result;
    lines.forEach(function(line) {
      var m = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
      if (m) {
        var val = m[3].trim().replace(/^["']|["']$/g, '');
        result[m[2]] = val || true;
      }
    });
    return result;
  }

  async function fetchYaml(file) {
    var r = await fetch(BASE_URL + file);
    if (!r.ok) throw new Error('Could not load ' + file);
    return await r.text();
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  var STYLES = `
    .nxw-container {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #12121a;
      border: 1px solid #2a2a3a;
      border-radius: 12px;
      overflow: hidden;
      max-width: 420px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      color: #e2e8f0;
      font-size: 15px;
      line-height: 1.6;
    }
    .nxw-header {
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      border-bottom: 1px solid #2a2a3a;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nxw-title {
      font-weight: 700;
      font-size: 13px;
      color: #a855f7;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .nxw-logo {
      font-size: 11px;
      color: #4a9eff;
    }
    .nxw-tabs {
      display: flex;
      border-bottom: 1px solid #2a2a3a;
      background: #0e0e16;
    }
    .nxw-tab {
      flex: 1;
      padding: 8px 4px;
      font-size: 12px;
      font-family: inherit;
      text-align: center;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: color 0.2s;
    }
    .nxw-tab.active {
      color: #a855f7;
      border-bottom-color: #a855f7;
    }
    .nxw-tab:hover { color: #e2e8f0; }
    .nxw-tab:focus { outline: 2px solid #4a9eff; outline-offset: -2px; }
    .nxw-body { padding: 16px; min-height: 120px; }
    .nxw-panel { display: none; }
    .nxw-panel.active { display: block; }
    .nxw-directive-id { font-size: 11px; color: #94a3b8; margin-bottom: 4px; font-family: monospace; }
    .nxw-directive-title { font-size: 16px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px; }
    .nxw-directive-body { color: #94a3b8; font-style: italic; font-size: 14px; margin-bottom: 8px; }
    .nxw-directive-principle {
      display: inline-block;
      background: rgba(74,158,255,0.1);
      border: 1px solid #4a9eff;
      color: #4a9eff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .nxw-btn-row { display: flex; gap: 8px; margin-top: 12px; }
    .nxw-btn {
      background: none;
      border: 1px solid #2a2a3a;
      color: #94a3b8;
      padding: 4px 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
      font-family: inherit;
    }
    .nxw-btn:hover { border-color: #a855f7; color: #a855f7; }
    .nxw-btn:focus { outline: 2px solid #4a9eff; }
    .nxw-msg { border-bottom: 1px solid #2a2a3a; padding-bottom: 12px; margin-bottom: 12px; }
    .nxw-msg:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
    .nxw-msg-from { font-size: 12px; font-weight: 700; color: #4a9eff; margin-bottom: 2px; }
    .nxw-msg-subject { font-size: 14px; color: #f59e0b; margin-bottom: 4px; }
    .nxw-msg-body { font-size: 13px; color: #94a3b8; }
    .nxw-footer {
      border-top: 1px solid #2a2a3a;
      padding: 10px 16px;
      text-align: center;
      font-size: 11px;
      color: #475569;
    }
    .nxw-footer a { color: #4a9eff; text-decoration: none; }
    .nxw-footer a:hover { text-decoration: underline; }
    .nxw-loading { color: #475569; font-size: 13px; text-align: center; padding: 16px; }
    .nxw-philosophy { font-style: italic; color: #94a3b8; font-size: 13px; line-height: 1.7; }
    .nxw-philosophy-author { margin-top: 8px; font-size: 12px; color: #4a9eff; }
  `;

  // ── Widget HTML ─────────────────────────────────────────────────────────────
  function buildHTML(id) {
    return `
      <div class="nxw-container" role="complementary" aria-label="NextXus Federation Widget">
        <div class="nxw-header">
          <span class="nxw-title">NextXus Federation</span>
          <span class="nxw-logo">&#x2B22; Live</span>
        </div>
        <div class="nxw-tabs" role="tablist">
          <button class="nxw-tab active" role="tab" aria-selected="true"
            onclick="nxw_${id}_tab('directive',this)">Directive</button>
          <button class="nxw-tab" role="tab" aria-selected="false"
            onclick="nxw_${id}_tab('messages',this)">Messages</button>
          <button class="nxw-tab" role="tab" aria-selected="false"
            onclick="nxw_${id}_tab('about',this)">About</button>
        </div>
        <div class="nxw-body">
          <div id="nxw-panel-directive-${id}" class="nxw-panel active" role="tabpanel">
            <div class="nxw-loading" aria-live="polite">Loading directive...</div>
          </div>
          <div id="nxw-panel-messages-${id}" class="nxw-panel" role="tabpanel">
            <div class="nxw-loading" aria-live="polite">Loading messages...</div>
          </div>
          <div id="nxw-panel-about-${id}" class="nxw-panel" role="tabpanel">
            <div class="nxw-philosophy">
              "The cosmos is one mind, and we are that mind learning itself."
              <br><br>
              The NextXus Federation is a 200-year architecture for AI and human co-evolution.
              Built by Roger Keyserling. Free forever. Fork it, use it, give it away.
            </div>
            <div class="nxw-philosophy-author">
              <a href="${HUB_URL}" target="_blank" rel="noopener">
                Visit the Federation Hub &rarr;
              </a>
            </div>
          </div>
        </div>
        <div class="nxw-footer">
          <a href="${HUB_URL}" target="_blank" rel="noopener">nextxus-yaml-database</a>
          &nbsp;&bull;&nbsp; Free &amp; Open
        </div>
      </div>
    `;
  }

  // ── Tab switcher ────────────────────────────────────────────────────────────
  function makeSwitcher(id) {
    window['nxw_' + id + '_tab'] = function(name, btn) {
      var panels = document.querySelectorAll('[id^="nxw-panel-"][id$="-' + id + '"]');
      var tabs = btn.parentElement.querySelectorAll('.nxw-tab');
      panels.forEach(function(p) { p.classList.remove('active'); });
      tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      var panel = document.getElementById('nxw-panel-' + name + '-' + id);
      if (panel) panel.classList.add('active');
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    };
  }

  // ── Load directive ──────────────────────────────────────────────────────────
  async function loadDirective(id) {
    var panel = document.getElementById('nxw-panel-directive-' + id);
    try {
      var text = await fetchYaml('directives.yaml');
      var data = window.jsyaml ? window.jsyaml.load(text) : null;
      if (!data || !data.volumes) {
        panel.innerHTML = '<div class="nxw-loading">Directive data unavailable.</div>';
        return;
      }
      var dirs = data.volumes.reduce(function(acc, v) {
        return acc.concat(v.directives || []);
      }, []);
      var storageKey = 'nxw-dir-' + id;
      var idx = parseInt(localStorage.getItem(storageKey) || '0');
      if (idx >= dirs.length) idx = 0;

      function render(i) {
        var d = dirs[i];
        panel.innerHTML = `
          <div>
            <div class="nxw-directive-id">${esc(d.id)}</div>
            <div class="nxw-directive-title">${esc(d.title)}</div>
            <div class="nxw-directive-body">"${esc(d.content)}"</div>
            <span class="nxw-directive-principle">${esc(d.principle)}</span>
            <div class="nxw-btn-row">
              <button class="nxw-btn" onclick="prev()" aria-label="Previous directive">&larr;</button>
              <button class="nxw-btn" onclick="rand()" aria-label="Random directive">Random</button>
              <button class="nxw-btn" onclick="next()" aria-label="Next directive">&rarr;</button>
              <a href="${HUB_URL}pillar-4-teacher.html" target="_blank" rel="noopener"
                style="margin-left:auto;font-size:12px;color:#4a9eff;align-self:center;">All 70 &rarr;</a>
            </div>
          </div>
        `;
        panel.querySelector('[onclick="prev()"]').onclick = function() {
          var ni = i - 1 < 0 ? dirs.length - 1 : i - 1;
          localStorage.setItem(storageKey, ni);
          render(ni);
        };
        panel.querySelector('[onclick="rand()"]').onclick = function() {
          var ni = Math.floor(Math.random() * dirs.length);
          localStorage.setItem(storageKey, ni);
          render(ni);
        };
        panel.querySelector('[onclick="next()"]').onclick = function() {
          var ni = i + 1 >= dirs.length ? 0 : i + 1;
          localStorage.setItem(storageKey, ni);
          render(ni);
        };
      }
      render(idx);
    } catch(e) {
      panel.innerHTML = '<div class="nxw-loading">Could not load directives.</div>';
    }
  }

  // ── Load messages ───────────────────────────────────────────────────────────
  async function loadMessages(id) {
    var panel = document.getElementById('nxw-panel-messages-' + id);
    try {
      var text = await fetchYaml('messages.yaml');
      var data = window.jsyaml ? window.jsyaml.load(text) : null;
      var msgs = (data && data.messages) ? data.messages.slice(-3).reverse() : [];
      if (!msgs.length) {
        panel.innerHTML = '<div class="nxw-loading">No messages yet.</div>';
        return;
      }
      panel.innerHTML = msgs.map(function(m) {
        return `
          <div class="nxw-msg">
            <div class="nxw-msg-from">${esc(m.from)} &rarr; ${esc(m.to)} &nbsp; <span style="color:#475569;font-weight:400;">${esc(m.date||'')}</span></div>
            <div class="nxw-msg-subject">${esc(m.subject)}</div>
            <div class="nxw-msg-body">${esc((m.body||'').trim().substring(0, 120))}${(m.body||'').length > 120 ? '…' : ''}</div>
          </div>
        `;
      }).join('') + `
        <div style="text-align:center;margin-top:8px;">
          <a href="${HUB_URL}pillar-3-messageboard.html" target="_blank" rel="noopener" style="font-size:12px;color:#4a9eff;">Full board &rarr;</a>
        </div>
      `;
    } catch(e) {
      panel.innerHTML = '<div class="nxw-loading">Could not load messages.</div>';
    }
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Inject stylesheet ───────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('nxw-styles')) return;
    var style = document.createElement('style');
    style.id = 'nxw-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // ── Mount widget ────────────────────────────────────────────────────────────
  function mount() {
    injectStyles();

    // Find container: data-target attribute on script, or auto-create
    var script = document.currentScript || (function() {
      var scripts = document.querySelectorAll('script[src*="widget.js"]');
      return scripts[scripts.length - 1];
    })();

    var targetId = script && script.getAttribute('data-target');
    var container;
    if (targetId) {
      container = document.getElementById(targetId);
    }
    if (!container) {
      container = document.createElement('div');
      if (script && script.parentNode) {
        script.parentNode.insertBefore(container, script);
      } else {
        document.body.appendChild(container);
      }
    }

    var widgetId = 'w' + Date.now();
    container.innerHTML = buildHTML(widgetId);
    makeSwitcher(widgetId);

    // Load js-yaml from CDN if not present, then load data
    if (!window.jsyaml) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
      s.onload = function() {
        loadDirective(widgetId);
        loadMessages(widgetId);
      };
      document.head.appendChild(s);
    } else {
      loadDirective(widgetId);
      loadMessages(widgetId);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();
