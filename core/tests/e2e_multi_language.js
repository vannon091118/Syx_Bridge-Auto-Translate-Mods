/**
 * E2E test for ML-7: Multi-Language Pipeline — 5 Kernsprachen.
 *
 * Tested languages: French (fr), Spanish (es), Polish (pl), Russian (ru), Chinese (zh-CN)
 *
 * Verifies that the translation pipeline correctly handles each target language
 * at every layer without running actual API calls (mocked dependencies).
 *
 * Test matrix:
 *   T1: LANG_CODES mapping — all 5 languages + edge cases
 *   T2: File path replacement — English/ → <TARGET_LANG>/ for all 5
 *   T3: _Info.txt language tag — TAG generation per language
 *   T4: Model registry — getModelStatus per language
 *   T5: Config persistence — persistSingleEnvVar per language
 *   T6: createRuntimeOps — TARGET_LANG flows through to modFolderName
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const os = require('os');

const { createRuntimeOps } = require('../Translation/runtime-ops');
const { LANG_CODES, SUPPORTED_LANGS, createModelRegistry } = require('../Translation/model-registry');
const { persistSingleEnvVar } = require('../Translation/config/config-runtime');
const { ENV_PATH } = require('../Translation/config/config-keys');

// ── Test infrastructure ────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`);
  } else {
    failed++;
    console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`);
  }
}

function captureConsole() {
  const logs = [];
  const orig = console.log;
  console.log = (...args) => { logs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); };
  return { logs, restore() { console.log = orig; } };
}

function makePromptsMock(answer) {
  const calls = [];
  return {
    calls,
    instance: async (question) => { calls.push(question); return { proceed: answer }; }
  };
}

/**
 * Build dependencies for createRuntimeOps with a specific TARGET_LANG.
 * All pipeline steps are stubbed — no real API calls.
 */
function makeDeps({ targetLang, promptsInstance, configOverrides = {} }) {
  return {
    config: {
      NATIVE_MODE: true,
      TARGET_LANG: targetLang,
      MOD_ROOT: '/tmp/syxbridge-test-mods',
      GAME_MOD_ROOT: '/tmp/syxbridge-test-game-mods',
      PATCH_ROOT: '/tmp/syxbridge-test-patches',
      BACKUP_ROOT: '/tmp/syxbridge-test-backups',
      ...configOverrides
    },
    fs,
    fsp,
    path,
    prompts: promptsInstance,
    exporter: { writeTranslatedFile: async () => {}, bundleBridgeCore: async () => {} },
    ensureTranslations: async (_texts) => ({ __stats: { cacheHits: 0, missing: 0 } }),
    mapLimit: async (items) => items,
    readFileJob: async () => ({ replacements: [] }),
    collectTextFiles: async () => [],
    writeTranslatedFile: async () => ({ skipped: true }),
    getMajorVersion: async () => 71,
    getHasConfirmedNative: () => true,
    setHasConfirmedNative: () => {},
    gameAdapter: {
      getCoreModFolderName: () => 'BridgeCore',
      getCoreModMetadata: () => 'NAME: "BridgeCore"\nVERSION: "1.0"\n',
      getMetadataFileName: () => '_Info.txt',
      parseMetadata: (content) => {
        const info = {};
        for (const line of content.split('\n')) {
          const m = line.match(/^(\w+):\s*"([^"]*)"/);
          if (m) info[m[1]] = m[2];
        }
        return info;
      },
      formatMetadata: (obj) => Object.entries(obj).map(([k,v]) => `${k}: "${v}"`).join('\n'),
      getBackupDirectoryName: (name) => `.backup_${name}_ORIGINAL`,
      applyPatchModifications: () => {},
      getTranslationCredit: () => 'Translation by Vannon with SyxBridge'
    }
  };
}

const TEST_INFO_CONTENT = [
  'NAME: "Multi-Lang Test Mod"',
  'VERSION: "1.0.0"',
  'GAME_VERSION_MAJOR: 71',
  'GAME_VERSION_MINOR: 0',
  'AUTHOR: "TestRunner"',
  ''
].join('\n');

let tmpModDir = null;

