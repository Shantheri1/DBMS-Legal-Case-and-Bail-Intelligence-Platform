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

// In-memory registered user directory (persists across requests during server runtime)
export const registeredUsersDirectory: UserRow[] = [...SEED_USERS];

export function findUserByEmail(email: string): UserRow | undefined {
  const normalized = email.trim().toLowerCase();
  return registeredUsersDirectory.find((u) => u.email.toLowerCase() === normalized);
}

export function registerNewUserInMemory(user: UserRow): void {
  const existingIdx = registeredUsersDirectory.findIndex(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    registeredUsersDirectory[existingIdx] = user;
  } else {
    registeredUsersDirectory.push(user);
  }
}
