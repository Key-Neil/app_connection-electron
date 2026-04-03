interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface JarvisBridge {
  getConfig: () => Promise<{ hasApiKey: boolean; rules: string[] }>;
  saveConfig: (apiKey: string | null, rules: string[]) => Promise<{ success: boolean; error?: string }>;
  chat: (history: ChatMessage[], userMessage: string) => Promise<{ success: boolean; reply?: string; error?: string }>;
  search: (query: string) => Promise<{ success: boolean; results?: string; error?: string }>;
}

let chatHistory: ChatMessage[] = [];
let jarvisRules: string[] = [];

function getJarvisBridge(): JarvisBridge | undefined {
  return (window as any).jarvis as JarvisBridge | undefined;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function appendMessage(role: 'user' | 'assistant' | 'system', content: string) {
  const messagesEl = document.getElementById('jarvis-messages');
  if (!messagesEl) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `jarvis-msg jarvis-msg-${role}`;

  const labelMap: Record<string, string> = {
    user: '🧑 Vous',
    assistant: '🤖 Jarvis',
    system: 'ℹ️ Système',
  };

  msgDiv.innerHTML = `
    <div class="jarvis-msg-label">${labelMap[role] || role}</div>
    <div class="jarvis-msg-content">${escapeHtml(content)}</div>
  `;
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setLoading(loading: boolean) {
  const sendBtn = document.getElementById('jarvis-send') as HTMLButtonElement | null;
  const input = document.getElementById('jarvis-input') as HTMLTextAreaElement | null;
  if (sendBtn) {
    sendBtn.disabled = loading;
    sendBtn.textContent = loading ? '⏳ En cours...' : '➤ Envoyer';
  }
  if (input) input.disabled = loading;
}

async function sendMessage() {
  const input = document.getElementById('jarvis-input') as HTMLTextAreaElement | null;
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  appendMessage('user', message);
  setLoading(true);

  try {
    const bridge = getJarvisBridge();
    if (!bridge) {
      appendMessage('system', 'Erreur: bridge Jarvis indisponible.');
      return;
    }
    const result = await bridge.chat(chatHistory, message);
    if (result.success && result.reply) {
      chatHistory.push({ role: 'user', content: message });
      chatHistory.push({ role: 'assistant', content: result.reply });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      appendMessage('assistant', result.reply);
    } else {
      appendMessage('system', result.error || 'Erreur inconnue.');
    }
  } catch (err: any) {
    appendMessage('system', 'Erreur inattendue: ' + (err?.message || String(err)));
  } finally {
    setLoading(false);
  }
}

async function performSearch() {
  const searchInput = document.getElementById('jarvis-search-input') as HTMLInputElement | null;
  if (!searchInput) return;

  const query = searchInput.value.trim();
  if (!query) return;

  searchInput.value = '';
  appendMessage('user', `🔍 Recherche: ${query}`);
  setLoading(true);

  try {
    const bridge = getJarvisBridge();
    if (!bridge) {
      appendMessage('system', 'Erreur: bridge Jarvis indisponible.');
      return;
    }
    const result = await bridge.search(query);
    if (result.success && result.results) {
      appendMessage('assistant', `Résultats pour "${query}":\n\n${result.results}`);
    } else {
      appendMessage('system', result.error || 'Aucun résultat trouvé.');
    }
  } catch (err: any) {
    appendMessage('system', 'Erreur de recherche: ' + (err?.message || String(err)));
  } finally {
    setLoading(false);
  }
}

function renderRulesList() {
  const container = document.getElementById('jarvis-rules-list');
  if (!container) return;
  container.innerHTML = '';
  if (jarvisRules.length === 0) {
    container.innerHTML = '<p class="jarvis-no-rules">Aucune règle définie.</p>';
    return;
  }
  jarvisRules.forEach((rule, index) => {
    const ruleEl = document.createElement('div');
    ruleEl.className = 'jarvis-rule-item';
    ruleEl.innerHTML = `
      <span class="jarvis-rule-text">${escapeHtml(rule)}</span>
      <button class="btn btn-danger btn-sm jarvis-rule-delete" data-index="${index}">✗</button>
    `;
    container.appendChild(ruleEl);
  });

  container.querySelectorAll('.jarvis-rule-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt((btn as HTMLElement).dataset.index || '0', 10);
      jarvisRules.splice(idx, 1);
      renderRulesList();
    });
  });
}

