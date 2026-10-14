const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://planz-groom-retdev666.aws-eu-west-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function main() {
  await client.execute({
    sql: "UPDATE User SET role = 'admin' WHERE email = 'helena-glanzgroom@gmail.com'",
    args: []
  });
  const users = await client.execute('SELECT id, email, name, role FROM User;');
  console.log('USERS:', users.rows);
}

main().catch(console.error);
