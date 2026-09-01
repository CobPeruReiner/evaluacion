import { AppSkeleton } from "../ui/PrimeStates";

export const SkeletonBlock = ({ title = true, lines = 6, className = "" }) => <div className={`w-full space-y-2 ${className}`}>{title && <AppSkeleton height=".75rem" />}{Array.from({ length: lines }).map((_, i) => <AppSkeleton key={i} width={i === lines - 1 ? "72%" : "100%"} height=".5rem" />)}</div>;
