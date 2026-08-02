import type { EstadoCosto, EstadoCronograma, EstadoGeneral } from '../types/analisisEvm';

export type TonoEstado = 'correcto' | 'advertencia' | 'critico' | 'neutral';

interface PaletaEstado {
  readonly hex: string;
  readonly claseTexto: string;
  readonly claseFondoSuave: string;
  readonly claseBorde: string;
}

const UMBRAL_INDICE_ADVERTENCIA = 0.9;
const INDICE_OBJETIVO = 1;

const PALETA: Record<TonoEstado, PaletaEstado> = {
  correcto: {
    hex: '#3e6837',
    claseTexto: 'text-exito',
    claseFondoSuave: 'bg-exito-suave',
    claseBorde: 'border-exito/25',
  },
  advertencia: {
    hex: '#a15c07',
    claseTexto: 'text-advertencia',
    claseFondoSuave: 'bg-advertencia-suave',
    claseBorde: 'border-advertencia/25',
  },
  critico: {
    hex: '#b3261e',
    claseTexto: 'text-peligro',
    claseFondoSuave: 'bg-peligro-suave',
    claseBorde: 'border-peligro/25',
  },
  neutral: {
    hex: '#77756a',
    claseTexto: 'text-apagado',
    claseFondoSuave: 'bg-borde/40',
    claseBorde: 'border-borde',
  },
};

export function obtenerPaletaEstado(tono: TonoEstado): PaletaEstado {
  return PALETA[tono];
}

/**
 * Clasifica un índice de desempeño (CPI/SPI) ya calculado por el backend en un
 * tono visual: >=1 en control, entre 0.9 y 1 como advertencia temprana, <0.9 crítico.
 */
export function tonoPorIndice(valor: number | null): TonoEstado {
  if (valor === null) return 'neutral';
  if (valor >= INDICE_OBJETIVO) return 'correcto';
  if (valor >= UMBRAL_INDICE_ADVERTENCIA) return 'advertencia';
  return 'critico';
}

export function tonoPorVariacion(valor: number): TonoEstado {
  if (valor > 0) return 'correcto';
  if (valor < 0) return 'critico';
  return 'neutral';
}

export function tonoPorEstadoGeneral(estado: EstadoGeneral | null): TonoEstado {
  if (estado === null) return 'neutral';
  if (estado === 'saludable') return 'correcto';
  if (estado === 'en_riesgo') return 'advertencia';
  return 'critico';
}

export function tonoPorEstadoCronograma(estadoCronograma: EstadoCronograma | null): TonoEstado {
  if (estadoCronograma === null) return 'neutral';
  if (estadoCronograma === 'atrasado') return 'critico';
  return 'correcto';
}

export function tonoPorEstadoCosto(estadoCosto: EstadoCosto | null): TonoEstado {
  if (estadoCosto === null) return 'neutral';
  if (estadoCosto === 'sobre_presupuesto') return 'critico';
  return 'correcto';
}
