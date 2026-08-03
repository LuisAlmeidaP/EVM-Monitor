import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
});

function medidaRectangulo(width: number, height: number): DOMRect {
  return {
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => '',
  };
}

/**
 * Recharts' ResponsiveContainer reads getBoundingClientRect()/offsetWidth/
 * offsetHeight to size itself; jsdom always returns zeros for these, which
 * would make every chart render at 0x0. Only the chart's own outer wrapper
 * needs a real size here — giving every element (including the Legend's own
 * measurement of itself) the same size makes Recharts think the legend is as
 * tall as the whole chart and collapses the plot area, so everything else
 * (legend items, tick labels) gets a 0x0 measurement instead.
 */
function esContenedorDeGrafico(elemento: Element): boolean {
  return elemento.classList.contains('recharts-responsive-container');
}

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get(this: HTMLElement) {
    return esContenedorDeGrafico(this) ? 600 : 0;
  },
});
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get(this: HTMLElement) {
    return esContenedorDeGrafico(this) ? 300 : 0;
  },
});

HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
  return esContenedorDeGrafico(this) ? medidaRectangulo(600, 300) : medidaRectangulo(0, 0);
};
