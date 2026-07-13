"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FabNovaAtividadeProps {
  onClick: () => void;
}

export function FabNovaAtividade({ onClick }: FabNovaAtividadeProps) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={onClick}
      aria-label="Nova atividade"
      className="fixed right-5 bottom-24 z-40 size-14 rounded-full bg-movimento text-surface shadow-card hover:bg-movimento/90 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      <Plus className="size-6" strokeWidth={2.5} />
    </Button>
  );
}
