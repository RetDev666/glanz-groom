const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
let authToken = process.env.TURSO_AUTH_TOKEN;
if (!authToken && rawUrl && rawUrl.includes('authToken=')) {
  authToken = decodeURIComponent(rawUrl.split('authToken=')[1].split('&')[0]);
}

if (!rawUrl || !authToken) {
  console.error('No TURSO_DATABASE_URL or authToken available');
  process.exit(1);
}

// Convert libsql:// host to https://.../v2/pipeline
let host = rawUrl.split('?')[0].replace(/^libsql:\/\//, '').replace(/^https?:\/\//, '');
const pipelineUrl = `https://${host}/v2/pipeline`;

async function executeSql(sql) {
  const body = {
    requests: [
      { type: "execute", stmt: { sql } },
      { type: "close" }
    ]
  };
  const res = await fetch(pipelineUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + authToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function main() {
  console.log("Connecting to Turso via Pipeline:", pipelineUrl);

  const columns = [
    { name: 'manageToken', type: 'TEXT' },
    { name: 'clientConfirmationStatus', type: "TEXT DEFAULT 'pending'" },
    { name: 'clientConfirmedAt', type: 'DATETIME' },
    { name: 'lateCancelAttemptAt', type: 'DATETIME' },
    { name: 'cancellationReason', type: 'TEXT' }
  ];

  for (const col of columns) {
    const alterSql = `ALTER TABLE "Appointment" ADD COLUMN "${col.name}" ${col.type};`;
    const res = await executeSql(alterSql);
    const err = res.results?.[0]?.error?.message;
    if (err) {
      if (err.includes('duplicate column') || err.includes('already exists')) {
        console.log(`Column ${col.name} already exists.`);
      } else {
        console.warn(`Alter error for ${col.name}:`, err);
      }
    } else {
      console.log(`✅ Column ${col.name} added successfully.`);
    }
  }

  // Create unique index on manageToken
  const indexRes = await executeSql(`CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_manageToken_key" ON "Appointment"("manageToken");`);
  console.log("Index check:", indexRes.results?.[0]?.error?.message || "OK");

  // Populate manageToken for existing rows if null
  const selectRes = await executeSql(`SELECT id, manageToken FROM "Appointment" WHERE manageToken IS NULL;`);
  const rows = selectRes.results?.[0]?.response?.result?.rows || [];
  console.log(`Found ${rows.length} appointments without manageToken. Generating tokens...`);

  for (const row of rows) {
    const id = row[0]?.value;
    const token = crypto.randomBytes(24).toString('hex');
    await executeSql(`UPDATE "Appointment" SET manageToken = '${token}' WHERE id = ${id};`);
    console.log(`Generated token for appointment #${id}`);
  }

  console.log("🎉 All manage columns and tokens prepared successfully!");
}

main().catch(console.error);
