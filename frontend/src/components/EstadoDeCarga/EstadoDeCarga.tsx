interface EstadoDeCargaProps {
  readonly mensaje?: string;
}

export function EstadoDeCarga({ mensaje = 'Cargando...' }: EstadoDeCargaProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-2xl border border-borde bg-superficie/60 px-6 py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-[3px] border-borde border-t-acento"
      />
      <p className="text-sm text-apagado">{mensaje}</p>
    </div>
  );
}
