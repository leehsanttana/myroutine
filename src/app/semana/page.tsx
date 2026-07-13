import { WeekGrid } from "@/components/week/week-grid";

export default function SemanaPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-8">
      <header className="flex flex-col gap-1.5">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
          Template recorrente
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Semana
        </h1>
      </header>
      <WeekGrid />
    </div>
  );
}
