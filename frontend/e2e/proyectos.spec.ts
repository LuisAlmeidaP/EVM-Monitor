import { test, expect } from '@playwright/test';

const nombreProyecto = `Torre E2E ${Date.now()}`;
const nombreProyectoEditado = `${nombreProyecto} (editado)`;

test.describe('Gestión de Proyectos', () => {
  test('un usuario puede crear, editar y eliminar un proyecto de extremo a extremo', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();

    // Crear
    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByLabel('Nombre del proyecto').fill(nombreProyecto);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreProyecto)).toBeVisible();

    // Editar
    const fila = page.getByRole('row').filter({ hasText: nombreProyecto });
    await fila.getByRole('button', { name: 'Editar' }).click();
    const input = page.getByLabel('Nombre del proyecto');
    await expect(input).toHaveValue(nombreProyecto);
    await input.fill(nombreProyectoEditado);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(nombreProyectoEditado)).toBeVisible();

    // Eliminar
    page.once('dialog', (dialog) => void dialog.accept());
    const filaEditada = page.getByRole('row').filter({ hasText: nombreProyectoEditado });
    await filaEditada.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText(nombreProyectoEditado)).not.toBeVisible();
  });

  test('muestra un error de validación al intentar crear un proyecto sin nombre', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Crear proyecto' }).click();
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('El nombre del proyecto no puede estar vacío.')).toBeVisible();
  });
});
