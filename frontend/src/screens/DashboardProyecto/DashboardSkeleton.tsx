import { Skeleton } from '../../components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Cargando dashboard del proyecto">
      <span className="sr-only">Cargando dashboard del proyecto...</span>

      <Skeleton className="mb-6 h-24 w-full" />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, indice) => (
          <Skeleton key={indice} className="h-24" />
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>

      <Skeleton className="mb-8 h-64 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
