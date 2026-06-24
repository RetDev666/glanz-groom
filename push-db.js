const { createClient } = require('@libsql/client');
const fs = require('fs');

async function main() {
  const url = process.argv[2];
  const authToken = process.argv[3];

  if (!url || !authToken) {
    console.error("Usage: node push-db.js <TURSO_DATABASE_URL> <TURSO_AUTH_TOKEN>");
    process.exit(1);
  }

  console.log("Connecting to Turso...");
  const db = createClient({ url, authToken });

  console.log("Reading init_db.sql...");
  const sql = fs.readFileSync('init_db.sql', 'utf8');
  
  const seedSql = `
    INSERT INTO "User" (email, password, name, role, updatedAt)
    VALUES ('admin@glanzgroom.ua', '$2a$10$NI4n1w.WyZDhgST6v1aCC.THsfx.W1Pek72jy7D1NH9bAZypXfuoy', 'Admin', 'admin', CURRENT_TIMESTAMP);
  `;

  const statements = (sql + '\n' + seedSql)
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    try {
      await db.execute(statements[i]);
      console.log(`[${i + 1}/${statements.length}] Success`);
    } catch (e) {
      // Ignore "table already exists" or "index already exists" errors
      if (e.message.includes('already exists')) {
        console.log(`[${i + 1}/${statements.length}] Skipped (already exists)`);
      } else if (e.message.includes('UNIQUE constraint failed')) {
        console.log(`[${i + 1}/${statements.length}] Skipped (data already exists)`);
      } else {
        console.error(`[${i + 1}/${statements.length}] Error:`, e.message);
      }
    }
  }

  console.log("✅ Database initialized successfully!");
  process.exit(0);
}

main();
