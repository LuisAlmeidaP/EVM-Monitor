import { test, expect } from '@playwright/test';

const nombreProyecto = `Proyecto Comparativo E2E ${Date.now()}`;

test.describe('Comparación PV/EV/AC por actividad', () => {
  test('el dashboard muestra la comparación por actividad, actualizada automáticamente al crear una actividad', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(nombreProyecto);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await page.getByRole('link', { name: new RegExp(nombreProyecto) }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Sin actividades: la gráfica muestra el estado vacío correspondiente
    await page.getByRole('button', { name: 'Crear la primera actividad' }).click();
    await page.getByLabel('Nombre de la actividad').fill('Excavación');
    await page.getByLabel('Presupuesto planificado (BAC)').fill('100000');
    await page.getByLabel('% Avance planificado').fill('50');
    await page.getByLabel('% Avance real').fill('40');
    await page.getByLabel('Costo real incurrido (AC)').fill('50000');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Actividad creada correctamente.')).toBeVisible();

    const seccion = page.getByRole('region', { name: 'Comparación de actividades' });
    await expect(seccion.getByText('PV, EV y AC por actividad')).toBeVisible();
    await expect(seccion.getByText(/PV — Valor planificado/)).toBeVisible();
    await expect(seccion.getByText(/EV — Valor ganado/)).toBeVisible();
    await expect(seccion.getByText(/AC — Costo real/)).toBeVisible();
    await expect(seccion.locator('.recharts-bar-rectangle')).toHaveCount(3);

    // Tooltip enriquecido al pasar el cursor sobre la fila de la actividad
    await seccion.locator('.recharts-bar-rectangle').first().hover();
    const tooltip = page.locator('.recharts-tooltip-wrapper');
    await expect(tooltip.getByText('Excavación')).toBeVisible();
    await expect(tooltip.getByText(/PV: 50.000/)).toBeVisible();
    await expect(tooltip.getByText(/EV: 40.000/)).toBeVisible();
    await expect(tooltip.getByText(/AC: 50.000/)).toBeVisible();

    // Agregar una segunda actividad: la gráfica se actualiza automáticamente, sin recargar
    const urlDashboard = page.url();
    await page.getByRole('button', { name: 'Nueva actividad' }).click();
    await page.getByLabel('Nombre de la actividad').fill('Cimentación');
    await page.getByLabel('Presupuesto planificado (BAC)').fill('200000');
    await page.getByLabel('% Avance planificado').fill('30');
    await page.getByLabel('% Avance real').fill('35');
    await page.getByLabel('Costo real incurrido (AC)').fill('65000');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('Actividad creada correctamente.')).toBeVisible();
    await expect(seccion.locator('.recharts-bar-rectangle')).toHaveCount(6);
    expect(page.url()).toBe(urlDashboard);

    // El control de orden reorganiza las filas sin volver a pedir datos
    await seccion.getByLabel('Ordenar por').selectOption('desviacion');
    await expect(seccion.locator('.recharts-bar-rectangle')).toHaveCount(6);
  });
});
