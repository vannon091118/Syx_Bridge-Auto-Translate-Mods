const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const coreDir = process.cwd();
const domainDirs = ['DB', 'Translation', 'GUI', 'commit-layer'];
const domainFiles = domainDirs.flatMap(d => {
  const p = path.join(coreDir, d);
  return fs.existsSync(p) ? getFiles(p) : [];
});
const files = [path.join(coreDir, 'index.js'), ...domainFiles, ...getFiles(path.join(coreDir, 'scripts'))];

console.log(`🔍 Checking syntax for ${files.length} files...`);

let failures = 0;
files.forEach(file => {
  try {
    execSync(`node --check "${file}"`, { stdio: 'ignore' });
  } catch (e) {
    console.error(`❌ Syntax error in ${file}`);
    failures++;
  }
});

if (failures > 0) {
  process.exit(1);
} else {
  console.log('✅ All files passed syntax check.');
  process.exit(0);
}
