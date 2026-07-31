import { useEffect } from 'react';

const DURACION_TOAST_MS = 3500;

interface ToastProps {
  readonly mensaje: string;
  readonly onCerrar: () => void;
}

export function Toast({ mensaje, onCerrar }: ToastProps) {
  useEffect(() => {
    const temporizador = setTimeout(onCerrar, DURACION_TOAST_MS);
    return () => clearTimeout(temporizador);
  }, [onCerrar]);

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-lg border border-exito/20 bg-exito-suave px-4 py-3 text-sm font-medium text-exito shadow-lg"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
      {mensaje}
    </div>
  );
}
