import type { ReactNode } from 'react';

export type AsyncState = 'default' | 'loading' | 'empty' | 'error' | 'success';

export function Button({
  children,
  disabled = false,
  loading = false,
  variant = 'primary',
}: {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <button
      className={variant === 'primary' ? 'button-primary' : 'button-ghost'}
      disabled={disabled || loading}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}

export function StatePanel({ state }: { state: AsyncState }) {
  if (state === 'loading') return <p aria-live="polite">Loading content…</p>;
  if (state === 'empty') return <p>No data available.</p>;
  if (state === 'error') return <p className="error-banner">Something went wrong.</p>;
  if (state === 'success') return <p>Saved successfully.</p>;
  return <p>Ready.</p>;
}
