interface EstadoDeCargaProps {
  readonly mensaje?: string;
}

export function EstadoDeCarga({ mensaje = 'Cargando...' }: EstadoDeCargaProps) {
  return <p role="status">{mensaje}</p>;
}
