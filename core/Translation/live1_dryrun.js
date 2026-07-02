#!/usr/bin/env node
/**
 * LIVE-1 DRY RUN — Pipeline-Health + DB-Check, KEINE API-Calls
 * Führt PREFLIGHT-Analyse aus, prüft DB-Health, validiert Output-Pfade.
 * Exit 0 = alles OK, Exit 1 = Probleme gefunden.
 */

const path = require('path');
const fs = require('fs');
const { createPreflight } = require('../DB/preflight');
const dbManager = require('../DB/db');
// DB-Persistenz-Verteilung (v0.24): Domain-DAOs statt direktem db.js-Import
const { createRunMetricsDb } = require('../DB/run-metrics-db');
const { createAdminDb } = require('../DB/admin-db');
const { createPlugin, DEFAULT_GAME } = require('./plugin-registry');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { console.log(`  ✅ ${name}`); pass++; }
  else { console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`); fail++; }
}

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  LIVE-1 DRY RUN — Pipeline Health Check');
  console.log('═══════════════════════════════════════════\n');

  // ── 1. DB-Init & Basic Health ────────────────────────
  console.log('🔬 DB Initialization\n');
  try {
    await dbManager.init();
    check('dbManager.init() OK', true);
  } catch (e) {
    check('dbManager.init() OK', false, e.message);
    process.exit(1);
  }

  // ── 2. DB Schema ─────────────────────────────────────
  console.log('\n📊 DB Schema & State\n');
  try {
    const runMetricsDb = createRunMetricsDb(dbManager);
    const adminDb = createAdminDb(dbManager);
    const cols = await runMetricsDb.getTableColumns('translations');
    const colNames = cols.map(c => c.name);
    check('translations table exists', cols.length > 0, `${cols.length} columns`);
    check('Has source_text', colNames.includes('source_text'));
    check('Has translation', colNames.includes('translation'));
    check('Has flag_reason', colNames.includes('flag_reason'));
    check('Has polish_status', colNames.includes('polish_status'));
    check('Has quality_score', colNames.includes('quality_score'));
    check('Has audit_stage', colNames.includes('audit_stage'));

    const total = await adminDb.getTranslationCount();
    const flagged = await adminDb.getFlaggedCount();
    const stale = await adminDb.getStaleCount();
    const pendingP = await adminDb.getPendingPolishCount();
    const failedP = await adminDb.getFailedPolishCount();
    const avgQ = await adminDb.getAverageQualityScore();
    const shieldL = await adminDb.getShieldLeakCount();
    const critR = await adminDb.getCriticalRejectCount();

    console.log('\n  📈 DB Metrics:');
    console.log(`    Total entries:     ${total}`);
    console.log(`    Flagged:           ${flagged} (${(flagged/total*100).toFixed(1)}%)`);
    console.log(`    Stale (src=tgt):   ${stale}`);
    console.log(`    Pending Polish:    ${pendingP}`);
    console.log(`    Failed Polish:     ${failedP}`);
    console.log(`    Avg Quality Score: ${avgQ}`);
    console.log(`    Shield Leaks:      ${shieldL}`);
    console.log(`    Critical Rejects:  ${critR}`);

    // Quality checks
    check('DB has entries', total > 0, `${total} total`);
    check('Pending Polish < 50%', pendingP < total * 0.5, `${pendingP}/${total}`);
    check('No shield_leaks in DB', shieldL === 0, `${shieldL} found`);
    check('No critical_rejects', critR === 0, `${critR} found`);
  } catch (e) {
    check('DB Schema check', false, e.message);
  }

  // ── 3. Provider Config ────────────────────────────────
  console.log('\n🔑 Provider Configuration\n');
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const keyVars = envContent.split('\n').filter(l => l.includes('_KEY=') || l.includes('PRIMARY_PROVIDER') || l.includes('TARGET_LANG'));
    keyVars.forEach(v => console.log(`  ${v.trim()}`));
    check('.env exists', true);
  } else {
    check('.env exists', false, 'No .env file found');
  }

  // Check process.env for keys
  const providersWithKeys = ['GEMINI', 'GROQ', 'OPENROUTER', 'NVIDIA', 'OLLAMA']
    .filter(p => process.env[`${p}_KEY`] || process.env[`${p}_KEYS`]);
  check('API keys configured', providersWithKeys.length > 0, `${providersWithKeys.join(', ') || 'none'}`);

  const primaryProvider = process.env.PRIMARY_PROVIDER || 'openrouter';
  const targetLang = process.env.TARGET_LANG || 'German';
  console.log(`\n  Primary Provider: ${primaryProvider}`);
  console.log(`  Target Language:  ${targetLang}`);

  // ── 4. PREFLIGHT ──────────────────────────────────────
  console.log('\n🛫 PREFLIGHT Analysis\n');
  try {
    const preflight = createPreflight(dbManager);
    const result = await preflight.runPreflight({ gui: false });

    if (result && result.report) {
      const r = result.report;
      console.log(`  Preflight OK: ${result.ok}`);
      console.log(`  Mode: ${r.mode}`);
      console.log(`  Duration: ${r.duration}`);
      console.log(`  DB Size: ${r.dbSize || 'N/A'}`);
      console.log(`  Issues total: ${r.issues ? Object.values(r.issues).reduce((a,b) => a+b, 0) : 0}`);

      if (r.issues) {
        for (const [key, count] of Object.entries(r.issues)) {
          if (count > 0) console.log(`    ${key}: ${count}`);
        }
      }
      check('PREFLIGHT passed', result.ok === true, result.ok ? '' : 'preflight returned non-ok');
    } else {
      check('PREFLIGHT passed', false, 'no result/report');
    }
  } catch (e) {
    check('PREFLIGHT passed', false, e.message);
  }

  // ── 5. Output Path Check ──────────────────────────────
  console.log('\n📁 Output Paths\n');
  const plugin = createPlugin(process.env.GAME || DEFAULT_GAME);
  const paths = {
    MOD_ROOT: process.env.MOD_PATH || process.env.MOD_ROOT || 'C:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\1162750',
    GAME_MOD_ROOT: process.env.OUTPUT_PATH || process.env.GAME_MOD_ROOT || plugin.getDefaultModRoot(),
    PATCH_ROOT: path.join(__dirname, '..', 'patches'),
    BACKUP_ROOT: path.join(__dirname, '..', 'backups'),
  };

  for (const [label, p] of Object.entries(paths)) {
    const exists = fs.existsSync(p);
    check(`${label}: ${path.basename(p)}`, exists, exists ? p : `NOT FOUND: ${p}`);
  }

  // Check if Workshop mods exist
  const wsPath = paths.MOD_ROOT;
  if (fs.existsSync(wsPath)) {
    const mods = fs.readdirSync(wsPath).filter(e => fs.statSync(path.join(wsPath, e)).isDirectory());
    check('Workshop mods available', mods.length > 0, `${mods.length} mods`);
    console.log(`  Total mods in Workshop: ${mods.length}`);
  }

  // Check if AppData mods exist
  const adPath = paths.GAME_MOD_ROOT;
  if (fs.existsSync(adPath)) {
    const localMods = fs.readdirSync(adPath).filter(e => fs.statSync(path.join(adPath, e)).isDirectory());
    check('AppData mods available', localMods.length > 0, `${localMods.length} mods`);
    console.log(`  Total mods in AppData: ${localMods.length}`);
  }

  // ── Summary ───────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log(`  DRY RUN RESULT: ${pass} PASS / ${fail} FAIL`);
  console.log('═══════════════════════════════════════════\n');

  if (fail > 0) {
    console.log(`⚠️  ${fail} checks failed — review issues above.`);
    process.exit(1);
  } else {
    console.log('✅ System is healthy — ready for full run.');
    process.exit(0);
  }
}

run().catch(e => {
  console.error(`\n❌ Fatal: ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
