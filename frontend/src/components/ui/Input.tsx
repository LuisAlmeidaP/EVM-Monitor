import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly id: string;
  readonly label: string;
  readonly error?: string | null;
}

export function Input({ id, label, error, className = '', ...rest }: InputProps) {
  const errorId = `${id}-error`;
  const borderClasses = error
    ? 'border-peligro focus:border-peligro focus:ring-peligro/20'
    : 'border-borde focus:border-acento focus:ring-acento/20';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-tinta">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={
          `rounded-lg border bg-superficie px-3.5 py-2.5 text-sm text-tinta ` +
          `placeholder:text-apagado transition-colors focus:outline-none focus:ring-4 ` +
          `disabled:cursor-not-allowed disabled:bg-crema disabled:opacity-70 ` +
          `${borderClasses} ${className}`
        }
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}
