import { apiFetch } from './api';

export type InstallationStatus =
  | 'pending-acceptance' | 'accepted' | 'rejected-by-installer'
  | 'pending-survey-schedule' | 'survey-scheduled' | 'survey-in-progress'
  | 'approved-for-installation' | 'on-hold' | 'cannot-proceed'
  | 'pending-installation-schedule' | 'installation-scheduled'
  | 'in-progress' | 'completed' | 'under-admin-review' | 'failed';

export async function listInstallations(status?: string) {
  const qs = status ? `?status=${status}` : '';
  return apiFetch(`/installations${qs}`);
}

export async function getInstallation(id: string) {
  return apiFetch(`/installations/${id}`);
}

export async function acceptJob(id: string) {
  return apiFetch(`/installations/${id}/accept`, { method: 'POST' });
}

export async function rejectJob(id: string) {
  return apiFetch(`/installations/${id}/reject`, { method: 'POST' });
}

export async function updateStatus(id: string, status: InstallationStatus) {
  return apiFetch(`/installations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function putInstallation(id: string, payload: { notes?: string[]; scheduling?: Record<string, string> }) {
  return apiFetch(`/installations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function uploadDocument(id: string, uri: string, category: string, description?: string) {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('file', { uri, name: filename, type } as any);
  formData.append('category', category);
  if (description) formData.append('description', description);
  return apiFetch(`/installations/${id}/documents`, { method: 'POST', body: formData });
}
