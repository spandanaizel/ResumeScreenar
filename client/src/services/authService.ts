import api from './api';
import type { AuthResponse, User, UserRole } from '../types';

interface MeResponseWrapped {
  user: User;
}

// Backend may return the user bare or wrapped in { user }. Handle both defensively.
function unwrapUser(data: User | MeResponseWrapped): User {
  if (data && typeof data === 'object' && 'user' in data) {
    return (data as MeResponseWrapped).user;
  }
  return data as User;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User | MeResponseWrapped>('/auth/me');
  return unwrapUser(data);
}
