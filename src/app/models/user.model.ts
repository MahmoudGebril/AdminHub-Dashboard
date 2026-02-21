export type UserRole = 'admin' | 'editor';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}
