import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly children: ReactNode;
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ' +
  'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-acento disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-acento text-white hover:bg-acento-intenso',
  secondary: 'border border-borde bg-superficie text-texto hover:bg-crema',
  danger: 'bg-peligro text-white hover:bg-peligro-intenso focus-visible:outline-peligro',
  ghost: 'text-apagado hover:bg-borde/50 hover:text-tinta',
};

export function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
