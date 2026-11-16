import { spawn } from 'child_process';
import { SignJWT } from 'jose';

const JWT_SECRET = 'super-secret-jwt-key-pes-dbms-level3-2026-jurispredict';
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function makeToken(userId, email, name, role) {
  return await new SignJWT({ userId, email, name, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secretKey);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- Starting Next.js test server on port 3008 ---');
  const server = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', '3008'], {
    stdio: 'pipe',
    env: { ...process.env, PORT: '3008', JWT_SECRET },
  });

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const ping = await fetch('http://127.0.0.1:3008/api/admin/users');
      if (ping.status < 500) {
        ready = true;
        break;
      }
    } catch (e) {}
  }

  if (!ready) {
    console.error('Server failed to start on 3008');
    server.kill();
    process.exit(1);
  }

  const adminToken = await makeToken(1, 'admin@jurispredict.gov.in', 'System Admin', 'ADMIN');

  console.log('\n--- Step 1: GET /api/admin/users ---');
  const r1 = await fetch('http://127.0.0.1:3008/api/admin/users', {
    headers: { Cookie: `juris_session=${adminToken}` },
  });
  const data1 = await r1.json();
  console.log('Found users:', data1.users.map((u) => `${u.name} (#${u.user_id}): ${u.role_name}`));

  console.log('\n--- Step 2: PATCH /api/admin/users (Change Ramesh Babu from CLERK to LAWYER) ---');
  const r2 = await fetch('http://127.0.0.1:3008/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: `juris_session=${adminToken}` },
    body: JSON.stringify({ userId: 6, newRole: 'LAWYER' }),
  });
  const data2 = await r2.json();
  console.log('Update result:', data2.message);

  console.log('\n--- Step 3: DELETE /api/admin/users?userId=5 (Delete Adv. Shriranjini Kumar) ---');
  const r3 = await fetch('http://127.0.0.1:3008/api/admin/users?userId=5', {
    method: 'DELETE',
    headers: { Cookie: `juris_session=${adminToken}` },
  });
  const data3 = await r3.json();
  console.log('Delete result:', data3.message);

  console.log('\n--- Step 4: Verify Updated Users List ---');
  const r4 = await fetch('http://127.0.0.1:3008/api/admin/users', {
    headers: { Cookie: `juris_session=${adminToken}` },
  });
  const data4 = await r4.json();
  console.log('Remaining users:', data4.users.map((u) => `${u.name} (#${u.user_id}): ${u.role_name}`));

  server.kill();

  const user6 = data4.users.find((u) => u.user_id === 6);
  const user5 = data4.users.find((u) => u.user_id === 5);

  if (user6?.role_name === 'LAWYER' && !user5) {
    console.log('\n>>> SUCCESS: ROLE UPDATE AND ACCOUNT DELETION FULLY WORKING IN API AND STORE! <<<');
    process.exit(0);
  } else {
    console.error('Test failed');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
