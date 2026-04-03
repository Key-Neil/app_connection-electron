import { app, safeStorage } from 'electron';
import path from 'path';
import fs from 'fs';
import https from 'https';
import type { IncomingMessage, RequestOptions } from 'http';

const CONFIG_FILE = path.join(app.getPath('userData'), 'jarvis-config.json');
const MAX_INPUT_LENGTH = 4000;
const MAX_RULES_LENGTH = 2000;
const MAX_RULES_COUNT = 20;

interface JarvisConfig {
  encryptedApiKey?: string;
  rules: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function loadConfig(): JarvisConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          encryptedApiKey: typeof parsed.encryptedApiKey === 'string' ? parsed.encryptedApiKey : undefined,
          rules: Array.isArray(parsed.rules) ? parsed.rules.filter((r: unknown) => typeof r === 'string') : [],
        };
      }
    }
  } catch {
    // Return default config on any error
  }
  return { rules: [] };
}

function saveConfig(config: JarvisConfig): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function getJarvisConfig(): { hasApiKey: boolean; rules: string[] } {
  const config = loadConfig();
  return {
    hasApiKey: !!config.encryptedApiKey,
    rules: config.rules,
  };
}

export function saveJarvisConfig(apiKey: string | null, rules: string[]): { success: boolean; error?: string } {
  try {
    if (!Array.isArray(rules)) {
      return { success: false, error: 'Format des règles invalide.' };
    }
    const sanitizedRules = rules
      .map((r: unknown) => String(r).trim())
      .filter((r) => r.length > 0)
      .slice(0, MAX_RULES_COUNT);

    const rulesText = sanitizedRules.join('\n');
    if (rulesText.length > MAX_RULES_LENGTH) {
      return { success: false, error: 'Les règles sont trop longues (max 2000 caractères au total).' };
    }

    const config = loadConfig();

    if (apiKey !== null) {
      if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return { success: false, error: 'Clé API invalide.' };
      }
      const trimmedKey = apiKey.trim();
      if (trimmedKey.length > 300) {
        return { success: false, error: 'Clé API trop longue.' };
      }
      if (safeStorage.isEncryptionAvailable()) {
        config.encryptedApiKey = safeStorage.encryptString(trimmedKey).toString('base64');
      } else {
        config.encryptedApiKey = Buffer.from(trimmedKey).toString('base64');
      }
    }

    config.rules = sanitizedRules;
    saveConfig(config);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur lors de la sauvegarde.' };
  }
}

function getApiKey(): string | null {
  const config = loadConfig();
  if (!config.encryptedApiKey) return null;
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(config.encryptedApiKey, 'base64'));
    }
    return Buffer.from(config.encryptedApiKey, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

function httpsPost(url: string, headers: Record<string, string>, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Délai d\'attente dépassé'));
    });
    req.write(body);
    req.end();
  });
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Keynect-Jarvis/1.0',
        'Accept': 'application/json',
      },
    };
    const req = https.get(options as RequestOptions, (res: IncomingMessage) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Délai d\'attente dépassé'));
    });
  });
}

export async function jarvisSearch(query: string): Promise<{ success: boolean; results?: string; error?: string }> {
  if (!query || typeof query !== 'string') {
    return { success: false, error: 'Requête invalide.' };
  }
  const sanitized = query.trim().slice(0, 500);
  if (!sanitized) {
    return { success: false, error: 'Requête vide.' };
  }

  try {
    const encodedQuery = encodeURIComponent(sanitized);
    const data = await httpsGet(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`
    );
    const json = JSON.parse(data);

    const results: string[] = [];
    if (json.AbstractText) results.push(json.AbstractText);
    if (json.Answer) results.push(`Réponse directe: ${json.Answer}`);
    if (Array.isArray(json.RelatedTopics)) {
      for (const topic of json.RelatedTopics.slice(0, 5)) {
        if (topic && typeof topic.Text === 'string' && topic.Text) {
          results.push(topic.Text);
        }
      }
    }

    if (results.length === 0) {
      return { success: true, results: 'Aucun résultat trouvé pour cette recherche.' };
    }
    return { success: true, results: results.join('\n\n') };
  } catch (err: any) {
    return { success: false, error: 'Erreur lors de la recherche: ' + (err?.message || 'inconnue') };
  }
}

export async function jarvisChat(
  history: ChatMessage[],
  userMessage: string
): Promise<{ success: boolean; reply?: string; error?: string }> {
  if (!userMessage || typeof userMessage !== 'string') {
    return { success: false, error: 'Message invalide.' };
  }
  const sanitizedMessage = userMessage.trim().slice(0, MAX_INPUT_LENGTH);
  if (!sanitizedMessage) {
    return { success: false, error: 'Message vide.' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'Clé API non configurée. Veuillez configurer votre clé API dans les paramètres de Jarvis (⚙️).',
    };
  }

  const config = loadConfig();
  const rulesText =
    config.rules && config.rules.length > 0
      ? '\n\nRègles à respecter:\n' + config.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')
      : '';

  const systemPrompt =
    `Tu es Jarvis, un assistant IA intelligent, utile et sécurisé intégré dans l'application Keynect. ` +
    `Tu réponds principalement en français. ` +
    `Tu peux aider avec des recherches, des analyses, des explications, de la rédaction et diverses tâches intellectuelles. ` +
    `Tu respectes strictement les règles de l'utilisateur. ` +
    `Tu ne génères jamais de contenu dangereux, illégal ou nuisible.` +
    rulesText;

  const validatedHistory: ChatMessage[] = [];
  if (Array.isArray(history)) {
    for (const msg of history.slice(-10)) {
      if (
        msg &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
      ) {
        validatedHistory.push({ role: msg.role, content: msg.content.slice(0, MAX_INPUT_LENGTH) });
      }
    }
  }

  const requestMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...validatedHistory,
    { role: 'user', content: sanitizedMessage },
  ];

  try {
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: requestMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const responseStr = await httpsPost(
      'https://api.openai.com/v1/chat/completions',
      {
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'Keynect-Jarvis/1.0',
      },
      body
    );

    const response = JSON.parse(responseStr);
    if (response.error) {
      return { success: false, error: response.error.message || 'Erreur API.' };
    }

    const reply = response.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return { success: false, error: 'Réponse vide reçue de l\'IA.' };
    }
    return { success: true, reply: reply.trim() };
  } catch (err: any) {
    return { success: false, error: 'Erreur de communication avec l\'IA: ' + (err?.message || 'inconnue') };
  }
}
