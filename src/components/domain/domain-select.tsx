import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dominio } from "@/lib/types";

interface DomainSelectProps {
  dominios: Dominio[];
  value: string;
  onChange: (dominioId: string) => void;
}

export function DomainSelect({ dominios, value, onChange }: DomainSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full rounded-xl bg-surface">
        <SelectValue placeholder="Selecione um domínio" />
      </SelectTrigger>
      <SelectContent>
        {dominios.map((dominio) => (
          <SelectItem key={dominio.id} value={dominio.id}>
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: dominio.cor }}
              aria-hidden="true"
            />
            {dominio.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
