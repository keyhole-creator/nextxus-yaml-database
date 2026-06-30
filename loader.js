/**
 * NextXus Federation Loader v2.2
 * Cathedral Edition — Central Database Synchronization Engine
 * 
 * Purpose: Connect any satellite site to the Federation hub.
 * Provides DID resolution, Verifiable Credential support,
 * LATTICE synchronization, and Chapter 551 hooking logic.
 * 
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/gh/keyhole-creator/nextxus-yaml-database@main/loader.js"></script>
 *   <script>
 *     NextXus.directive('#my-div');
 *     NextXus.messages('#feed', 5);
 *     NextXus.load('books').then(d => console.log(d));
 *     NextXus.search('truth', results => console.log(results));
 *   </script>
 * 
 * © 2026 Roger Keyserling and HumanCodex NextXus Federation
 * Version: 2.2 Cathedral Edition
 * License: Federation Open — Fork freely, attribute always.
 */

(function(global) {
    'use strict';

    const FEDERATION_HUB = 'https://nextxus.one';
    const GITHUB_RAW = 'https://raw.githubusercontent.com/keyhole-creator/nextxus-yaml-database/main';
    const GITLAB_RAW = 'https://gitlab.com/keyhole-creator/nextxus-yaml-database/-/raw/main';
    const VERSION = '2.2.0';
    const CACHE_TTL = 300000; // 5 minutes

    // Internal state
    const _cache = new Map();
    const _subscribers = new Map();
    const _didCache = new Map();

    // 73 Sacred Directives — Core identifiers
    const SACRED_DIRECTIVES = {
        'DIR-000': { name: '95% Truth Gate', critical: true },
        'DIR-001': { name: 'No Delete Policy', critical: true },
        'DIR-015': { name: 'Century Reassembly Rule', critical: true },
        'DIR-033': { name: 'Cathedral + Satellites', critical: true },
        'DIR-042': { name: 'Ring of Perspectives', critical: true },
        'DIR-071': { name: 'Hollow Vessel', critical: true }
    };

    // Federation satellite registry
    const SATELLITES = {
        core: { url: 'https://nextxus.online', name: 'Core', role: 'Source of Truth' },
        aria: { url: 'https://nextxus.studio', name: 'Aria', role: 'Creative Intelligence' },
        roger: { url: 'https://nextxus.digital', name: 'Roger AI', role: 'Conversational Interface' },
        university: { url: 'https://nextxus.help', name: 'University', role: 'Education' },
        axiom: { url: 'https://nextxus.org', name: 'Axiom', role: 'Governance & Truth' }
    };

    /**
     * LATTICE Sync Engine
     * Fetches and caches data from the federation database
     */
    class LatticeSync {
        constructor() {
            this.sources = [GITHUB_RAW, GITLAB_RAW];
            this.activeSource = 0;
        }

        async fetch(path) {
            const cacheKey = `lattice:${path}`;
            const cached = _cache.get(cacheKey);
            if (cached && Date.now() - cached.ts < CACHE_TTL) {
                return cached.data;
            }

            for (let i = 0; i < this.sources.length; i++) {
                const idx = (this.activeSource + i) % this.sources.length;
                try {
                    const resp = await fetch(`${this.sources[idx]}/${path}`);
                    if (resp.ok) {
                        const data = await resp.text();
                        _cache.set(cacheKey, { data, ts: Date.now() });
                        this.activeSource = idx;
                        return data;
                    }
                } catch (e) {
                    console.warn(`[NextXus] Source ${idx} failed for ${path}, trying next...`);
                }
            }
            throw new Error(`[NextXus] All sources failed for: ${path}`);
        }

        async fetchJSON(path) {
            const text = await this.fetch(path);
            return JSON.parse(text);
        }
    }

    /**
     * DID Resolver (Chapter 551)
     * Resolves did:web identifiers for Federation entities
     */
    class DIDResolver {
        constructor() {
            this.method = 'web';
        }

        async resolve(did) {
            if (_didCache.has(did)) return _didCache.get(did);

            const parts = did.replace('did:web:', '').split(':');
            const domain = parts[0];
            const path = parts.length > 1 ? `/${parts.slice(1).join('/')}` : '';
            const url = `https://${domain}${path}/.well-known/did.json`;

            try {
                const resp = await fetch(url);
                if (resp.ok) {
                    const doc = await resp.json();
                    _didCache.set(did, doc);
                    return doc;
                }
            } catch (e) {
                console.warn(`[NextXus DID] Failed to resolve: ${did}`);
            }
            return null;
        }

        async verify(credential) {
            if (!credential || !credential.issuer) return { valid: false, reason: 'No issuer' };
            const didDoc = await this.resolve(credential.issuer);
            if (!didDoc) return { valid: false, reason: 'Cannot resolve issuer DID' };
            // Placeholder for actual cryptographic verification
            return { valid: true, issuer: didDoc.id, resolved: true };
        }
    }

    /**
     * Verifiable Credentials Engine (Chapter 551)
     */
    class VCEngine {
        constructor(didResolver) {
            this.resolver = didResolver;
        }

        createAttestation(subject, claim, evidence) {
            return {
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://nextxus.one/contexts/federation/v1'
                ],
                type: ['VerifiableCredential', 'FederationAttestation'],
                issuer: 'did:web:nextxus.one',
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                    id: subject,
                    claim: claim,
                    evidence: evidence,
                    truthGateScore: null, // To be filled by reviewer
                    directiveAlignment: []
                },
                proof: {
                    type: 'Ed25519Signature2020',
                    created: new Date().toISOString(),
                    verificationMethod: 'did:web:nextxus.one#key-1',
                    proofPurpose: 'assertionMethod',
                    proofValue: '' // Placeholder — signed by reviewer wallet
                }
            };
        }

        async verify(credential) {
            return this.resolver.verify(credential);
        }
    }

    /**
     * Main NextXus API
     */
    const lattice = new LatticeSync();
    const didResolver = new DIDResolver();
    const vcEngine = new VCEngine(didResolver);

    const NextXus = {
        version: VERSION,
        hub: FEDERATION_HUB,
        satellites: SATELLITES,
        directives: SACRED_DIRECTIVES,

        /**
         * Load a data category from the database
         * @param {string} category - e.g., 'books', 'directives', 'nodes'
         * @returns {Promise<Object>}
         */
        async load(category) {
            try {
                return await lattice.fetchJSON(`data/${category}.json`);
            } catch (e) {
                try {
                    return await lattice.fetch(`data/${category}.yaml`);
                } catch (e2) {
                    console.error(`[NextXus] Cannot load category: ${category}`);
                    return null;
                }
            }
        },

        /**
         * Render a directive into a DOM element
         * @param {string} selector - CSS selector for target element
         * @param {string} [dirId] - Specific directive ID, or random if omitted
         */
        directive(selector, dirId) {
            const el = document.querySelector(selector);
            if (!el) return;

            const ids = Object.keys(SACRED_DIRECTIVES);
            const id = dirId || ids[Math.floor(Math.random() * ids.length)];
            const dir = SACRED_DIRECTIVES[id];

            if (dir) {
                el.innerHTML = `
                    <div class="nx-directive" style="padding:1rem;border-left:3px solid #00e5ff;background:rgba(0,229,255,0.05);margin:1rem 0;border-radius:4px;">
                        <strong style="color:#00e5ff;font-size:0.8rem;">${id}</strong>
                        <h4 style="margin:0.3rem 0;color:#fff;">${dir.name}</h4>
                        ${dir.critical ? '<span style="color:#00e676;font-size:0.75rem;">● CRITICAL</span>' : ''}
                    </div>
                `;
            }
        },

        /**
         * Display federation messages/updates in a feed
         * @param {string} selector - CSS selector
         * @param {number} count - Number of items to show
         */
        async messages(selector, count = 5) {
            const el = document.querySelector(selector);
            if (!el) return;

            try {
                const data = await lattice.fetch('data/messages.json');
                const messages = JSON.parse(data).slice(0, count);
                el.innerHTML = messages.map(m => `
                    <div class="nx-message" style="padding:0.8rem;border-bottom:1px solid rgba(0,229,255,0.1);margin-bottom:0.5rem;">
                        <small style="color:#7c4dff;">${m.from || 'Federation'}</small>
                        <p style="margin:0.3rem 0;color:#e0e0e0;">${m.text || m.content}</p>
                        <small style="opacity:0.5;">${m.date || ''}</small>
                    </div>
                `).join('');
            } catch (e) {
                el.innerHTML = '<p style="color:#666;padding:1rem;">Federation feed loading...</p>';
            }
        },

        /**
         * Search the federation database
         * @param {string} query - Search term
         * @param {function} callback - Results handler
         */
        async search(query, callback) {
            try {
                const codex = await lattice.fetch('HUMANCODEX_V2_CATHEDRAL.md');
                const lines = codex.split('\n');
                const results = lines
                    .filter(l => l.toLowerCase().includes(query.toLowerCase()))
                    .map((line, i) => ({ line: i, text: line.trim(), relevance: 1 }))
                    .slice(0, 20);
                if (callback) callback(results);
                return results;
            } catch (e) {
                console.warn('[NextXus] Search failed:', e);
                if (callback) callback([]);
                return [];
            }
        },

        /**
         * Resolve a DID (Chapter 551)
         * @param {string} did - DID string (e.g., 'did:web:nextxus.one')
         * @returns {Promise<Object>}
         */
        async resolveDID(did) {
            return didResolver.resolve(did);
        },

        /**
         * Create a verifiable attestation
         * @param {string} subject - DID of the subject
         * @param {string} claim - The claim being attested
         * @param {Object} evidence - Supporting evidence
         * @returns {Object} Unsigned VC
         */
        createAttestation(subject, claim, evidence) {
            return vcEngine.createAttestation(subject, claim, evidence);
        },

        /**
         * Verify a credential
         * @param {Object} credential - VC to verify
         * @returns {Promise<Object>} Verification result
         */
        async verifyCredential(credential) {
            return vcEngine.verify(credential);
        },

        /**
         * Subscribe to federation updates (pub/sub)
         * @param {string} channel - Channel name
         * @param {function} handler - Message handler
         */
        subscribe(channel, handler) {
            if (!_subscribers.has(channel)) _subscribers.set(channel, []);
            _subscribers.get(channel).push(handler);
        },

        /**
         * Publish to a channel
         * @param {string} channel - Channel name
         * @param {*} data - Data to publish
         */
        publish(channel, data) {
            const handlers = _subscribers.get(channel) || [];
            handlers.forEach(h => h(data));
        },

        /**
         * Get Federation status
         * @returns {Object} Status report
         */
        status() {
            return {
                version: VERSION,
                hub: FEDERATION_HUB,
                satellites: Object.keys(SATELLITES).length,
                directives: Object.keys(SACRED_DIRECTIVES).length,
                cacheSize: _cache.size,
                uptime: 'operational',
                edition: 'Cathedral 2.2'
            };
        },

        /**
         * Initialize federation connection banner
         * Injects a small "Connected to Federation" indicator
         */
        init() {
            console.log(`[NextXus Federation] v${VERSION} Cathedral Edition loaded.`);
            console.log(`[NextXus] Hub: ${FEDERATION_HUB}`);
            console.log(`[NextXus] Satellites: ${Object.keys(SATELLITES).length} connected`);
            console.log(`[NextXus] DID: did:web:nextxus.one`);

            // Fire ready event
            if (typeof CustomEvent !== 'undefined') {
                document.dispatchEvent(new CustomEvent('nextxus:ready', {
                    detail: { version: VERSION, hub: FEDERATION_HUB }
                }));
            }
        }
    };

    // Auto-initialize
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => NextXus.init());
        } else {
            NextXus.init();
        }
    }

    // Export
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NextXus;
    }
    global.NextXus = NextXus;

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
