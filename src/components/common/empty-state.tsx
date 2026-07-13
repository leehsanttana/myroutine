interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-3xl border border-dashed border-border bg-surface/60 px-4 py-12 text-center">
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
