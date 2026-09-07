export function DiagramSkeleton() {
  return (
    <div className="my-6 animate-pulse rounded-lg border bg-card p-4 shadow-sm">
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="mt-3 h-48 rounded bg-muted" />
      <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
    </div>
  );
}
