import { test, expect } from '@playwright/test';

const nombreProyecto = `Proyecto Navegación E2E ${Date.now()}`;

test.describe('Navegación por menú hamburguesa y actualización automática', () => {
  test('el menú hamburguesa navega entre módulos y el dashboard se actualiza sin recargar la página tras cada mutación', async ({
    page,
  }) => {
    await page.goto('/');

    // En la pantalla de Proyectos el menú solo ofrece el enlace global
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard ejecutivo' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Cerrar menú' }).click();
    await expect(page.getByRole('navigation')).toHaveCount(0);

    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(nombreProyecto);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await page.getByRole('link', { name: new RegExp(nombreProyecto) }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Dentro de un proyecto, el menú ofrece navegación contextual a ambas vistas
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    const menu = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(menu.getByRole('link', { name: 'Dashboard ejecutivo' })).toBeVisible();
    await menu.getByRole('link', { name: 'Gestionar actividades' }).click();
    await expect(page).toHaveURL(/\/actividades$/);
    await expect(page.getByRole('navigation')).toHaveCount(0);

    // Crear la primera actividad desde la pantalla de gestión
    await page.getByRole('button', { name: 'Nueva actividad' }).click();
    await page.getByLabel('Nombre de la actividad').fill('Excavación');
    await page.getByLabel('Presupuesto planificado (BAC)').fill('100000');
    await page.getByLabel('% Avance planificado').fill('50');
    await page.getByLabel('% Avance real').fill('40');
    await page.getByLabel('Costo real incurrido (AC)').fill('50000');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Actividad creada correctamente.')).toBeVisible();

    // Volver al dashboard por el menú y confirmar que ya refleja la nueva actividad
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('link', { name: 'Dashboard ejecutivo' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Crítico', { exact: true })).toBeVisible();
    await expect(page.getByText('Excavación')).toBeVisible();

    const urlDashboard = page.url();

    // Editar la actividad directamente en el dashboard: todo debe refrescarse in-place
    await page.getByRole('row').filter({ hasText: 'Excavación' }).getByRole('button', { name: 'Editar' }).click();
    const campoAvanceReal = page.getByLabel('% Avance real');
    await expect(campoAvanceReal).toHaveValue('40');
    await campoAvanceReal.fill('100');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('Actividad actualizada correctamente.')).toBeVisible();
    await expect(page.getByText('Saludable', { exact: true })).toBeVisible();
    expect(page.url()).toBe(urlDashboard);

    // Eliminar la actividad desde el dashboard: el estado vacío debe reaparecer sin recargar
    await page.getByRole('row').filter({ hasText: 'Excavación' }).getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar actividad' }).click();

    await expect(page.getByText('Actividad eliminada correctamente.')).toBeVisible();
    await expect(page.getByText('Este proyecto no tiene actividades registradas todavía.')).toBeVisible();
    expect(page.url()).toBe(urlDashboard);
  });
});
