import { createAuthToken, AUTH_COOKIE_NAME } from './src/lib/auth.js';

process.env.JWT_SECRET = 'super-secret-jwt-key-pes-dbms-level3-2026-test';

console.log('=== RUNNING PHASE 2 ROUTE HANDLER TESTS ===\n');

// Import the Next.js Route Handlers
const { POST: loginHandler } = await import('./src/app/api/auth/login/route.js');
const { POST: logoutHandler } = await import('./src/app/api/auth/logout/route.js');
const { GET: meHandler } = await import('./src/app/api/auth/me/route.js');

// Helper to mock NextRequest
function mockRequest(url, method, body = null, cookies = {}) {
  const headers = new Headers();
  if (body) headers.set('content-type', 'application/json');

  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  if (cookieHeader) headers.set('cookie', cookieHeader);

  return {
    url,
    method,
    headers,
    cookies: {
      get: (name) => (cookies[name] ? { name, value: cookies[name] } : undefined),
    },
    json: async () => body,
  };
}

// TEST 1: Login validation - missing/invalid email
console.log('TEST 1: Login validation - missing/invalid email');
const reqInvalidEmail = mockRequest('http://localhost:3000/api/auth/login', 'POST', {
  email: 'notanemail',
  password: 'password123',
});
const resInvalidEmail = await loginHandler(reqInvalidEmail);
const dataInvalidEmail = await resInvalidEmail.json();
console.log('Status:', resInvalidEmail.status, 'Response:', dataInvalidEmail);
if (resInvalidEmail.status !== 400) throw new Error('TEST 1 FAILED');
console.log('✓ TEST 1 PASSED: Invalid email rejected with 400.\n');

// TEST 2: Login validation - missing password
console.log('TEST 2: Login validation - missing password');
const reqMissingPass = mockRequest('http://localhost:3000/api/auth/login', 'POST', {
  email: 'judge@court.gov.in',
  password: '',
});
const resMissingPass = await loginHandler(reqMissingPass);
const dataMissingPass = await resMissingPass.json();
console.log('Status:', resMissingPass.status, 'Response:', dataMissingPass);
if (resMissingPass.status !== 400) throw new Error('TEST 2 FAILED');
console.log('✓ TEST 2 PASSED: Missing password rejected with 400.\n');

// TEST 3: /api/auth/me without active session (unauthenticated)
console.log('TEST 3: /api/auth/me without session');
const reqMeUnauth = mockRequest('http://localhost:3000/api/auth/me', 'GET');
const resMeUnauth = await meHandler(reqMeUnauth);
const dataMeUnauth = await resMeUnauth.json();
console.log('Status:', resMeUnauth.status, 'Response:', dataMeUnauth);
if (resMeUnauth.status !== 401 || dataMeUnauth.authenticated !== false) {
  throw new Error('TEST 3 FAILED');
}
console.log('✓ TEST 3 PASSED: Unauthenticated /api/auth/me returns 401.\n');

// TEST 4: /api/auth/me with valid session cookie
console.log('TEST 4: /api/auth/me with valid session cookie');
const validToken = await createAuthToken({
  userId: 2,
  email: 'judge.sharma@karnatakacourts.gov.in',
  name: 'Hon. Justice Rajesh Sharma',
  role: 'JUDGE',
});

const reqMeAuth = mockRequest('http://localhost:3000/api/auth/me', 'GET', null, {
  [AUTH_COOKIE_NAME]: validToken,
});
const resMeAuth = await meHandler(reqMeAuth);
const dataMeAuth = await resMeAuth.json();
console.log('Status:', resMeAuth.status, 'Response:', dataMeAuth);
if (
  resMeAuth.status !== 200 ||
  dataMeAuth.authenticated !== true ||
  dataMeAuth.user.role !== 'JUDGE' ||
  dataMeAuth.user.userId !== 2
) {
  throw new Error('TEST 4 FAILED');
}
console.log('✓ TEST 4 PASSED: Authenticated /api/auth/me returns 200 with valid user claims.\n');

// TEST 5: /api/auth/logout sets expired cookie
console.log('TEST 5: /api/auth/logout session termination');
const resLogout = await logoutHandler();
const logoutCookies = resLogout.cookies.getAll();
const sessionCookie = logoutCookies.find((c) => c.name === AUTH_COOKIE_NAME);
console.log('Status:', resLogout.status, 'Cookie cleared:', sessionCookie);
if (sessionCookie.maxAge !== 0 && sessionCookie.value !== '') {
  throw new Error('TEST 5 FAILED: Cookie was not cleared');
}
console.log('✓ TEST 5 PASSED: Logout handler clears session cookie with maxAge 0.\n');

console.log('=== ALL PHASE 2 TESTS PASSED SUCCESSFULLY ===');
