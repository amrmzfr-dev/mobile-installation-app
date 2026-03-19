import * as SecureStore from 'expo-secure-store';
import { apiFetch } from './api';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  installerId: string;
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<{ user: AuthUser }> {
  return apiFetch('/auth/me');
}

export async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync('auth_token');
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}
