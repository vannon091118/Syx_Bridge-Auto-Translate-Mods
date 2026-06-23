/**
 * vendor-utils.js — Shared Vendor/Release Utilities
 *
 * Extrahiert aus vendor-sync.js + check_vendor_drift.js (S-002).
 * Keine Duplikate mehr: findLatestRelease, walkRelease, releaseToSource leben hier.
 *
 * CHANGELOG-Ref: [CL:VENDOR-UTILS]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const CORE = path.join(__dirname, '..');
const RELEASE_ROOT = path.join(CORE, 'release');

// ── Config (Single Source of Truth) ──────────────────────────────────
const ROOT_SOURCE_FILES = ['start.bat', 'README.md', '_Info.txt', 'TUTORIAL.txt'];
const MOD_ASSET_DIRS = ['V70', 'V71'];
const CORE_RUNTIME_FILES = ['index.js', 'package.json', 'LICENSE'];

// ── Helpers ──────────────────────────────────────────────────────────

function computeSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

/**
 * Findet das neueste Release-Bundle in core/release/ nach mtime.
 * @returns {{ name: string, path: string, mtime: number } | null}
 */
function findLatestRelease() {
  if (!fs.existsSync(RELEASE_ROOT)) return null;

  const entries = fs.readdirSync(RELEASE_ROOT, { withFileTypes: true });
  const releases = entries
    .filter(e => e.isDirectory() && e.name.startsWith('SyxBridge_v'))
    .map(e => ({
      name: e.name,
      path: path.join(RELEASE_ROOT, e.name),
      mtime: fs.statSync(path.join(RELEASE_ROOT, e.name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return releases.length > 0 ? releases[0] : null;
}

/**
 * Rekursives Walken eines Release-Verzeichnisses.
 * @returns {{ relPath: string, absPath: string }[]}
 */
function walkRelease(dir, baseDir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkRelease(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      result.push({ relPath, absPath: fullPath });
    }
  }
  return result;
}

/**
 * Maps a release file path back to its Live-Core source path.
 * @returns {{ sourcePath: string, runtimeOnly: boolean } | null}
 */
function releaseToSource(releaseRelPath) {
  // Root-level files
  if (ROOT_SOURCE_FILES.includes(releaseRelPath)) {
    return { sourcePath: path.join(ROOT, releaseRelPath), runtimeOnly: true };
  }

  // Mod asset dirs
  for (const dir of MOD_ASSET_DIRS) {
    if (releaseRelPath.startsWith(dir + '/') || releaseRelPath === dir) {
      return { sourcePath: path.join(ROOT, releaseRelPath), runtimeOnly: true };
    }
  }

  // core/ runtime files
  for (const f of CORE_RUNTIME_FILES) {
    const releasePath = 'core/' + f;
    if (releaseRelPath === releasePath) {
      return { sourcePath: path.join(CORE, f), runtimeOnly: true };
    }
  }

  // core/src/ → core/src/
  if (releaseRelPath.startsWith('core/src/')) {
    const subPath = releaseRelPath.slice('core/src/'.length);
    return { sourcePath: path.join(CORE, 'src', subPath), runtimeOnly: true };
  }

  // core/scripts/ → core/scripts/
  if (releaseRelPath.startsWith('core/scripts/')) {
    const subPath = releaseRelPath.slice('core/scripts/'.length);
    return { sourcePath: path.join(CORE, 'scripts', subPath), runtimeOnly: true };
  }

  // core/archive/docs/ (review-base only)
  if (releaseRelPath.startsWith('core/archive/docs/')) {
    const subPath = releaseRelPath.slice('core/archive/docs/'.length);
    return { sourcePath: path.join(CORE, 'archive', 'docs', subPath), runtimeOnly: false };
  }

  // core/archive/dbold/ (review-base only — .md)
  if (releaseRelPath.startsWith('core/archive/dbold/')) {
    const subPath = releaseRelPath.slice('core/archive/dbold/'.length);
    return { sourcePath: path.join(CORE, 'archive', 'dbold', subPath), runtimeOnly: false };
  }

  // core/tests/ (review-base only)
  if (releaseRelPath.startsWith('core/tests/')) {
    const subPath = releaseRelPath.slice('core/tests/'.length);
    return { sourcePath: path.join(CORE, 'tests', subPath), runtimeOnly: false };
  }

  // Build artifact files
  if (releaseRelPath === '.build-manifest.json') return null;
  if (releaseRelPath === 'AGENTS.md') {
    return { sourcePath: path.join(ROOT, 'AGENTS.md'), runtimeOnly: false };
  }

  return null;
}

module.exports = {
  ROOT,
  CORE,
  RELEASE_ROOT,
  ROOT_SOURCE_FILES,
  MOD_ASSET_DIRS,
  CORE_RUNTIME_FILES,
  computeSha256,
  readFileSafe,
  findLatestRelease,
  walkRelease,
  releaseToSource,
};
