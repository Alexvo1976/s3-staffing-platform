export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export type Job = {
  id: string; slug: string; title: string; summary: string; description?: string;
  responsibilities?: string[]; qualifications?: string[]; city: string; state: string;
  workplace: string; employmentType: string; industry: string; compensation?: string;
  featured: boolean; publishedAt?: string;
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...init?.headers }, cache: 'no-store' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}