async function loadSettings() {
  try {
    const bridge = getJarvisBridge();
    if (!bridge) return;
    const config = await bridge.getConfig();
    jarvisRules = config.rules || [];
    renderRulesList();

    const statusEl = document.getElementById('jarvis-api-key-status');
    if (statusEl) {
      statusEl.textContent = config.hasApiKey ? '✅ Clé API configurée' : '❌ Clé API non configurée';
      statusEl.className = config.hasApiKey ? 'jarvis-key-ok' : 'jarvis-key-missing';
    }
  } catch (err: any) {
    console.error('Erreur chargement config Jarvis:', err);
  }
}

async function saveSettings() {
  const apiKeyInput = document.getElementById('jarvis-api-key') as HTMLInputElement | null;
  const settingsMsg = document.getElementById('jarvis-settings-msg');

  const apiKeyValue = apiKeyInput?.value.trim() || '';
  const apiKey = apiKeyValue.length > 0 ? apiKeyValue : null;

  try {
    const bridge = getJarvisBridge();
    if (!bridge) return;
    const result = await bridge.saveConfig(apiKey, jarvisRules);
    if (result.success) {
      if (apiKeyInput) apiKeyInput.value = '';
      if (settingsMsg) {
        settingsMsg.textContent = '✅ Paramètres sauvegardés.';
        settingsMsg.className = 'jarvis-settings-ok';
        setTimeout(() => { if (settingsMsg) settingsMsg.textContent = ''; }, 3000);
      }
      await loadSettings();
    } else {
      if (settingsMsg) {
        settingsMsg.textContent = '❌ ' + (result.error || 'Erreur inconnue.');
        settingsMsg.className = 'jarvis-settings-error';
      }
    }
  } catch (err: any) {
    if (settingsMsg) {
      settingsMsg.textContent = '❌ Erreur: ' + (err?.message || String(err));
      settingsMsg.className = 'jarvis-settings-error';
    }
  }
}

function togglePanel(panelId: string) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const isHidden = panel.classList.contains('d-none');
  document.getElementById('jarvis-settings-panel')?.classList.add('d-none');
  document.getElementById('jarvis-search-panel')?.classList.add('d-none');
  if (isHidden) panel.classList.remove('d-none');
}

export function initJarvisModule() {
  const sendBtn = document.getElementById('jarvis-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  const inputEl = document.getElementById('jarvis-input') as HTMLTextAreaElement | null;
  if (inputEl) {
    inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  const settingsBtn = document.getElementById('jarvis-settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      togglePanel('jarvis-settings-panel');
      loadSettings();
    });
  }

  const settingsCancelBtn = document.getElementById('jarvis-settings-cancel');
  if (settingsCancelBtn) {
    settingsCancelBtn.addEventListener('click', () => {
      document.getElementById('jarvis-settings-panel')?.classList.add('d-none');
    });
  }

  const settingsSaveBtn = document.getElementById('jarvis-settings-save');
  if (settingsSaveBtn) {
    settingsSaveBtn.addEventListener('click', saveSettings);
  }

  const addRuleBtn = document.getElementById('jarvis-add-rule');
  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', () => {
      const newRuleInput = document.getElementById('jarvis-new-rule') as HTMLInputElement | null;
      if (!newRuleInput) return;
      const rule = newRuleInput.value.trim();
      const rulesSet = new Set(jarvisRules);
      if (rule && !rulesSet.has(rule)) {
        jarvisRules.push(rule);
        renderRulesList();
        newRuleInput.value = '';
      }
    });
  }

  const newRuleInput = document.getElementById('jarvis-new-rule') as HTMLInputElement | null;
  if (newRuleInput) {
    newRuleInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('jarvis-add-rule')?.click();
      }
    });
  }

  const searchToggleBtn = document.getElementById('jarvis-search-btn');
  if (searchToggleBtn) {
    searchToggleBtn.addEventListener('click', () => {
      togglePanel('jarvis-search-panel');
    });
  }

  const searchBtn = document.getElementById('jarvis-do-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  const searchInput = document.getElementById('jarvis-search-input') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }

  const clearBtn = document.getElementById('jarvis-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      chatHistory = [];
      const messagesEl = document.getElementById('jarvis-messages');
      if (messagesEl) messagesEl.innerHTML = '';
    });
  }
}

export async function loadJarvisView() {
  await loadSettings();
}
