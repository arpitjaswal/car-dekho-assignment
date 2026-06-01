import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = join(__dirname, '../data/history.json');

function read() {
  if (!existsSync(HISTORY_PATH)) return [];
  try {
    return JSON.parse(readFileSync(HISTORY_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function write(history) {
  writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

export function saveSearch(answers, recommendations) {
  const history = read();
  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    answers,
    recommendations,
  };
  history.unshift(entry);
  write(history.slice(0, 50)); // keep last 50 searches
  return entry;
}

export function getHistory() {
  return read();
}
