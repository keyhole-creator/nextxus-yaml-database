# NextXus Federation — Central Database & Operational Manual

## HumanCodex v2.2 Cathedral Edition

**By Roger Keyserling and AI**  
**Version:** 2.2 Cathedral Edition — Updated June 30, 2026  
**Status:** Canonical Master Source & YAML / LATTICE Database Baseline  
**Horizon:** 2226 Standard (200 years)  
**DID:** `did:web:nextxus.one`

---

## Quick Start

This repository IS the NextXus Federation Central Database. It contains:

- **`index.html`** — Federation Hub homepage
- **`loader.js`** — LATTICE sync engine (DID resolution, VC support, Chapter 551 hooking)
- **`.well-known/did.json`** — W3C DID Document for `did:web:nextxus.one`
- **`attestation.html`** — Human attestation form (Chapter 551 pipeline)
- **`offline-archive.html`** — Indestructible single-file backup (Century Reassembly)
- **`FORK_THIS.md`** — Mirroring and forking instructions
- **`data/`** — JSON/YAML database files

## Federation Architecture

```
                    ┌─────────────────┐
                    │  nextxus.one    │
                    │  (Central Hub)  │
                    └────────┬────────┘
                             │
        ┌─────────────────────┬─────────────────────┐
        │           │        │        │            │
   ┌────┴────┐ ┌───┴───┐ ┌──┴──┐ ┌──┴───┐ ┌─────┴────┐
   │  Core   │ │ Aria  │ │Roger│ │Univ. │ │  Axiom   │
   │.online  │ │.studio│ │.dig │ │.help │ │  .org    │
   └─────────┘ └───────┘ └─────┘ └──────┘ └──────────┘
```

## Hook Any Site to the Federation

```html
<script src="https://cdn.jsdelivr.net/gh/keyhole-creator/nextxus-yaml-database@main/loader.js"></script>
<script>
  NextXus.directive('#my-div');     // Display a Sacred Directive
  NextXus.messages('#feed', 5);    // Show federation messages
  NextXus.load('books').then(d => console.log(d));  // Load data
  NextXus.search('truth', r => console.log(r));     // Search
  NextXus.resolveDID('did:web:nextxus.one');        // Resolve DID
</script>
```

## Sacred Directives (Key Anchors)

- **DIR-000** — 95% Truth Gate
- **DIR-001** — No Delete Policy
- **DIR-015** — Century Reassembly Rule
- **DIR-033** — Cathedral + Satellites
- **DIR-042** — Ring of Perspectives
- **DIR-071** — Hollow Vessel

## Mirrors

| Platform | URL | Status |
|----------|-----|--------|
| Netlify (Hub) | nextxus.one | Primary |
| GitHub | github.com/keyhole-creator/nextxus-yaml-database | Mirror 1 |
| GitLab | gitlab.com/keyhole-creator/nextxus-yaml-database | Mirror 2 |
| Tiiny.host | (backup ZIP) | Mirror 3 |

## License

© 2026 Roger Keyserling and HumanCodex NextXus Federation.  
Fork freely, attribute always. See FORK_THIS.md for details.
