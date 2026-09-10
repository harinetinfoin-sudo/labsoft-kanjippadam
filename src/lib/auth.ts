// src/lib/auth.ts
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  password: string;
  passwordHash: string;
  role: string;
  roles: string[];
  isActive: boolean;
};

const DEV_USERS: AuthUser[] = [
  {
    id: "1",
    email: "admin@labsoft.local",
    name: "Admin",
    password: "Admin@123",
    passwordHash: "Admin@123",
    role: "Super Admin",
    roles: ["Super Admin"],
    isActive: true,
  },
  {
    id: "2",
    email: "pathologist@labsoft.local",
    name: "Doctor",
    password: "Doctor@123",
    passwordHash: "Doctor@123",
    role: "Pathologist/Doctor",
    roles: ["Pathologist/Doctor"],
    isActive: true,
  },
];

export function findUserByEmail(email: string): AuthUser | undefined {
  return DEV_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export async function createUser(input: any) {
  const newUser: AuthUser = {
    id: `dev-user-${Date.now()}`,
    email: input.email,
    name: `${input.firstName} ${input.lastName}`.trim(),
    password: input.password,
    passwordHash: input.password,
    role: input.role,
    roles: [input.role],
    isActive: true,
  };
  DEV_USERS.push(newUser);
  return newUser;
}

export function getAllUsers() {
  return DEV_USERS;
}
export async function getCurrentUserFromRequest(_request: Request): Promise<AuthUser | null> {
  return DEV_USERS[0] || null;
}

export async function getCurrentUser(_request?: Request): Promise<AuthUser | null> {
  return DEV_USERS[0] || null;
}

export function hasPermission(_roleOrUser: any, _permission?: string): boolean {
  return true;
}
