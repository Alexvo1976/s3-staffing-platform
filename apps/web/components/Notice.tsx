'use client';

export function Notice({ state }: { state: { type: 'success' | 'error'; message: string } | null }) {
  if (!state) return null;
  return <p role={state.type === 'error' ? 'alert' : 'status'} className={`notice ${state.type === 'error' ? 'error' : ''}`}>{state.message}</p>;
}