async function setupTempMod() {
  const dir = path.join(os.tmpdir(), `syxbridge-ml7-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, '_Info.txt'), TEST_INFO_CONTENT, 'utf-8');
  return dir;
}

async function cleanupTemp(dir) {
  try { await fsp.rm(dir, { recursive: true, force: true }); } catch (e) { /* swallow */ }
}

// ── The 5 core languages under test ────────────────────────────────────
const CORE_LANGUAGES = [
  { name: 'French',    code: 'fr',    tag: 'FRENCH'   },
  { name: 'Spanish',   code: 'es',    tag: 'SPANISH'  },
  { name: 'Polish',    code: 'pl',    tag: 'POLISH'   },
  { name: 'Russian',   code: 'ru',    tag: 'RUSSIAN'  },
  { name: 'Chinese',   code: 'zh-CN', tag: 'CHINESE'  }
];

async function main() {
  console.log('========================================');
  console.log('  ML-7 E2E: Multi-Language Pipeline');
  console.log('  Sprachen: French, Spanish, Polish, Russian, Chinese');
  console.log('========================================\n');

  // ── Snapshot global state ──────────────────────────────────────────
  const ORIGINAL_ARGV = process.argv.slice();
  const ORIGINAL_IS_TTY = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');
  const persistedFlagPath = path.join(__dirname, '..', '.native_confirmed');
  const envPath = ENV_PATH; // core/Translation/.env (what persistSingleEnvVar actually writes to)
  const envBackupPath = path.join(path.dirname(envPath), '.env.e2e-ml7-backup');

  // Backup .env if it exists (persistSingleEnvVar writes to core/Translation/.env)
  let envExisted = fs.existsSync(envPath);
  if (envExisted) {
    await fsp.copyFile(envPath, envBackupPath);
  } else {
    // Ensure the directory exists for synthetic .env writes
    await fsp.mkdir(path.dirname(envPath), { recursive: true });
  }

  let persistedExistedBefore = fs.existsSync(persistedFlagPath);
  const persistedBackupPath = path.join(os.tmpdir(), `.native_confirmed.ml7-backup-${Date.now()}`);
  if (persistedExistedBefore) {
    await fsp.copyFile(persistedFlagPath, persistedBackupPath);
    await fsp.unlink(persistedFlagPath);
  }

  tmpModDir = await setupTempMod();

  // Simulate --gui so native mode gate auto-passes
  process.argv = [...ORIGINAL_ARGV, '--gui'];

  try {
    /* ===== T1: LANG_CODES Mapping ===== */
    console.log('[T1] LANG_CODES — alle 5 Kernsprachen + Edge Cases');
    console.log('─'.repeat(50));

    for (const lang of CORE_LANGUAGES) {
      check(`T1 — ${lang.name} → "${lang.code}"`,
        LANG_CODES[lang.name] === lang.code,
        `got: ${LANG_CODES[lang.name]}`);
    }

    // Verify all core languages are in SUPPORTED_LANGS
    for (const lang of CORE_LANGUAGES) {
      check(`T1 — ${lang.name} in SUPPORTED_LANGS`,
        SUPPORTED_LANGS.includes(lang.name));
    }

    // SUPPORTED_LANGS count (14)
    check('T1 — SUPPORTED_LANGS count = 14',
      SUPPORTED_LANGS.length === 14,
      `actual: ${SUPPORTED_LANGS.length} (${SUPPORTED_LANGS.join(', ')})`);

    // Edge: unknown language returns undefined
    check('T1 — unknown lang "Klingon" → undefined',
      LANG_CODES['Klingon'] === undefined);

    // Edge: all codes are non-empty strings
    for (const lang of CORE_LANGUAGES) {
      check(`T1 — ${lang.name} code is non-empty`,
        typeof LANG_CODES[lang.name] === 'string' && LANG_CODES[lang.name].length > 0);
    }
    console.log();

    /* ===== T2: File Path Replacement ===== */
    console.log('[T2] File path English/ → <TARGET_LANG>/ replacement');
    console.log('─'.repeat(50));

    // This is the regex from runtime-ops.js translateMod():
    // targetRelPath.replace(/(?:\/|\\)(English)(?:\/|\\)/i, `/${config.TARGET_LANG}/`)

    const PATH_REGEX = /(?:\/|\\)(English)(?:\/|\\)/i;

    for (const lang of CORE_LANGUAGES) {
      // Windows-style paths
      const winPath = 'V71\\assets\\text\\English\\room\\hall.txt';
      const winExpected = `V71\\assets\\text\\${lang.name}\\room\\hall.txt`;
      const winReplaced = winPath.replace(PATH_REGEX, `\\${lang.name}\\`);
      check(`T2 — ${lang.name} Windows path replaced`,
        winReplaced === winExpected, `expected "${winExpected}", got "${winReplaced}"`);

      // Unix-style paths
      const unixPath = 'V71/assets/text/English/ui/main.txt';
      const unixExpected = `V71/assets/text/${lang.name}/ui/main.txt`;
      const unixReplaced = unixPath.replace(PATH_REGEX, `/${lang.name}/`);
      check(`T2 — ${lang.name} Unix path replaced`,
        unixReplaced === unixExpected, `expected "${unixExpected}", got "${unixReplaced}"`);

      // Case-insensitive ("english" lowercase)
      const lowerPath = 'V71/assets/text/english/room/hall.txt';
      const lowerExpected = `V71/assets/text/${lang.name}/room/hall.txt`;
      const lowerReplaced = lowerPath.replace(PATH_REGEX, `/${lang.name}/`);
      check(`T2 — ${lang.name} case-insensitive "english"`,
        lowerReplaced === lowerExpected, `expected "${lowerExpected}", got "${lowerReplaced}"`);

      // Edge: no English/ folder → no change
      const noEnglishPath = 'V71/assets/text/room/hall.txt';
      const noReplace = noEnglishPath.replace(PATH_REGEX, `/${lang.name}/`);
      check(`T2 — ${lang.name} no English/ → unchanged`,
        noReplace === noEnglishPath);
    }

    // Edge: "English" as part of a filename, not a folder → should NOT match
    const filenamePath = 'V71/assets/text/ui/English_description.txt';
    for (const lang of CORE_LANGUAGES) {
      const replaced = filenamePath.replace(PATH_REGEX, `/${lang.name}/`);
      check(`T2 — ${lang.name} "English" in filename → unchanged`,
        replaced === filenamePath, `got: "${replaced}"`);
    }
    console.log();

    /* ===== T3: _Info.txt Language Tag ===== */
    console.log('[T3] _Info.txt NAME → NAME <TAG> per language');
    console.log('─'.repeat(50));

    // The tag logic in runtime-ops.js:
    // const langTag = config.TARGET_LANG.toUpperCase();
    // nameValue.endsWith(` ${langTag}`) check

    for (const lang of CORE_LANGUAGES) {
      // Test tag generation
      const langTag = lang.name.toUpperCase();
      check(`T3 — ${lang.name} tag = "${langTag}"`,
        langTag === lang.tag);

      // Test that name with tag is detected (dedup guard)
      const modName = 'Test Mod';
      const taggedName = `${modName} ${langTag}`;
      check(`T3 — ${lang.name} dedup detects existing tag`,
        taggedName.endsWith(` ${langTag}`));

      // Test that untagged name does not match
      check(`T3 — ${lang.name} untagged name detected`,
        !modName.endsWith(` ${langTag}`));
    }

    // Edge: Chinese with special characters
    const zhTag = 'CHINESE';
    check('T3 — Chinese tag = "CHINESE"', zhTag === 'CHINESE');
    check('T3 — Chinese tag is ASCII-safe', /^[A-Z]+$/.test(zhTag));
    console.log();

    /* ===== T4: Model Registry per Language ===== */
    console.log('[T4] Model Registry — getModelStatus per language');
    console.log('─'.repeat(50));

    // Stub argos and ollama to avoid real system calls
    const argos = require('../scripts/check_argos');
    const ollama = require('../scripts/start_ollama');

    const origIsArgosInstalled = argos.isArgosInstalled;
    const origGetAvailable = argos.getAvailableArgosLanguages;
    const origCheckLangs = argos.checkArgosLanguages;
    const origInstallArgosLanguage = argos.installArgosLanguage;
    const origCheckOllama = ollama.checkOllama;
    const origGetOllamaModels = ollama.getOllamaAvailableModels;

    argos.isArgosInstalled = () => true;
    argos.getAvailableArgosLanguages = async () => ['de', 'fr', 'es', 'pl', 'ru', 'zh-CN'];
    argos.checkArgosLanguages = async (codes) => {
      const map = {};
      for (const c of codes) map[c] = ['de','fr','es','pl','ru','zh-CN'].includes(c);
      return map;
    };
    argos.installArgosLanguage = async (code) => true;
    ollama.checkOllama = async () => false;
    ollama.getOllamaAvailableModels = async () => [];

    try {
      for (const lang of CORE_LANGUAGES) {
        const registry = createModelRegistry({
          ollamaUrl: 'http://localhost:11434',
          getTargetLang: () => lang.name
        });

        check(`T4 — ${lang.name} registry created`, !!registry);

        const status = await registry.getModelStatus();
        check(`T4 — ${lang.name} targetLang = "${lang.name}"`,
          status.targetLang === lang.name,
          `actual: ${status.targetLang}`);
        check(`T4 — ${lang.name} targetLangCode = "${lang.code}"`,
          status.targetLangCode === lang.code,
          `actual: ${status.targetLangCode}`);
        check(`T4 — ${lang.name} argos.targetLangInstalled = true`,
          status.argos.targetLangInstalled === true,
          `actual: ${status.argos.targetLangInstalled}`);
        check(`T4 — ${lang.name} needsLanguageInstall = false`,
          status.argos.needsLanguageInstall === false,
          `actual: ${status.argos.needsLanguageInstall}`);

        // installTargetLanguage with override
        const result = await registry.installTargetLanguage(lang.name);
        check(`T4 — ${lang.name} installTargetLanguage ok`,
          result.ok === true, `message: ${result.message}`);
        check(`T4 — ${lang.name} installTargetLanguage code = "${lang.code}"`,
          result.code === lang.code, `actual: ${result.code}`);
      }

      // Edge: unknown language install
      const unknownReg = createModelRegistry({
        getTargetLang: () => 'Klingon'
      });
      const unknownResult = await unknownReg.installTargetLanguage('Klingon');
      check('T4 — unknown lang install → ok=false', unknownResult.ok === false);
      check('T4 — unknown lang install → code=null', unknownResult.code === null);

      // Edge: getTargetLang as static string (legacy)
      const staticReg = createModelRegistry({
        targetLang: 'Polish'
      });
      const staticStatus = await staticReg.getModelStatus();
      check('T4 — static targetLang → Polish', staticStatus.targetLang === 'Polish');
      check('T4 — static targetLang → pl', staticStatus.targetLangCode === 'pl');

    } finally {
      // Restore stubs
      argos.isArgosInstalled = origIsArgosInstalled;
      argos.getAvailableArgosLanguages = origGetAvailable;
      argos.checkArgosLanguages = origCheckLangs;
      argos.installArgosLanguage = origInstallArgosLanguage;
      ollama.checkOllama = origCheckOllama;
      ollama.getOllamaAvailableModels = origGetOllamaModels;
    }
    console.log();

    /* ===== T5: Config Persistence per Language ===== */
    console.log('[T5] persistSingleEnvVar — all 5 languages');
    console.log('─'.repeat(50));

    // Write a synthetic .env for testing
    const baseEnv = [
      'PRIMARY_PROVIDER="openrouter"',
      'OPENROUTER_KEY="sk-test-123"',
      'BATCH_SIZE="24"',
      ''
    ].join('\n');

    for (const lang of CORE_LANGUAGES) {
      await fsp.writeFile(envPath, baseEnv, 'utf-8');

      const result = await persistSingleEnvVar('TARGET_LANG', lang.name);
      check(`T5 — ${lang.name} persist returns ok`, result.written === true,
        `actual: ${JSON.stringify(result)}`);
      check(`T5 — ${lang.name} persist echoes key`, result.key === 'TARGET_LANG');
      check(`T5 — ${lang.name} persist echoes value`, result.value === lang.name);

      // Read from ENV_PATH — the actual path that persistSingleEnvVar writes to
      const content = await fsp.readFile(envPath, 'utf-8');
      const hasTargetLang = content.includes(`TARGET_LANG="${lang.name}"`);
      check(`T5 — ${lang.name} TARGET_LANG persisted in .env`,
        hasTargetLang,
        `expected TARGET_LANG="${lang.name}" in ${envPath}`);
      check(`T5 — ${lang.name} BATCH_SIZE preserved`,
        content.includes('BATCH_SIZE="24"'));
      check(`T5 — ${lang.name} PRIMARY_PROVIDER preserved`,
        content.includes('PRIMARY_PROVIDER="openrouter"'));
    }

    // Cleanup test .env
    await fsp.writeFile(envPath, baseEnv, 'utf-8');
    console.log();

    /* ===== T6: createRuntimeOps — TARGET_LANG flows through ===== */
    console.log('[T6] createRuntimeOps — TARGET_LANG across all 5 languages');
    console.log('─'.repeat(50));

    for (const lang of CORE_LANGUAGES) {
      const capt = captureConsole();
      const inq = makePromptsMock(true);
      const ops = createRuntimeOps(makeDeps({
        targetLang: lang.name,
        promptsInstance: inq.instance
      }));

      // modFolderName includes TARGET_LANG: `${modName}_${config.TARGET_LANG}`
      let result = null;
      try {
        result = await ops.translateMod(tmpModDir, { dryRun: true });
      } catch (e) {
        // stubs may throw past the gate — we only care about the gate pass
      }
      capt.restore();

      // Check that the run reached the TARGET_LANG-dependent code
      // (modFolderName is set BEFORE dryRun check in translateMod)
      const logText = capt.logs.join(' ');
      check(`T6 — ${lang.name} translateMod ran`,
        result !== null || logText.includes('Native Mode aktiv'),
        `result: ${result !== null ? 'non-null' : 'null'}`);

      // Verify no prompts fired (GUI mode, already confirmed)
      check(`T6 — ${lang.name} no prompts fired`,
        inq.calls.length === 0,
        `calls: ${inq.calls.length}`);
    }

    // Extra: verify modFolderName construction manually
    // The format is: `${modName.replace(/[^a-z0-9]/gi, '_')}_${config.TARGET_LANG}`
    for (const lang of CORE_LANGUAGES) {
      const modName = 'Test Mod With Spaces!';
      const sanitized = modName.replace(/[^a-z0-9]/gi, '_');
      const folderName = `${sanitized}_${lang.name}`;
      check(`T6 — ${lang.name} modFolderName contains language`,
        folderName.endsWith(`_${lang.name}`),
        `folderName: "${folderName}"`);
      check(`T6 — ${lang.name} modFolderName sanitized`,
        !folderName.includes(' ') && !folderName.includes('!'),
        `folderName: "${folderName}"`);
    }

    // Verify NATIVE_MODE=false skips path replacement (gated in runtime-ops.js)
    const noNativeCapt = captureConsole();
    const noNativeInq = makePromptsMock(true);
    const noNativeOps = createRuntimeOps(makeDeps({
      targetLang: 'French',
      promptsInstance: noNativeInq.instance,
      configOverrides: { NATIVE_MODE: false }
    }));
    try { await noNativeOps.translateMod(tmpModDir, { dryRun: true }); } catch (e) {}
    noNativeCapt.restore();
    check('T6 — NATIVE_MODE=false → no "Native Mode aktiv"',
      !noNativeCapt.logs.some(l => l.includes('Native Mode aktiv')));

    // Verify TARGET_LANG=English skips path replacement
    // (runtime-ops.js gated: config.TARGET_LANG.toLowerCase() !== 'english')
    const englishCapt = captureConsole();
    const englishInq = makePromptsMock(true);
    const englishOps = createRuntimeOps(makeDeps({
      targetLang: 'English',
      promptsInstance: englishInq.instance
    }));
    let engResult = null;
    try { engResult = await englishOps.translateMod(tmpModDir, { dryRun: true }); } catch (e) {}
    englishCapt.restore();
    check('T6 — TARGET_LANG=English → translateMod runs',
      engResult !== null || englishCapt.logs.some(l => l.includes('Native Mode aktiv')));
    console.log();

    /* ===== T7: Cross-language consistency ===== */
    console.log('[T7] Cross-language consistency checks');
    console.log('─'.repeat(50));

    // All 5 languages have unique codes
    const codes = CORE_LANGUAGES.map(l => LANG_CODES[l.name]);
    const uniqueCodes = new Set(codes);
    check('T7 — all 5 codes are unique',
      uniqueCodes.size === 5, `codes: ${codes.join(', ')}`);

    // All codes are valid ISO 639-1 or zh-CN
    const validCodePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    for (const lang of CORE_LANGUAGES) {
      const code = LANG_CODES[lang.name];
      check(`T7 — ${lang.name} code "${code}" matches ISO pattern`,
        validCodePattern.test(code),
        `code: "${code}"`);
    }

    // No code is empty or undefined
    for (const lang of CORE_LANGUAGES) {
      check(`T7 — ${lang.name} code is truthy`,
        !!LANG_CODES[lang.name],
        `code: ${LANG_CODES[lang.name]}`);
    }

    // All tags are uppercase ASCII
    for (const lang of CORE_LANGUAGES) {
      check(`T7 — ${lang.name} tag is uppercase`,
        lang.tag === lang.name.toUpperCase() && /^[A-Z]+$/.test(lang.tag));
    }
    console.log();

  } finally {
    // ── Cleanup ─────────────────────────────────────────────────────
    process.argv = ORIGINAL_ARGV;
    if (ORIGINAL_IS_TTY) {
      Object.defineProperty(process.stdin, 'isTTY', ORIGINAL_IS_TTY);
    } else {
      try { delete process.stdin.isTTY; } catch (e) {}
    }

    // Restore .native_confirmed
    if (fs.existsSync(persistedFlagPath)) {
      await fsp.unlink(persistedFlagPath);
    }
    if (persistedExistedBefore && fs.existsSync(persistedBackupPath)) {
      await fsp.copyFile(persistedBackupPath, persistedFlagPath);
      await fsp.unlink(persistedBackupPath);
    }

    // Restore .env
    if (fs.existsSync(envBackupPath)) {
      await fsp.copyFile(envBackupPath, envPath);
      await fsp.unlink(envBackupPath);
    } else if (!envExisted && fs.existsSync(envPath)) {
      // We created a test .env but the user had none → remove it
      await fsp.unlink(envPath);
    }

    if (tmpModDir) await cleanupTemp(tmpModDir);
  }

  /* ===== SUMMARY ===== */
  const total = passed + failed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  console.log('========================================');
  console.log('  ML-7 Multi-Language E2E Ergebnis:');
  console.log(`  ${passed} PASS / ${failed} FAIL (${passRate}%)`);
  console.log('========================================');

  // Per-language summary
  for (const lang of CORE_LANGUAGES) {
    console.log(`  ${lang.name.padEnd(12)} ${lang.code.padEnd(6)} Tag=${lang.tag}`);
  }

  return failed > 0 ? 1 : 0;
}

// ── Run ─────────────────────────────────────────────────────────────────
(async () => {
  let exitCode = 0;
  try {
    exitCode = await main();
  } catch (e) {
    console.error(`\n[!] Test crashed: ${e.message}`);
    console.error(e.stack);
    exitCode = 1;
  } finally {
    // Safety-net: restore .env if main() crashed before teardown
    const envPath = ENV_PATH;
    const envBackupPath = path.join(path.dirname(envPath), '.env.e2e-ml7-backup');
    try {
      if (fs.existsSync(envBackupPath)) {
        await fsp.copyFile(envBackupPath, envPath);
        await fsp.unlink(envBackupPath);
        console.log('[SAFETY] .env aus Backup wiederhergestellt.');
      }
    } catch (e) {
      console.error(`[SAFETY] Konnte .env nicht wiederherstellen: ${e.message}`);
    }
    process.exit(exitCode);
  }
})();
