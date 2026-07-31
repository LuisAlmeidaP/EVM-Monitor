import { test, expect } from '@playwright/test';

const nombreProyecto = `Proyecto E2E ${Date.now()}`;
const nombreActividad = 'Excavación E2E';
const nombreActividadEditada = 'Excavación E2E (editada)';

test.describe('Gestión de Actividades', () => {
  test('un usuario puede navegar a un proyecto y crear, editar y eliminar una actividad', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(nombreProyecto);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreProyecto)).toBeVisible();

    await page.getByRole('link', { name: new RegExp(nombreProyecto) }).click();
    await expect(page.getByRole('heading', { name: nombreProyecto })).toBeVisible();
    await expect(page.getByText('No hay actividades registradas todavía.')).toBeVisible();

    // Crear
    await page.getByRole('button', { name: 'Nueva actividad' }).click();
    await page.getByLabel('Nombre de la actividad').fill(nombreActividad);
    await page.getByLabel('Presupuesto planificado (BAC)').fill('100000');
    await page.getByLabel('% Avance planificado').fill('50');
    await page.getByLabel('% Avance real').fill('40');
    await page.getByLabel('Costo real incurrido (AC)').fill('50000');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreActividad)).toBeVisible();
    await expect(page.getByText('Actividad creada correctamente.')).toBeVisible();

    // Editar
    const fila = page.getByRole('row').filter({ hasText: nombreActividad });
    await fila.getByRole('button', { name: 'Editar' }).click();
    const inputNombre = page.getByLabel('Nombre de la actividad');
    await expect(inputNombre).toHaveValue(nombreActividad);
    await inputNombre.fill(nombreActividadEditada);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreActividadEditada)).toBeVisible();
    await expect(page.getByText('Actividad actualizada correctamente.')).toBeVisible();

    // Eliminar
    const filaEditada = page.getByRole('row').filter({ hasText: nombreActividadEditada });
    await filaEditada.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar actividad' }).click();
    await expect(page.getByText('No hay actividades registradas todavía.')).toBeVisible();
    await expect(page.getByText('Actividad eliminada correctamente.')).toBeVisible();
  });

  test('muestra un error de validación al intentar crear una actividad sin nombre', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(`${nombreProyecto}-validacion`);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await page.getByRole('link', { name: new RegExp(`${nombreProyecto}-validacion`) }).click();

    await page.getByRole('button', { name: 'Nueva actividad' }).click();
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(
      page.getByText('El nombre de la actividad no puede estar vacío.'),
    ).toBeVisible();
  });
});
