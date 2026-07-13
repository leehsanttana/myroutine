interface DomainBadgeProps {
  nome: string;
  cor: string;
  className?: string;
}

export function DomainBadge({ nome, cor, className }: DomainBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted ${className ?? ""}`}
    >
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: cor }}
        aria-hidden="true"
      />
      {nome}
    </span>
  );
}
