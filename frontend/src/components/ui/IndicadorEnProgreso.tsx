interface IndicadorEnProgresoProps {
  readonly mensaje: string;
}

export function IndicadorEnProgreso({ mensaje }: IndicadorEnProgresoProps) {
  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-xs text-apagado">
      <span
        aria-hidden="true"
        className="size-3 shrink-0 animate-spin rounded-full border-2 border-borde border-t-acento"
      />
      {mensaje}
    </span>
  );
}
