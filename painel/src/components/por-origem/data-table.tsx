"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Table, TBody, THead, Th, Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";
import { fmtDateTime, fmtPhone, fmtNumber } from "@/lib/format";
import type { PorOrigemRow } from "@/schemas/por-origem";

type Props = {
  rows: PorOrigemRow[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

// Em colunas densas (médicos/tags), limitar visualmente para não estourar a
// linha. Tags adicionais ficam acessíveis via tooltip nativo no marcador "+N".
const MAX_VISIBLE_TAGS = 4;

function TagList({
  items,
  variant,
  emptyLabel = "—",
}: {
  items: string[];
  variant: "success" | "subtle";
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <span className="text-xs text-muted-foreground">{emptyLabel}</span>;
  }
  const visible = items.slice(0, MAX_VISIBLE_TAGS);
  const remaining = items.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((it) => (
        <Badge
          key={it}
          variant={variant}
          className="max-w-[18ch] truncate"
          title={it}
        >
          {it}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge
          variant="default"
          className={cn("tabular-nums")}
          title={items.slice(MAX_VISIBLE_TAGS).join(", ")}
        >
          +{remaining}
        </Badge>
      )}
    </div>
  );
}

const columns: ColumnDef<PorOrigemRow>[] = [
  {
    accessorKey: "name",
    header: "Contato",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name || "—"}</div>
    ),
  },
  {
    accessorKey: "number",
    header: "Telefone",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{fmtPhone(row.original.number)}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Cadastro",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums whitespace-nowrap">
        {fmtDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "medicos",
    header: "Médico(s)",
    cell: ({ row }) => (
      <TagList
        items={row.original.medicos}
        variant="success"
        emptyLabel="sem médico"
      />
    ),
  },
  {
    accessorKey: "tags_crm",
    header: "Tags CRM",
    cell: ({ row }) => (
      <TagList
        items={row.original.tags_crm}
        variant="subtle"
        emptyLabel="sem tag"
      />
    ),
  },
];

export function PorOrigemTable({ rows, total, page, pageSize, isLoading, onPageChange }: Props) {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="rounded-lg border border-border bg-background">
      <Table>
        <THead>
          {table.getHeaderGroups().map((hg) => (
            <Tr key={hg.id}>
              {hg.headers.map((h) => (
                <Th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</Th>
              ))}
            </Tr>
          ))}
        </THead>
        <TBody>
          {isLoading ? (
            <Tr>
              <Td colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                Carregando...
              </Td>
            </Tr>
          ) : rows.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                Nenhum contato encontrado com esses filtros.
              </Td>
            </Tr>
          ) : (
            table.getRowModel().rows.map((r) => (
              <Tr key={r.id}>
                {r.getVisibleCells().map((c) => (
                  <Td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</Td>
                ))}
              </Tr>
            ))
          )}
        </TBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {fmtNumber(start)}–{fmtNumber(end)} de {fmtNumber(total)} contatos
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

