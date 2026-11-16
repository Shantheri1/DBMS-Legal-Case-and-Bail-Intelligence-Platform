import { spawn } from 'child_process';
import { SignJWT } from 'jose';
import fs from 'fs';
import path from 'path';

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
  console.log('--- Starting Next.js test server on port 3006 ---');
  const server = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', '3006'], {
    stdio: 'pipe',
    env: { ...process.env, PORT: '3006', JWT_SECRET },
  });

  server.stdout.on('data', (d) => process.stdout.write('[Next.js]: ' + d.toString()));
  server.stderr.on('data', (d) => process.stderr.write('[Next.js Err]: ' + d.toString()));

  // Wait for server ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const ping = await fetch('http://127.0.0.1:3006/');
      if (ping.status < 500) {
        ready = true;
        break;
      }
    } catch (e) {
      // waiting
    }
  }

  if (!ready) {
    console.error('Server failed to start on port 3006');
    server.kill();
    process.exit(1);
  }

  console.log('\n Server is READY on http://127.0.0.1:3006');

  const judgeToken = await makeToken(2, 'judge.sharma@karnatakacourts.gov.in', 'Hon. Justice Rajesh Sharma', 'JUDGE');
  const lawyerToken = await makeToken(4, 'shantheni.adv@barcouncil.org', 'Adv. Shantheni Shenoy', 'LAWYER');

  console.log('\n--- Step 1: Initial State Check ---');
  const initialPetitionsRes = await fetch('http://127.0.0.1:3006/api/bail/petitions', {
    headers: { Cookie: `juris_session=${lawyerToken}` },
  });
  const initialPetitions = await initialPetitionsRes.json();
  console.log('Initial pending count:', initialPetitions.counts.pending);

  console.log('\n--- Step 2: Test GRANT BAIL (Petition #1) ---');
  const grantRes = await fetch('http://127.0.0.1:3006/api/bail/adjudicate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `juris_session=${judgeToken}` },
    body: JSON.stringify({
      bailId: 1,
      decision: 'GRANTED',
      reasoning: 'Charge sheet complete, accused roots in Bengaluru, bail granted under Satender Kumar Antil v. CBI.',
      suretyAmount: 50000,
    }),
  });
  const grantData = await grantRes.json();
  console.log('Grant result:', grantData.message, '-> Case status:', grantData.caseStatusSynchronized);

  console.log('\n--- Step 3: Test REJECT BAIL (Petition #2) ---');
  const rejectRes = await fetch('http://127.0.0.1:3006/api/bail/adjudicate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `juris_session=${judgeToken}` },
    body: JSON.stringify({
      bailId: 2,
      decision: 'REJECTED',
      reasoning: 'Commercial economic offence with substantial escrow diversion. Flight risk requires continued judicial remand.',
      suretyAmount: 0,
    }),
  });
  const rejectData = await rejectRes.json();
  console.log('Reject result:', rejectData.message, '-> Case status:', rejectData.caseStatusSynchronized);

  console.log('\n--- Step 4: Verify Case Registry reflection from Lawyer perspective ---');
  const casesRes = await fetch('http://127.0.0.1:3006/api/cases', {
    headers: { Cookie: `juris_session=${lawyerToken}` },
  });
  const casesData = await casesRes.json();
  const case1 = casesData.cases.find((c) => c.caseNumber === 'CNR-KA-BLR-2026-00101');
  const case2 = casesData.cases.find((c) => c.caseNumber === 'CNR-KA-BLR-2026-00204');
  console.log('Case 1 (Vikram Malhotra):', case1?.status, 'Surety:', case1?.lastAdjudication?.suretyAmount);
  console.log('Case 2 (Priya Deshmukh):', case2?.status, 'Decision:', case2?.lastAdjudication?.decision);

  console.log('\n--- Step 5: Test CREATE (Lawyer files new Bail Petition for Case 3) ---');
  const fileBailRes = await fetch('http://127.0.0.1:3006/api/bail/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `juris_session=${lawyerToken}` },
    body: JSON.stringify({
      caseNumber: 'CNR-KA-BLR-2026-00318',
      bailType: 'REGULAR',
      grounds: 'Accused has been falsely implicated in simple hurt affray. Ready to cooperate with magistrate investigation.',
      custodyDays: 10,
      suretyOffered: 'Solvent surety available',
      undertakingPassport: true,
    }),
  });
  const fileBailData = await fileBailRes.json();
  console.log('Filing result:', fileBailData.message, 'Docket #:', fileBailData.bailId);

  const updatedPetitionsRes = await fetch('http://127.0.0.1:3006/api/bail/petitions', {
    headers: { Cookie: `juris_session=${judgeToken}` },
  });
  const updatedPetitions = await updatedPetitionsRes.json();
  console.log('Updated counts:', updatedPetitions.counts);

  server.kill();

  const success = 
    case1?.status === 'BAIL_GRANTED' &&
    case2?.status === 'BAIL_REJECTED' &&
    fileBailData.success === true &&
    updatedPetitions.counts.pending === 1;

  if (success) {
    console.log('\n>>> SUCCESS: ALL CRUD, GRANT, REJECT, AND DYNAMIC SYNC OPERATIONS ARE 100% WORKING! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> TEST FAILED! <<<');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
