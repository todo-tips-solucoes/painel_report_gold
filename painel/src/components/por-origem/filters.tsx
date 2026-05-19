"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type PorOrigemFilters = {
  from: string;
  to: string;
  medicoTagId?: number;
  uf?: string;
  tipo?: string;
  bucket: "all" | "with_medico" | "without_medico" | "with_crm";
};

type MedicosResp = {
  total: number;
  medicos: { tagId: number; nome: string; uf: string | null; tipo: string | null; chatAtivo: boolean | null }[];
};

type Props = {
  value: PorOrigemFilters;
  onChange: (next: PorOrigemFilters) => void;
  onExportXlsx: () => void;
  onExportCsv: () => void;
  isLoading?: boolean;
};

export function PorOrigemFilters({ value, onChange, onExportXlsx, onExportCsv, isLoading }: Props) {
  const queryClient = useQueryClient();
  const [refreshingMedicos, setRefreshingMedicos] = React.useState(false);

  const handleRefreshMedicos = React.useCallback(async () => {
    setRefreshingMedicos(true);
    try {
      await fetch("/api/medicos/refresh", { method: "POST" });
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["medicos"] });
      await queryClient.invalidateQueries({ queryKey: ["por-origem"] });
      setRefreshingMedicos(false);
    }
  }, [queryClient]);

  const { data: medicos } = useQuery<MedicosResp>({
    queryKey: ["medicos"],
    queryFn: async () => {
      const r = await fetch("/api/medicos");
      if (!r.ok) throw new Error("falha ao carregar médicos");
      return r.json();
    },
    staleTime: 10 * 60_000,
  });

  const ufs = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of medicos?.medicos ?? []) if (m.uf) set.add(m.uf);
    return [...set].sort();
  }, [medicos]);

  const tipos = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of medicos?.medicos ?? []) if (m.tipo) set.add(m.tipo);
    return [...set].sort();
  }, [medicos]);

  const medicosDedupados = React.useMemo(() => {
    const map = new Map<number, string[]>();
    for (const m of medicos?.medicos ?? []) {
      const arr = map.get(m.tagId);
      if (arr) arr.push(m.nome);
      else map.set(m.tagId, [m.nome]);
    }
    const out: { tagId: number; nome: string }[] = [];
    for (const [tagId, names] of map.entries()) {
      const unique = [...new Set(names)];
      out.push({ tagId, nome: unique.join(" / ") });
    }
    return out.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [medicos]);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-muted/30 px-4 py-3">
      <DateRangePicker
        from={value.from}
        to={value.to}
        onChange={({ from, to }) => onChange({ ...value, from, to })}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Médico</label>
        <Select
          value={value.medicoTagId ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              medicoTagId: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-full md:w-[260px]"
        >
          <option value="">Todos</option>
          {medicosDedupados.map((m) => (
            <option key={m.tagId} value={m.tagId}>
              {m.nome}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">UF</label>
        <Select
          value={value.uf ?? ""}
          onChange={(e) => onChange({ ...value, uf: e.target.value || undefined })}
          className="w-full md:w-[80px]"
        >
          <option value="">Todas</option>
          {ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Tipo</label>
        <Select
          value={value.tipo ?? ""}
          onChange={(e) => onChange({ ...value, tipo: e.target.value || undefined })}
          className="w-full md:w-[140px]"
        >
          <option value="">Todos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Filtrar por</label>
        <Select
          value={value.bucket}
          onChange={(e) => onChange({ ...value, bucket: e.target.value as PorOrigemFilters["bucket"] })}
          className="w-full md:w-[220px]"
        >
          <option value="all">Todos os contatos</option>
          <option value="with_medico">Com médico vinculado</option>
          <option value="without_medico">Sem médico vinculado</option>
          <option value="with_crm">Com tag CRM</option>
        </Select>
      </div>

      <div className="ml-auto flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onExportCsv} disabled={isLoading}>
          <Download className="h-4 w-4" aria-hidden /> CSV
        </Button>
        <Button variant="outline" size="sm" onClick={onExportXlsx} disabled={isLoading}>
          <Download className="h-4 w-4" aria-hidden /> Excel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshMedicos}
          disabled={refreshingMedicos}
          title="Recarregar a lista de médicos da API externa"
          aria-label="Recarregar a lista de médicos"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              refreshingMedicos && "animate-spin motion-reduce:animate-none",
            )}
            aria-hidden
          />
          Médicos
        </Button>
      </div>
    </div>
  );
}
