/**
 * One-shot: add client notification columns to Appointment (Turso/SQLite).
 * Usage: node scripts/add-notify-columns.js
 */
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const p = path.join(__dirname, '..', file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv('.env.turso');
loadEnv('.env');

const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
if (!rawUrl) {
  console.error('No TURSO_DATABASE_URL / DATABASE_URL');
  process.exit(1);
}

let url = rawUrl.split('?')[0];
let authToken = process.env.TURSO_AUTH_TOKEN;
if (!authToken && rawUrl.includes('authToken=')) {
  authToken = decodeURIComponent(rawUrl.split('authToken=')[1].split('&')[0]);
}

const { createClient } = require('@libsql/client');
const client = createClient({ url, authToken });

const cols = [
  ['clientNotifyStatus', 'TEXT'],
  ['clientNotifyChannel', 'TEXT'],
  ['clientNotifyAt', 'DATETIME'],
  ['clientNotifyDetail', 'TEXT'],
];

(async () => {
  for (const [name, type] of cols) {
    try {
      await client.execute(`ALTER TABLE Appointment ADD COLUMN ${name} ${type}`);
      console.log('Added', name);
    } catch (e) {
      const m = String(e.message || e);
      if (/duplicate|already exists/i.test(m)) console.log('Exists', name);
      else console.log('Note', name, m.slice(0, 160));
    }
  }
  const r = await client.execute('PRAGMA table_info(Appointment)');
  console.log(
    'Appointment columns:',
    r.rows.map((x) => x.name).join(', ')
  );
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
