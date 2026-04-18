import Skeleton from "./Skeleton.jsx";

export default function LoadingSpinner({ label = "Processing dataset" }) {
  return (
    <div className="premium-surface rounded-xl p-4" role="status" aria-live="polite">
      <p className="mb-3 text-sm font-semibold text-[#5f6368]">{label}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-3" />
        <Skeleton className="h-3" />
        <Skeleton className="h-3" />
      </div>
    </div>
  );
}
