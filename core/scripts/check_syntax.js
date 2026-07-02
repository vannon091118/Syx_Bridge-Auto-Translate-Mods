const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * checkSyntax(dir) — Syntax-Check aller JS-Dateien in einem Verzeichnis.
 * BU-030: Aus CLI-Body in wiederverwendbare Funktion extrahiert.
 * @param {string} coreDir — Pfad zum core/-Verzeichnis
 * @returns {{ pass: boolean, fileCount: number, failures: number, failedFiles: string[] }}
 */
function checkSyntax(coreDir) {
  function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('release') && !file.includes('.DB backups') && !file.includes('backups') && path.basename(file) !== 'tests') {
          results = results.concat(getFiles(file));
        }
      } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
        results.push(file);
      }
    });
    return results;
  }

  const domainDirs = ['DB', 'Translation', 'GUI', 'commit-layer'];
  const domainFiles = domainDirs.flatMap(d => {
    const p = path.join(coreDir, d);
    return fs.existsSync(p) ? getFiles(p) : [];
  });
  const files = [path.join(coreDir, 'index.js'), ...domainFiles, ...getFiles(path.join(coreDir, 'scripts'))];

  const failedFiles = [];
  files.forEach(file => {
    try {
      execSync(`node --check "${file}"`, { stdio: 'ignore' });
    } catch (e) {
      failedFiles.push(file);
    }
  });

  return {
    pass: failedFiles.length === 0,
    fileCount: files.length,
    failures: failedFiles.length,
    failedFiles
  };
}

// ── CLI (BU-030: require.main guard) ──────────────────────────────────
if (require.main === module) {
  const coreDir = process.cwd();
  const result = checkSyntax(coreDir);

  console.log(`🔍 Checking syntax for ${result.fileCount} files...`);
  if (!result.pass) {
    result.failedFiles.forEach(f => console.error(`❌ Syntax error in ${f}`));
    process.exit(1);
  }
  console.log('✅ All files passed syntax check.');
  process.exit(0);
}

module.exports = { checkSyntax };
