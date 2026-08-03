import { useEffect, useState } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';

export function BarraNavegacion() {
  const [abierto, setAbierto] = useState(false);
  const location = useLocation();
  const coincidenciaProyecto = useMatch('/proyectos/:proyectoId/*');
  const proyectoId = coincidenciaProyecto?.params.proyectoId;

  useEffect(() => {
    setAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const manejarTecla = (evento: KeyboardEvent): void => {
      if (evento.key === 'Escape') {
        setAbierto(false);
      }
    };
    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [abierto]);

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-superficie/95 backdrop-blur">
      <div className="relative z-40 mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-lg text-tinta">
          EVM Monitor
        </Link>

        <button
          type="button"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          onClick={() => setAbierto((valor) => !valor)}
          className="flex size-9 items-center justify-center rounded-lg text-tinta transition-colors hover:bg-borde/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="size-5"
            aria-hidden="true"
          >
            {abierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            )}
          </svg>
        </button>

        {abierto && (
          <>
            <div
              className="fixed inset-x-0 top-14 bottom-0 z-30"
              onClick={() => setAbierto(false)}
              aria-hidden="true"
            />
            <nav
              aria-label="Navegación principal"
              className="animar-menu absolute top-full right-4 z-40 mt-1 w-64 origin-top-right rounded-2xl border border-borde bg-superficie p-2 shadow-xl sm:right-6"
            >
              <Link
                to="/"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-texto hover:bg-crema"
              >
                Proyectos
              </Link>

              {proyectoId && (
                <>
                  <p className="mt-1 px-3 pt-2 text-xs font-medium tracking-wide text-apagado uppercase">
                    Este proyecto
                  </p>
                  <Link
                    to={`/proyectos/${proyectoId}/dashboard`}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-texto hover:bg-crema"
                  >
                    Dashboard ejecutivo
                  </Link>
                  <Link
                    to={`/proyectos/${proyectoId}/actividades`}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-texto hover:bg-crema"
                  >
                    Gestionar actividades
                  </Link>
                </>
              )}
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
