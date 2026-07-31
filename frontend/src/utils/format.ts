const FORMATO_NUMERO = new Intl.NumberFormat('es-CO');
const FORMATO_INDICE = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const INDICE_DESCONOCIDO = 'N/D';

export function formatearNumero(valor: number): string {
  return FORMATO_NUMERO.format(valor);
}

export function formatearIndice(valor: number | null): string {
  return valor === null ? INDICE_DESCONOCIDO : FORMATO_INDICE.format(valor);
}
