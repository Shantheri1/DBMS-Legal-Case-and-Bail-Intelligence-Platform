import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'Password@123';

async function generateHashes() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  console.log(`Demo Password: "${DEMO_PASSWORD}"`);
  console.log(`Bcrypt Hash (rounds=10): ${hash}\n`);

  console.log('-- Run this SQL statement in your PostgreSQL database to set all demo accounts to Password@123:');
  console.log(`UPDATE users SET password_hash = '${hash}';`);
}

generateHashes();
