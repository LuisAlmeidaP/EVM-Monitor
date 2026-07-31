const FORMATO_NUMERO = new Intl.NumberFormat('es-CO');

export function formatearNumero(valor: number): string {
  return FORMATO_NUMERO.format(valor);
}
