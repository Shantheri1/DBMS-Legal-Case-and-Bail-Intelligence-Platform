import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

console.log('=== RUNNING PHASE 1 AUTHENTICATION UNIT TESTS ===\n');

// 1. Test Password Hashing and Verification
console.log('TEST 1: Password Hashing & Verification');
const plainPass = 'JudicialSecret2026!';
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(plainPass, salt);

console.log('Generated hash format:', hash.slice(0, 15) + '...');
const matchCorrect = await bcrypt.compare(plainPass, hash);
const matchWrong = await bcrypt.compare('WrongPassword123', hash);

console.log('Match with correct password:', matchCorrect);
console.log('Match with incorrect password:', matchWrong);

if (!matchCorrect || matchWrong) {
  throw new Error('TEST 1 FAILED: Password verification logic incorrect');
}
console.log('✓ TEST 1 PASSED: bcryptjs hashing and comparison verified.\n');

// 2. Test JWT Signing and Verification with jose
console.log('TEST 2: JWT Signing & Verification (jose HS256)');
const testSecret = 'super-secret-jwt-key-pes-dbms-level3-2026-test';
const secretKey = new TextEncoder().encode(testSecret);

const userPayload = {
  userId: 2,
  email: 'judge.sharma@karnatakacourts.gov.in',
  name: 'Hon. Justice Rajesh Sharma',
  role: 'JUDGE',
};

const token = await new SignJWT(userPayload)
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setIssuedAt()
  .setExpirationTime('8h')
  .sign(secretKey);

console.log('Signed JWT length:', token.length);
console.log('Signed JWT sample:', token.slice(0, 25) + '...' + token.slice(-10));

const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });

console.log('Verified payload claims:');
console.log(' - userId:', payload.userId, typeof payload.userId);
console.log(' - email:', payload.email);
console.log(' - name:', payload.name);
console.log(' - role:', payload.role);

if (
  payload.userId !== userPayload.userId ||
  payload.email !== userPayload.email ||
  payload.role !== userPayload.role
) {
  throw new Error('TEST 2 FAILED: Claims mismatch');
}
console.log('✓ TEST 2 PASSED: JWT creation and verification succeeded with all claims intact.\n');

// 3. Test Tampered Token Rejection
console.log('TEST 3: Tampered Token Rejection');
const tamperedToken = token.slice(0, -5) + 'abcde';
let tamperedCaught = false;
try {
  await jwtVerify(tamperedToken, secretKey, { algorithms: ['HS256'] });
} catch (e) {
  tamperedCaught = true;
  console.log('Tampered token correctly rejected with error:', e.code || e.message);
}

if (!tamperedCaught) {
  throw new Error('TEST 3 FAILED: Tampered token was unexpectedly accepted');
}
console.log('✓ TEST 3 PASSED: Tampered token rejected cleanly.\n');

// 4. Test Wrong Secret Rejection
console.log('TEST 4: Wrong Secret Key Rejection');
const wrongSecretKey = new TextEncoder().encode('another-completely-different-secret-key-123');
let wrongSecretCaught = false;
try {
  await jwtVerify(token, wrongSecretKey, { algorithms: ['HS256'] });
} catch (e) {
  wrongSecretCaught = true;
  console.log('Signature mismatch correctly detected:', e.code || e.message);
}

if (!wrongSecretCaught) {
  throw new Error('TEST 4 FAILED: Token verified with incorrect secret key');
}
console.log('✓ TEST 4 PASSED: Token verification strictly enforces JWT secret key.\n');

console.log('=== ALL PHASE 1 AUTHENTICATION UNIT TESTS PASSED ===');
