import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://app.czeros.tech/api';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('auth_token');
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const url = `${BASE_URL}${path}`;
  console.log('[API] →', options.method ?? 'GET', url);
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      // Force connection close to avoid SSL renegotiation issues on Android
      ...(options.body ? {} : {}),
    });
  } catch (networkErr: any) {
    console.error('[API] Network error:', networkErr?.message, networkErr);
    throw new Error(`Network error: ${networkErr?.message ?? 'Cannot reach server. Check your internet connection.'}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}
