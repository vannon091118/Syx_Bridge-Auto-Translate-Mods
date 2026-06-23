/**
 * rng.js — Deterministischer PRNG für den Commit-Layer
 * 
 * Kein Math.random(), kein crypto — rein deterministisch, reproduzierbar.
 * XorShift-Variante (32-bit) — für Index-Selektion aus kleinen Pools optimiert.
 * djb2 Hash für String → 32-bit Seed.
 * derive() leitet nächsten Composite-Hash aus vorherigem + Commit-Hash ab.
 * decodeJ() dekodiert j-Werte in narrative Anweisungen (gespiegelt aus narrative_params.json).
 * 
 * Standalone: Keine Abhängigkeiten außer Node.js.
 * Verwendet von: derive_composite.js, verify_commit_msg.js
 */

// ─── djb2 Hash ───────────────────────────────────────────────────────
// Deterministischer String → 32-bit unsigned Integer.
// Gleicher Input → gleicher Output. Immer.

function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ─── XorShift128+ ────────────────────────────────────────────────────
// 128-bit State, 32-bit kompatibel.
// Periode: 2^128 − 1. Verteilung: gleichmäßig.

class XorShift128 {
  constructor(seed) {
    // seed ist ein 32-bit unsigned Integer
    this.s0 = seed >>> 0;
    // s1 aus Seed ableiten (SplitMix-Schritt) — kein hartcodiertes s1=1 mehr
    this.s1 = ((seed * 1812433253 + 1) >>> 0);

    // Aufwärmphase: 10 Iterationen für bessere Verteilung
    for (let i = 0; i < 10; i++) {
      this._step();
    }
  }

  _step() {
    let s1 = this.s0;
    const s0 = this.s1;
    this.s0 = s0;
    s1 ^= s1 << 23;
    s1 ^= s1 >>> 17;
    s1 ^= s0;
    s1 ^= s0 >>> 26;
    this.s1 = s1;
    return ((s0 + this.s1) >>> 0) / 4294967296;
  }

  /** Gibt Float in [0, 1) zurück */
  next() {
    return this._step();
  }

  /** Gibt Integer in [min, max) zurück (min inklusiv, max exklusiv) */
  nextInt(min, max) {
    return min + Math.floor(this.next() * (max - min));
  }
}

// ─── Composite Derivation ────────────────────────────────────────────
// Leitet den nächsten Composite-Hash aus dem vorherigen Composite +
// dem aktuellen Commit-Hash ab.

/**
 * @param {string} prevComposite - Vorheriger Composite, z.B. "c4j12a3p7" oder Genesis "c0j0a0p0"
 * @param {string} commitHash    - Aktueller Git-Commit-Hash (kurz), z.B. "a6af87a"
 * @param {number} arcCount      - Anzahl der Arcs in lore_arcs.json
 * @param {number} plotCount     - Anzahl der Plot-Nodes in plotchain.json
 * @returns {{ composite: string, c: number, j: number, a: number, p: number, seed: number }}
 */
function derive(prevComposite, commitHash, arcCount, plotCount) {
  if (!commitHash) {
    throw new Error('derive: commitHash ist Pflichtfeld. Kann nicht undefined oder leer sein.');
  }
  const seed = djb2(prevComposite + commitHash);
  const rng = new XorShift128(seed);

  // C: Sequenznummer aus vorherigem Composite parsen
  const cMatch = prevComposite.match(/c(\d+)/);
  const prevC = cMatch ? parseInt(cMatch[1]) : 0;
  const nextC = prevC + 1;

  // J: 1..99 (narrative Anweisung)
  const nextJ = rng.nextInt(1, 100);

  // A: 1..arcCount
  const nextA = arcCount > 0 ? rng.nextInt(1, arcCount + 1) : 1;

  // P: 1..plotCount
  const nextP = plotCount > 0 ? rng.nextInt(1, plotCount + 1) : 1;

  return {
    composite: `c${nextC}j${nextJ}a${nextA}p${nextP}`,
    c: nextC,
    j: nextJ,
    a: nextA,
    p: nextP,
    seed
  };
}

// ─── Narrative Dekodierung ───────────────────────────────────────────

/**
 * Dekodiert j-Wert in narrative Anweisung.
 * Arrays gespiegelt aus narrative_params.json (kanonische Referenz).
 * @param {number} j - j-Wert (0 für Genesis, 1-99 für Commits)
 * @returns {{ tone: string, structure: string, callback: boolean }}
 */
function decodeJ(j) {
  // j=0 ist Genesis-Composite — kein narrativer Commit
  if (j === 0) {
    return { tone: 'genesis', structure: 'genesis', callback: false };
  }

  // Kanonische Arrays — gespiegelt aus narrative_params.json
  const TONES = ['sachlich', 'sarkastisch', 'erschöpft', 'triumphierend',
    'selbstironisch', 'neugierig', 'müde-zufrieden', 'alarmiert', 'trocken', 'warm'];
  const STRUCTURES = ['chronologisch', 'problem_lösung', 'flashback',
    'dialog', 'faktenliste'];

  return {
    tone: TONES[j % 10],
    structure: STRUCTURES[j % 5],
    callback: j > 50
  };
}

module.exports = { djb2, XorShift128, derive, decodeJ };
