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
  console.log('--- Starting Next.js test server on port 3005 ---');
  const server = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', '3005'], {
    stdio: 'pipe',
    env: { ...process.env, PORT: '3005', JWT_SECRET },
  });

  server.stdout.on('data', (d) => process.stdout.write('[Next.js]: ' + d.toString()));
  server.stderr.on('data', (d) => process.stderr.write('[Next.js Err]: ' + d.toString()));

  // Wait for server ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const ping = await fetch('http://127.0.0.1:3005/');
      if (ping.status < 500) {
        ready = true;
        break;
      }
    } catch (e) {
      // not yet up
    }
  }

  if (!ready) {
    console.error('Server failed to start on port 3005');
    server.kill();
    process.exit(1);
  }

  console.log('\n Server is READY on http://localhost:3005');

  const judgeToken = await makeToken(2, 'judge.sharma@karnatakacourts.gov.in', 'Hon. Justice Rajesh Sharma', 'JUDGE');
  const lawyerToken = await makeToken(4, 'shantheni.adv@barcouncil.org', 'Adv. Shantheni Shenoy', 'LAWYER');

  console.log('\n--- Step 1: Check initial cases from Lawyer perspective ---');
  const initialCasesRes = await fetch('http://127.0.0.1:3005/api/cases', {
    headers: { Cookie: `juris_session=${lawyerToken}` },
  });
  const initialCases = await initialCasesRes.json();
  const case1Before = initialCases.cases.find((c) => c.caseNumber === 'CNR-KA-BLR-2026-00101');
  console.log('Case CNR-KA-BLR-2026-00101 status before ruling:', case1Before?.status);

  console.log('\n--- Step 2: Judge Adjudicates Bail (GRANTS bail with 50,000 surety) ---');
  const adjRes = await fetch('http://127.0.0.1:3005/api/bail/adjudicate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `juris_session=${judgeToken}`,
    },
    body: JSON.stringify({
      bailId: 1,
      decision: 'GRANTED',
      reasoning: 'Charge sheet complete, accused roots in Bengaluru, bail granted under Satender Kumar Antil v. CBI.',
      suretyAmount: 50000,
    }),
  });
  const adjData = await adjRes.json();
  console.log('Adjudication response message:', adjData.message);
  console.log('Case status synchronized to:', adjData.caseStatusSynchronized);
  console.log('Procedure executed:', adjData.procedureExecuted);
  console.log('Trigger executed:', adjData.triggerExecuted);

  console.log('\n--- Step 3: Lawyer logs in & inspects Case Registry ---');
  const afterCasesRes = await fetch('http://127.0.0.1:3005/api/cases', {
    headers: { Cookie: `juris_session=${lawyerToken}` },
  });
  const afterCases = await afterCasesRes.json();
  const case1After = afterCases.cases.find((c) => c.caseNumber === 'CNR-KA-BLR-2026-00101');
  console.log('Case CNR-KA-BLR-2026-00101 status after Judge ruling:', case1After?.status);
  console.log('Last adjudication in case:', case1After?.lastAdjudication);

  console.log('\n--- Step 4: Lawyer inspects Petitions Docket ---');
  const petitionsRes = await fetch('http://127.0.0.1:3005/api/bail/petitions', {
    headers: { Cookie: `juris_session=${lawyerToken}` },
  });
  const petitionsData = await petitionsRes.json();
  console.log('Counts:', petitionsData.counts);
  const petition1 = petitionsData.all.find((p) => p.bailId === 1);
  console.log('Petition 1 Status:', petition1?.status);
  console.log('Petition 1 Decision:', petition1?.decision);
  console.log('Petition 1 Surety:', petition1?.suretyAmount);

  server.kill();

  if (case1After?.status === 'BAIL_GRANTED' && petition1?.status === 'GRANTED') {
    console.log('\n>>> ALL ADJUDICATION PERSISTENCE AND CROSS-ROLE REFLECTION TESTS PASSED SUCCESSFULLY! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> TEST FAILED: Status did not reflect properly! <<<');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
