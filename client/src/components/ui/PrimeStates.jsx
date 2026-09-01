import { ProgressSpinner } from "primereact/progressspinner";
import { Skeleton } from "primereact/skeleton";

export function AppLoader({ label = "Cargando…", className = "" }) {
  return <div className={`flex min-h-24 flex-col items-center justify-center gap-3 text-sm text-stone-500 ${className}`} role="status"><ProgressSpinner className="h-9 w-9 text-brand-red" strokeWidth="4" aria-label={label} /><span>{label}</span></div>;
}

export function AppSkeleton({ className = "", ...props }) {
  return <Skeleton {...props} className={`rounded-md ${className}`} />;
}
