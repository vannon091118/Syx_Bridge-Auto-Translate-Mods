const fs = require('fs');

let html = fs.readFileSync('core/src/gui/public/index.html', 'utf8');

function extractPanel(title) {
    const match = html.match(new RegExp('(<div class="panel">\\s*<h3>' + title + '</h3>.*?</div>)\\s*(?=<div class="panel">|<div class="main-layout">|</div>\\s*</div>)', 's'));
    return match ? match[1] : '';
}

const head = html.substring(0, html.indexOf('<body>') + 6);
const footer = html.substring(html.indexOf('<footer>'), html.length);
const headerMatch = html.match(/(<header>.*?<\/header>)/s);
let header = headerMatch ? headerMatch[1] : '';

const modePanel = extractPanel('Bridge Mode');
const configPanel = extractPanel('Live Config');
const providerPanel = extractPanel('Provider Stats');

const pipelinePanel = extractPanel('Pipeline');
const statsPanel = extractPanel('Statistiken');
const actionPanel = extractPanel('Aktionen');

const sysStatusMatch = html.match(/(<div class="panel">\s*<div style="display:flex.*?<h3 style="margin:0;">System-Status<\/h3>.*?<div class="progress-bar">.*?<\/div>\s*<\/div>\s*<\/div>)/s);
const systemStatusPanel = sysStatusMatch ? sysStatusMatch[1] : '';

const dbStreamMatch = html.match(/(<div class="panel"[^>]*>\s*<h3>DB Translation Stream<\/h3>.*?<\/div>\s*<\/div>)/s);
const dbStreamPanel = dbStreamMatch ? dbStreamMatch[1] : '';

const diagMatch = html.match(/(<div class="panel">\s*<h3>Bridge Diagnostics<\/h3>.*?<\/div>\s*<\/div>)/s);
const diagPanel = diagMatch ? diagMatch[1] : '';

const topSettingsBtn = `
        <div id="top-settings-container" style="position: absolute; left: 50%; transform: translateX(-50%); z-index: 1001;">
            <button id="settings-toggle-btn" onclick="toggleSettings()" style="background: rgba(0,0,0,0.5); border: 1px solid var(--accent); font-size: 0.8rem; padding: 6px 20px; color: var(--accent); border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.3s;">⚙️ API & EINSTELLUNGEN</button>
            <div id="settings-dropdown" style="display: none; position: absolute; top: 40px; left: 50%; transform: translateX(-50%); background: var(--panel-bg); border: 1px solid var(--accent); padding: 20px; border-radius: 8px; z-index: 1000; width: 500px; box-shadow: 0 10px 50px rgba(0,0,0,0.9); max-height: 80vh; overflow-y: auto;">
                ${modePanel}
                ${configPanel}
                ${providerPanel}
            </div>
        </div>
`;
header = header.replace('<div style="display: flex; flex-direction: column; align-items: flex-end;">', topSettingsBtn + '\n        <div style="display: flex; flex-direction: column; align-items: flex-end;">');

const dbBrowserDrawer = `
    <!-- BOTTOM DB BROWSER DRAWER -->
    <div id="db-browser-drawer" style="position: fixed; bottom: -100vh; left: 0; width: 100vw; height: 50vh; background: var(--panel-bg); border-top: 2px solid var(--accent); transition: bottom 0.3s ease; z-index: 2000; display: flex; flex-direction: column; box-shadow: 0 -5px 40px rgba(0,0,0,0.9);">
        <div style="padding: 10px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #0a0a0a;">
            <h3 style="margin:0; color: var(--accent);">Datenbank Browser</h3>
            <div>
                <input type="text" id="db-search" placeholder="Suchen..." style="width: 250px; margin:0 10px 0 0;" oninput="searchDb()">
                <button onclick="toggleDbBrowser()" class="secondary">Schließen</button>
            </div>
        </div>
        <div style="flex: 1; padding: 15px; overflow: hidden; display: flex; flex-direction: column;">
            <div class="db-table-container">
                <table class="db-table">
                    <thead>
                        <tr>
                            <th style="width: 40%;">Original</th>
                            <th style="width: 40%;">Übersetzung</th>
                            <th style="width: 10%;">Sprache</th>
                            <th style="width: 10%;">Aktion</th>
                        </tr>
                    </thead>
                    <tbody id="db-table-body">
                        <!-- Rows via JS -->
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; font-size: 0.7rem; color: var(--muted); display:flex; justify-content:space-between;">
                <div>Klicke auf eine Übersetzung zum Editieren. Änderungen werden beim Speichern übernommen.</div>
                <div id="db-count">0 Einträge</div>
            </div>
        </div>
    </div>
`;

let modifiedActionPanel = actionPanel.replace(/openDbBrowser\(\)/g, 'toggleDbBrowser()');

const leftSidebar = `
        <!-- LEFT SIDEBAR -->
        <div class="sidebar">
            ${systemStatusPanel}
            ${pipelinePanel}
            ${modifiedActionPanel}
        </div>
`;

let rightSidebarPanel = diagPanel.replace('</div>\n            </div>', '<div style="margin-top:15px; border-top:1px solid var(--border); padding-top:10px;">\n                <h4 style="margin: 0 0 10px 0; color: var(--accent); font-size: 0.8rem;">Statistiken</h4>\n' + statsPanel.replace(/<div class="panel">/g, '').replace(/<h3>Statistiken<\/h3>/g, '').replace(/<\/div>\s*$/g, '') + '\n                </div>\n            </div>\n            </div>');

const rightSidebar = `
        <!-- RIGHT SIDEBAR -->
        <div class="right-sidebar">
            ${rightSidebarPanel}
        </div>
`;

const interactionViewerMatch = html.match(/(<div class="interaction-viewer">.*?<\/div>\s*<\/div>\s*<\/div>)/s);
const interactionViewer = interactionViewerMatch ? interactionViewerMatch[1] : '';

const logMatch = html.match(/(<div id="log" class="log-panel"><\/div>)/s);
const logPanel = logMatch ? logMatch[1] : '<div id="log" class="log-panel"></div>';

const centerStack = `
        <!-- CENTER STACK -->
        <div class="center-stack">
            <div style="display: flex; flex: 1; min-height: 40%; max-height: 45%;">
                <div style="flex: 1; display: flex; flex-direction: column; margin-right: 10px;">
                    <div class="panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-bottom: 0;">
                        <h3 style="font-size: 0.8rem; margin: 0 0 10px 0;">LLM Kommunikation</h3>
                        ${interactionViewer.replace('<div class="interaction-viewer">', '<div class="interaction-viewer" style="grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; margin-bottom: 0; flex: 1; overflow: hidden; gap: 5px;">')}
                    </div>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column;">
                    ${dbStreamPanel.replace('class="panel" style="flex: 1;', 'class="panel" style="flex: 1; margin-bottom: 0;')}
                </div>
            </div>
            ${logPanel}
        </div>
`;

const keyModalMatch = html.match(/(<!-- KEY MODAL -->\s*<div id="key-modal".*?<\/div>\s*<\/div>\s*<\/div>)/s);
const keyModal = keyModalMatch ? keyModalMatch[1] : '';

const overlay = '<div id="settings-overlay" onclick="toggleSettings()" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 999;"></div>';

const newHtml = `
${head}
    ${overlay}
    ${header}
    <div class="main-layout">
${leftSidebar}
${centerStack}
${rightSidebar}
    </div>
${dbBrowserDrawer}
${keyModal}
${footer}
`;

fs.writeFileSync('core/src/gui/public/index.html', newHtml, 'utf8');
