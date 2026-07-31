import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  readonly titulo: string;
  readonly onCerrar: () => void;
  readonly children: ReactNode;
}

export function Modal({ titulo, onCerrar, children }: ModalProps) {
  useEffect(() => {
    const manejarTecla = (evento: KeyboardEvent): void => {
      if (evento.key === 'Escape') {
        onCerrar();
      }
    };
    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-md rounded-2xl bg-superficie p-6 shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="font-display text-xl text-tinta">{titulo}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
