import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BarraNavegacion } from './BarraNavegacion';

function renderEn(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <BarraNavegacion />
      <Routes>
        <Route path="*" element={<div>Contenido de la página</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BarraNavegacion', () => {
  it('does not show the menu until the hamburger button is clicked', () => {
    renderEn('/');

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('opens the menu and shows the global link to Proyectos', async () => {
    const usuario = userEvent.setup();
    renderEn('/');

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/');
  });

  it('shows contextual project links only when the URL is scoped to a project', async () => {
    const usuario = userEvent.setup();
    renderEn('/proyectos/p1/dashboard');

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));

    expect(screen.getByRole('link', { name: 'Dashboard ejecutivo' })).toHaveAttribute(
      'href',
      '/proyectos/p1/dashboard',
    );
    expect(screen.getByRole('link', { name: 'Gestionar actividades' })).toHaveAttribute(
      'href',
      '/proyectos/p1/actividades',
    );
  });

  it('does not show contextual project links on routes with no project in the URL (edge case)', async () => {
    const usuario = userEvent.setup();
    renderEn('/');

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));

    expect(screen.queryByRole('link', { name: 'Dashboard ejecutivo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Gestionar actividades' })).not.toBeInTheDocument();
  });

  it('closes the menu when the backdrop is clicked', async () => {
    const usuario = userEvent.setup();
    const { container } = renderEn('/');

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    const fondo = container.querySelector('[aria-hidden="true"].fixed');
    expect(fondo).not.toBeNull();
    await usuario.click(fondo as Element);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('closes the menu when Escape is pressed', async () => {
    const usuario = userEvent.setup();
    renderEn('/');

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    await usuario.keyboard('{Escape}');

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('closes the menu after navigating to a link', async () => {
    const usuario = userEvent.setup();
    renderEn('/proyectos/p1/dashboard');

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));
    await usuario.click(screen.getByRole('link', { name: 'Proyectos' }));

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByText('Contenido de la página')).toBeInTheDocument();
  });
});
