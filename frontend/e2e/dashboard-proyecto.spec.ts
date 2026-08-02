import { test, expect } from '@playwright/test';

const nombreProyecto = `Proyecto Dashboard E2E ${Date.now()}`;
const nombreProyectoVacio = `Proyecto Vacío E2E ${Date.now()}`;

test.describe('Dashboard Consolidado del Proyecto', () => {
  test('un usuario puede crear actividades directamente desde el dashboard y ver el análisis consolidado', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(nombreProyecto);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreProyecto)).toBeVisible();

    await page.getByRole('link', { name: new RegExp(nombreProyecto) }).click();
    await expect(page.getByRole('heading', { name: nombreProyecto })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Sin actividades: estado vacío cuyo CTA abre el formulario en el propio dashboard
    await expect(page.getByText('Este proyecto no tiene actividades registradas todavía.')).toBeVisible();
    await page.getByRole('button', { name: 'Crear la primera actividad' }).click();
    await expect(page.getByRole('dialog', { name: 'Nueva actividad' })).toBeVisible();

    // Crear dos actividades sin salir nunca del dashboard
    for (const actividad of [
      { nombre: 'Excavación', bac: '100000', planificado: '50', real: '40', costo: '50000' },
      { nombre: 'Cimentación', bac: '200000', planificado: '30', real: '35', costo: '65000' },
    ]) {
      await page.getByLabel('Nombre de la actividad').fill(actividad.nombre);
      await page.getByLabel('Presupuesto planificado (BAC)').fill(actividad.bac);
      await page.getByLabel('% Avance planificado').fill(actividad.planificado);
      await page.getByLabel('% Avance real').fill(actividad.real);
      await page.getByLabel('Costo real incurrido (AC)').fill(actividad.costo);
      await page.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.getByText(actividad.nombre)).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard$/);
      if (actividad.nombre !== 'Cimentación') {
        await page.getByRole('button', { name: 'Nueva actividad' }).click();
      }
    }

    await expect(page.getByRole('heading', { name: nombreProyecto })).toBeVisible();
    await expect(page.getByText('En riesgo', { exact: true })).toBeVisible();

    // Resumen ejecutivo y alerta
    await expect(page.getByText(/consolida 2 actividades/)).toBeVisible();
    await expect(page.getByText(/Sobrecosto/)).toBeVisible();

    // Indicadores mínimos requeridos
    for (const etiqueta of ['BAC', 'PV', 'EV', 'AC', 'CV', 'SV', 'CPI', 'SPI']) {
      await expect(page.getByText(etiqueta, { exact: true }).first()).toBeVisible();
    }

    // Gráficos
    await expect(page.getByText('Valor planificado, ganado y real')).toBeVisible();
    await expect(page.getByText('Índices de desempeño')).toBeVisible();
    await expect(page.getByText('Distribución del presupuesto')).toBeVisible();
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();

    // Integración con actividades: tabla interactiva + enlace de análisis por actividad
    const filaExcavacion = page.getByRole('row').filter({ hasText: 'Excavación' });
    await expect(filaExcavacion).toBeVisible();
    await expect(filaExcavacion.getByRole('button', { name: 'Editar' })).toBeVisible();
    await filaExcavacion.getByRole('link', { name: 'Ver análisis EVM' }).click();
    await expect(page.getByRole('heading', { name: 'Excavación' })).toBeVisible();
  });

  test('muestra un estado vacío cuando el proyecto no tiene actividades, sin llamar al análisis consolidado', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(nombreProyectoVacio);
    await page.getByRole('button', { name: 'Guardar' }).click();

    await page.getByRole('link', { name: new RegExp(nombreProyectoVacio) }).click();

    await expect(page.getByText('Este proyecto no tiene actividades registradas todavía.')).toBeVisible();
  });

  test('muestra un error con el contrato uniforme cuando el proyecto no existe', async ({ page }) => {
    await page.goto('/proyectos/00000000-0000-0000-0000-000000000000/dashboard');

    await expect(page.getByRole('alert')).toBeVisible();
  });
});
