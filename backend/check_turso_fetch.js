const token = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MTM3ODExNjIsImlhdCI6MTc4MjI0NTE2MiwiaWQiOiIwMTllZjVmMy0yMzAxLTdlMTMtYTA5Yy1hZTY4ODE0OGNmNmIiLCJyaWQiOiI1MzEzZmM1NC03NzRhLTQxM2QtODljNy1jNGQxNDJkNzBiZWQifQ.N3-LLiMhvL0_0hCvUeQexIZtjb16Y_q70FPbxlyj2HFk5Lg3iJO108-eDyNNTZW0Dd2lZgvxJUz7s9y-u4wMBg';
const url = 'https://planz-groom-retdev666.aws-eu-west-1.turso.io/v2/pipeline';

async function main() {
  const req = {
    requests: [
      { type: "execute", stmt: { sql: "SELECT name, sql FROM sqlite_master WHERE type='table';" } },
      { type: "close" }
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
