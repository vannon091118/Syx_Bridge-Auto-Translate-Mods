# -*- coding: utf-8 -*-
import re

with open('core/src/gui/public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Header Changes
header_match = re.search(r'(<header>.*?</header>)', content, re.DOTALL)
header_html = header_match.group(1)

settings_btn = '''
        <div id="top-settings-container" style="position: absolute; left: 50%; transform: translateX(-50%); z-index: 1001;">
            <button id="settings-toggle-btn" onclick="toggleSettings()" style="background: rgba(0,0,0,0.5); border: 1px solid var(--accent); font-size: 0.8rem; padding: 6px 20px; color: var(--accent); border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.3s;">⚙️ API & EINSTELLUNGEN</button>
            <div id="settings-dropdown" style="display: none; position: absolute; top: 40px; left: 50%; transform: translateX(-50%); background: var(--panel-bg); border: 1px solid var(--accent); padding: 20px; border-radius: 8px; z-index: 1000; width: 500px; box-shadow: 0 10px 50px rgba(0,0,0,0.9); max-height: 80vh; overflow-y: auto;">
                <!-- SETTINGS_CONTENT -->
            </div>
        </div>
'''
header_html = header_html.replace('<div style="display: flex; flex-direction: column; align-items: flex-end;">', settings_btn + '\n        <div style="display: flex; flex-direction: column; align-items: flex-end;">')

# Extract sections
def extract_panel(title):
    pattern = r'<div class="panel">\s*<h3>' + title + r'</h3>.*?</div>\s*</div>'
    match = re.search(r'(<div class="panel">\s*<h3>' + title + r'</h3>.*?(?:</div>\s*)+?)(?=\s*<div class="panel"|\s*</div>\s*<!-- KEY MODAL)', content, re.DOTALL)
    if not match:
        match = re.search(r'(<div class="panel">\s*<h3>' + title + r'</h3>.*?</div>)\s*(?=<div class="panel">|</div>)', content, re.DOTALL)
    return match.group(1) if match else ""

mode_panel = extract_panel("Bridge Mode")
config_panel = extract_panel("Live Config")
provider_panel = extract_panel("Provider Stats")
pipeline_panel = extract_panel("Pipeline")
stats_panel = extract_panel("Statistiken")
aktionen_panel = extract_panel("Aktionen")

# Re-assemble sidebar without the extracted panels
sidebar_pattern = r'(<!-- LEFT SIDEBAR: CONFIG & ACTIONS -->\s*<div class="sidebar">\s*<div class="panel">.*?</div>\s*</div>).*?(?=<!-- KEY MODAL)'
system_status_match = re.search(r'(<!-- LEFT SIDEBAR: CONFIG & ACTIONS -->\s*<div class="sidebar">\s*<div class="panel">.*?<div id="ui-progress-text".*?</div>\s*</div>\s*</div>)', content, re.DOTALL)

new_sidebar = system_status_match.group(1) + '\n' + pipeline_panel + '\n' + aktionen_panel + '\n        </div>\n'

# Put config into settings_dropdown
settings_content = mode_panel + '\n' + config_panel + '\n' + provider_panel
header_html = header_html.replace('<!-- SETTINGS_CONTENT -->', settings_content)

# Right sidebar changes
diag_match = re.search(r'(<div class="panel">\s*<h3>Bridge Diagnostics</h3>.*?</div>)', content, re.DOTALL)
new_diag = diag_match.group(1).replace('</div>', stats_panel.replace('<div class="panel">', '<div style="margin-top:15px; border-top:1px solid var(--border); padding-top:10px;">').replace('<h3>Statistiken</h3>', '<h4 style="margin: 0 0 10px 0; color: var(--accent); font-size: 0.8rem;">Statistiken</h4>') + '\n            </div>')

db_stream_match = re.search(r'(<div class="panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">\s*<h3>DB Translation Stream</h3>.*?</div>)', content, re.DOTALL)

new_right_sidebar = '<!-- RIGHT SIDEBAR: DB SAMPLES -->\n        <div class="right-sidebar">\n            ' + db_stream_match.group(1) + '\n            ' + new_diag + '\n        </div>'

# Center Stack changes (Integrate DB Browser)
db_browser_content = re.search(r'(<div style="display:flex; justify-content:space-between; align-items:center;">\s*<h3>Datenbank Browser</h3>.*?<div id="db-count">.*?</div>\s*</div>)', content, re.DOTALL).group(1)
# Remove the close button
db_browser_content = re.sub(r'<button onclick="closeDbBrowser\(\)".*?</button>', '', db_browser_content)

center_stack_pattern = r'(<!-- CENTER: LLM INTERACTION & LOGS -->\s*<div class="center-stack">)(.*?)(</div>\s*<!-- RIGHT SIDEBAR: DB SAMPLES -->)'
center_stack_match = re.search(center_stack_pattern, content, re.DOTALL)

new_center_stack = '''<!-- CENTER: LLM INTERACTION & LOGS -->
        <div class="center-stack">
            <!-- DB BROWSER VIEW (IDLE) -->
            <div id="db-browser-view" style="display: flex; flex: 1; flex-direction: column; padding: 15px; overflow: hidden; background: #0a0a0a;">
                ''' + db_browser_content + '''
            </div>
            
            <!-- TERMINAL VIEW (RUNNING) -->
            <div id="terminal-view" style="display: none; flex-direction: column; flex: 1; overflow: hidden;">
                ''' + center_stack_match.group(2).strip() + '''
            </div>
        </div>
'''

# Delete the DB BROWSER MODAL completely
content = re.sub(r'<!-- DB BROWSER MODAL -->.*?</div>\s*</div>', '', content, flags=re.DOTALL)

# Reconstruct
content = re.sub(r'<header>.*?</header>', header_html, content, flags=re.DOTALL)
content = re.sub(sidebar_pattern, new_sidebar, content, flags=re.DOTALL)
content = re.sub(r'<!-- RIGHT SIDEBAR: DB SAMPLES -->.*?</div>\s*</div>\s*</div>', new_right_sidebar + '\n    </div>', content, flags=re.DOTALL)
content = re.sub(center_stack_pattern, new_center_stack + '        <!-- RIGHT SIDEBAR: DB SAMPLES -->', content, flags=re.DOTALL)

# Add overlay
content = content.replace('<body>', '<body>\n    <div id="settings-overlay" onclick="toggleSettings()" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 999;"></div>')

with open('core/src/gui/public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
