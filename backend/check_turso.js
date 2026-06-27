const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://planz-groom-retdev666.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MTM3ODExNjIsImlhdCI6MTc4MjI0NTE2MiwiaWQiOiIwMTllZjVmMy0yMzAxLTdlMTMtYTA5Yy1hZTY4ODE0OGNmNmIiLCJyaWQiOiI1MzEzZmM1NC03NzRhLTQxM2QtODljNy1jNGQxNDJkNzBiZWQifQ.N3-LLiMhvL0_0hCvUeQexIZtjb16Y_q70FPbxlyj2HFk5Lg3iJO108-eDyNNTZW0Dd2lZgvxJUz7s9y-u4wMBg'
});

async function main() {
  try {
    const res = await client.execute(`SELECT name, sql FROM sqlite_master WHERE type='table';`);
    for (const row of res.rows) {
      console.log('--- TABLE:', row.name, '---');
      console.log(row.sql);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
