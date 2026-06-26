'use strict';

/**
 * argos-client.js — Argos Translate Offline-Client
 * Extrahiert aus client-factory.js (v0.24).
 *
 * createArgosClient() erzeugt die callArgosBatch()-Funktion.
 * Argos Translate läuft komplett offline via Python-Subprozess —
 * kein Internet, kein API-Key, lokale Modelle auf der CPU.
 *
 * Der Python-Subprozess wird via async spawn gestartet, damit
 * der AbortController (BU-020) den Prozess bei Ctrl+C killen kann.
 */

const { spawn } = require('child_process');

function createArgosClient({ targetLang, langCodes, getAbortSignal }) {
  const tl = langCodes[targetLang] || 'de';

  async function callArgosBatch(texts) {
    console.log(`[INFO] Argos Translate Local (${texts.length} Texte)...`);

    const payload = JSON.stringify({ texts, target_lang: tl });
    const b64Payload = Buffer.from(payload).toString('base64');

    const pythonScript = `
import argostranslate.translate, base64, json, sys

try:
    data = json.loads(base64.b64decode('${b64Payload}').decode('utf-8'))
    texts = data['texts']
    tl = data['target_lang']
    
    results = []
    for text in texts:
        results.append(argostranslate.translate.translate(text, 'en', tl))
    
    print(json.dumps(results))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`.trim();

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', ['-'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
      pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Argos Python spawn failed: ${err.message}`, { cause: err }));
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `Argos Python exited with code ${code}`));
          return;
        }
        try {
          const results = JSON.parse(stdout.trim());
          if (results.error) {
            reject(new Error(results.error));
          } else {
            resolve(results);
          }
        } catch (e) {
          reject(new Error(`Argos Translate fehlgeschlagen: ${e.message}`, { cause: e }));
        }
      });

      // BU-020: Kill Python subprocess when AbortController fires.
      const signal = getAbortSignal();
      if (signal.aborted) {
        pythonProcess.kill();
        reject(new Error('ABORTED'));
        return;
      }
      signal.addEventListener('abort', () => {
        pythonProcess.kill();
        reject(new Error('ABORTED'));
      }, { once: true });

      // Adaptive timeout: 30s base + 2s per text
      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error(`Argos Batch timed out after ${30000 + (texts.length * 2000)}ms`));
      }, 30000 + (texts.length * 2000));

      // Clean up timeout on completion
      pythonProcess.on('close', () => clearTimeout(timeout));

      pythonProcess.stdin.write(pythonScript);
      pythonProcess.stdin.end();
    }).catch((e) => {
      // BU-020: Don't log ABORTED as a failure — it's expected user behavior.
      if (e.message !== 'ABORTED') {
        console.warn(`[!] Argos Translate Batch fehlgeschlagen: ${e.message}`);
      }
      throw e;
    });
  }

  return callArgosBatch;
}

module.exports = { createArgosClient };
