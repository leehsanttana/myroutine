import { DomainProgressList } from "@/components/today/domain-progress-list";
import { TodayActivityList } from "@/components/today/today-activity-list";
import { TodayHeader } from "@/components/today/today-header";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 pt-8">
      <TodayHeader />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-wide text-ink-muted uppercase">
          Atividades de hoje
        </h2>
        <TodayActivityList />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-wide text-ink-muted uppercase">
          Progressão da semana
        </h2>
        <DomainProgressList />
      </section>
    </div>
  );
}
