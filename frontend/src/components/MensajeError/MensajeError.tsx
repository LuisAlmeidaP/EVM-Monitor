interface MensajeErrorProps {
  readonly mensaje: string;
}

export function MensajeError({ mensaje }: MensajeErrorProps) {
  return <p role="alert">{mensaje}</p>;
}
