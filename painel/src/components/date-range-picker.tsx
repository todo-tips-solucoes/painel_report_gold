"use client";

import { Input } from "@/components/ui/input";

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
};

export function DateRangePicker({ from, to, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">De</label>
        <Input
          type="date"
          value={from}
          max={to}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="w-[160px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Até</label>
        <Input
          type="date"
          value={to}
          min={from}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
