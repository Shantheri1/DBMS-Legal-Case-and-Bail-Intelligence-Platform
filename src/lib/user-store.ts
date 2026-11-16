import fs from 'fs';
import path from 'path';

export interface UserRow {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  status: string;
  role_name: string;
  phone?: string;
  court_id?: number;
}

// Initial baseline seed users
export const SEED_USERS: UserRow[] = [
  {
    user_id: 1,
    name: 'System Admin',
    email: 'admin@jurispredict.gov.in',
    password_hash: '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', // Password@123
    status: 'ACTIVE',
    role_name: 'ADMIN',
  },
  {
    user_id: 2,
    name: 'Hon. Justice Rajesh Sharma',
    email: 'judge.sharma@karnatakacourts.gov.in',
    password_hash: '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', // Password@123
    status: 'ACTIVE',
    role_name: 'JUDGE',
    court_id: 1,
  },
  {
    user_id: 3,
    name: 'Hon. Justice Anuradha Banerjee',
    email: 'judge.banerjee@karnatakacourts.gov.in',
    password_hash: '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', // Password@123
    status: 'ACTIVE',
    role_name: 'JUDGE',
    court_id: 2,
  },
  {
    user_id: 4,
    name: 'Adv. Shantheni Shenoy',
    email: 'shantheni.adv@barcouncil.org',
    password_hash: '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', // Password@123
    status: 'ACTIVE',
    role_name: 'LAWYER',
  },
  {
    user_id: 5,
    name: 'Adv. Shriranjini Kumar',
    email: 'shriranjini.adv@barcouncil.org',
    password_hash: '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', // Password@123
    status: 'ACTIVE',
    role_name: 'LAWYER',
  },
  {
    user_id: 6,
    name: 'Ramesh Babu (Registrar)',
    email: 'registry.blr@karnatakacourts.gov.in',
    password_hash: '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', // Password@123
    status: 'ACTIVE',
    role_name: 'CLERK',
  },
];

const USER_STORE_PATH = path.join(process.cwd(), 'database', 'user_store_state.json');

function loadUsersFromDisk(): UserRow[] {
  try {
    if (fs.existsSync(USER_STORE_PATH)) {
      const data = fs.readFileSync(USER_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load user store from disk, using seed:', err);
  }
  return [...SEED_USERS];
}

function saveUsersToDisk(users: UserRow[]): void {
  try {
    const dir = path.dirname(USER_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USER_STORE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save user store to disk:', err);
  }
}

// In-memory registered user directory initialized from disk or defaults
export let registeredUsersDirectory: UserRow[] = loadUsersFromDisk();

export function findUserByEmail(email: string): UserRow | undefined {
  registeredUsersDirectory = loadUsersFromDisk();
  const normalized = email.trim().toLowerCase();
  return registeredUsersDirectory.find((u) => u.email.toLowerCase() === normalized);
}

export function registerNewUserInMemory(user: UserRow): void {
  registeredUsersDirectory = loadUsersFromDisk();
  const existingIdx = registeredUsersDirectory.findIndex(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    registeredUsersDirectory[existingIdx] = user;
  } else {
    registeredUsersDirectory.push(user);
  }
  saveUsersToDisk(registeredUsersDirectory);
}
