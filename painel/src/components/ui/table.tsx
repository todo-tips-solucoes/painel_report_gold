import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...p }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...p} />
  </div>
);

export const THead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-muted/50 [&_tr]:border-b" {...p} />
);

export const TBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="[&_tr:last-child]:border-0" {...p} />
);

export const Tr = ({ className, ...p }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b border-border hover:bg-muted/30 transition-colors", className)} {...p} />
);

export const Th = ({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "h-10 px-3 text-left align-middle font-medium text-muted-foreground text-xs uppercase tracking-wide",
      className,
    )}
    {...p}
  />
);

export const Td = ({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-3 py-2 align-top", className)} {...p} />
);
