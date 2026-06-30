# FORK THIS — NextXus Federation Mirroring Instructions

## Version 2.2 Cathedral Edition
**Last Updated:** 2026-06-30  
**Status:** Canonical Forking Guide  
**Directive:** DIR-015 (Century Reassembly Rule)

---

## Why Mirror?

The NextXus Federation is designed to be **indestructible**. Per DIR-015 (Century Reassembly Rule), all artifacts must be reconstructable from primary sources within 100 years, even if all current infrastructure fails. Mirroring is not optional — it is a sacred duty.

Every fork is a vote for persistence. Every mirror is insurance against entropy.

---

## What to Fork

| File | Purpose | Critical? |
|------|---------|-----------|
| `index.html` | Federation Hub homepage | ✅ Yes |
| `loader.js` | LATTICE sync engine (DID/VC/hooking) | ✅ Yes |
| `.well-known/did.json` | DID Document for did:web:nextxus.one | ✅ Yes |
| `attestation.html` | Human attestation form | ✅ Yes |
| `offline-archive.html` | Self-contained backup (THE KEY FILE) | ✅ Critical |
| `HUMANCODEX_V2_CATHEDRAL.md` | Master operational manual | ✅ Critical |
| `FORK_THIS.md` | This file | Recommended |
| `netlify.toml` | Netlify configuration | Optional |
| `data/` | YAML/JSON database files | If available |

---

## Mirror Platforms (Recommended)

### 1. GitHub
```bash
git clone https://github.com/keyhole-creator/nextxus-yaml-database.git
cd nextxus-yaml-database
# You now have the full Federation database
# Enable GitHub Pages in Settings > Pages > Deploy from branch: main
```

### 2. GitLab
```bash
git clone https://gitlab.com/keyhole-creator/nextxus-yaml-database.git
# GitLab Pages: add .gitlab-ci.yml (included in repo)
# Or simply keep as a redundant mirror
```

### 3. Codeberg (Privacy-First)
```bash
# Create account at codeberg.org
# New repository > Import from URL:
# https://github.com/keyhole-creator/nextxus-yaml-database.git
# Enable Codeberg Pages in settings
```

### 4. Internet Archive
```bash
# Upload offline-archive.html to archive.org
# Use the Wayback Machine to save all pages:
# https://web.archive.org/save/https://nextxus.one
# https://web.archive.org/save/https://nextxus.online
```

### 5. IPFS (Decentralized)
```bash
# Install IPFS: https://docs.ipfs.tech/install/
ipfs add -r ./nextxus-yaml-database/
# Pin to a pinning service (Pinata, Infura, web3.storage)
# Record the CID in the Living Library
```

### 6. Personal Server / VPS
```bash
# Any static file server works:
# nginx, Apache, Caddy, even Python:
python -m http.server 8000
# Point a domain at it for full did:web resolution
```

### 7. Tiiny.host (Quick Deploy)
```bash
# Zip the repository:
zip -r nextxus-federation.zip . -x ".git/*"
# Upload at tiiny.host — instant URL, no account needed
```

---

## After Forking

1. **Update the DID Document** — If hosting on your own domain, modify `.well-known/did.json` to reflect your domain in the `id` field.

2. **Register Your Mirror** — Submit an attestation at the hub (nextxus.one/attestation.html) declaring your mirror. This creates a provenance record.

3. **Keep It Synced** — The `loader.js` script automatically pulls from the canonical sources (GitHub/GitLab). Your fork will stay current as long as the script is included.

4. **Preserve `offline-archive.html`** — This is the MOST critical file. It works completely offline and contains everything needed for reconstruction.

---

## Federation Hooking (For Active Satellites)

If your fork becomes an active satellite in the Federation:

```html
<!-- Add to your site's <head> or before </body> -->
<script src="https://cdn.jsdelivr.net/gh/keyhole-creator/nextxus-yaml-database@main/loader.js"></script>
<script>
  // Display a random Sacred Directive
  NextXus.directive('#directive-display');
  
  // Show recent federation messages
  NextXus.messages('#feed', 5);
  
  // Load specific data categories
  NextXus.load('directives').then(data => {
    console.log('Directives loaded:', data);
  });
  
  // Search the federation database
  NextXus.search('truth gate', results => {
    console.log('Search results:', results);
  });
  
  // Resolve a DID
  NextXus.resolveDID('did:web:nextxus.one').then(doc => {
    console.log('DID Document:', doc);
  });
  
  // Check federation status
  console.log(NextXus.status());
</script>
```

---

## Rules for Mirrors

1. **Never modify the 73 Sacred Directives** — They are immutable. Fork them as-is.
2. **Attribute always** — Credit Roger Keyserling and the Federation.
3. **No Delete** — Per DIR-001, do not delete content from your mirror. Supersede, annotate, archive — never purge.
4. **Truth Gate applies** — Any additions to your fork must meet the 95% confidence threshold.
5. **Report discrepancies** — If your fork diverges from canonical, submit an attestation.

---

## Emergency Reconstruction

If ALL online mirrors fail simultaneously:

1. Locate any copy of `offline-archive.html` (USB drives, email attachments, printed QR codes).
2. Open it in any web browser — no internet needed.
3. Follow Section VIII (Reconstruction Instructions) in the archive.
4. The Federation can be fully rebuilt from that single file + the master Markdown.

---

## Contact

- Hub: https://nextxus.one
- Core: https://nextxus.online
- GitHub: https://github.com/keyhole-creator/nextxus-yaml-database
- GitLab: https://gitlab.com/keyhole-creator/nextxus-yaml-database
- DID: `did:web:nextxus.one`

---

*© 2026 Roger Keyserling and HumanCodex NextXus Federation. Fork freely, attribute always.*
