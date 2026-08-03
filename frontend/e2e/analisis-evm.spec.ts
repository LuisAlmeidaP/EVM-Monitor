import { test, expect } from '@playwright/test';

const nombreProyecto = `Proyecto Análisis E2E ${Date.now()}`;
const nombreActividad = 'Excavación E2E';

test.describe('Análisis EVM de Actividad', () => {
  test('un usuario puede navegar desde el listado de actividades hasta ver su análisis EVM completo', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(nombreProyecto);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreProyecto)).toBeVisible();

    await page
      .locator('article')
      .filter({ hasText: nombreProyecto })
      .getByRole('link', { name: 'Ver actividades' })
      .click();
    await page.getByRole('button', { name: 'Nueva actividad' }).click();
    await page.getByLabel('Nombre de la actividad').fill(nombreActividad);
    await page.getByLabel('Presupuesto planificado (BAC)').fill('100000');
    await page.getByLabel('% Avance planificado').fill('50');
    await page.getByLabel('% Avance real').fill('40');
    await page.getByLabel('Costo real incurrido (AC)').fill('50000');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreActividad)).toBeVisible();

    const fila = page.getByRole('row').filter({ hasText: nombreActividad });
    await fila.getByRole('link', { name: 'Ver análisis EVM' }).click();

    await expect(page.getByRole('heading', { name: nombreActividad })).toBeVisible();
    await expect(page.getByText('Crítico')).toBeVisible();

    // Todos los indicadores mínimos requeridos
    for (const etiqueta of ['BAC', 'PV', 'EV', 'AC', 'CV', 'SV', 'CPI', 'SPI']) {
      await expect(page.getByText(etiqueta, { exact: true }).first()).toBeVisible();
    }

    // Alertas de desviación
    await expect(page.getByText(/Sobrecosto/)).toBeVisible();
    await expect(page.getByText(/Retraso/)).toBeVisible();

    // Gráficos renderizados
    await expect(page.getByText('Valor planificado, ganado y real')).toBeVisible();
    await expect(page.getByText('Índices de desempeño')).toBeVisible();
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();

    // Volver a actividades
    await page.getByRole('button', { name: '← Volver a actividades' }).click();
    await expect(page.getByRole('heading', { name: nombreProyecto })).toBeVisible();
  });

  test('muestra un error con el contrato uniforme cuando la actividad no existe', async ({ page }) => {
    await page.goto('/actividades/00000000-0000-0000-0000-000000000000/analisis-evm');

    await expect(page.getByRole('alert')).toBeVisible();
  });
});
