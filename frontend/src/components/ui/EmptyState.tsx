import type { ReactNode } from 'react';

interface EmptyStateProps {
  readonly titulo: string;
  readonly descripcion: string;
  readonly accion?: ReactNode;
}

export function EmptyState({ titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde bg-superficie/60 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-acento-suave text-acento">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
          />
        </svg>
      </div>
      <p className="font-display text-lg text-tinta">{titulo}</p>
      <p className="max-w-sm text-sm text-apagado">{descripcion}</p>
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}
