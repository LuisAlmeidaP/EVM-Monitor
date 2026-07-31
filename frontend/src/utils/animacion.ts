/**
 * Recharts anima sus formas con requestAnimationFrame, lo cual es no determinista
 * en jsdom y produce pruebas intermitentes. Las animaciones siguen activas en
 * desarrollo/producción; solo se desactivan al correr bajo Vitest.
 */
export const ANIMACION_GRAFICOS_ACTIVA = import.meta.env.MODE !== 'test';
