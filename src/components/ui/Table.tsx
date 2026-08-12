import React from 'react';
import { cn } from '../../lib/utils';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  w?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectedRowId?: string | number;
  rowIdKey?: keyof T;
  isLoading?: boolean;
  className?: string;
  density?: 'compact' | 'comfortable';
}

const DataRow = React.memo(({ 
  row, 
  columns: rawColumns = [], 
  onRowClick, 
  isSelected, 
  density 
}: { 
  row: any, 
  columns: Column<any>[], 
  onRowClick?: (row: any) => void, 
  isSelected: boolean,
  density: 'compact' | 'comfortable'
}) => {
  const columns = Array.isArray(rawColumns) ? rawColumns : [];
  return (
    <tr 
      onClick={() => onRowClick?.(row)}
      onKeyDown={(e) => {
        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onRowClick(row);
        }
      }}
      tabIndex={onRowClick ? 0 : undefined}
      role={onRowClick ? "button" : "row"}
      aria-selected={isSelected}
      className={cn(
        "hover:bg-white/5 transition-colors group border-b border-terminal-border/20 focus:outline-none focus-visible:bg-white/10",
        density === 'compact' ? "h-7" : "h-9",
        onRowClick && "cursor-pointer",
        isSelected && "bg-terminal-amber/5 border-l-2 border-l-terminal-amber"
      )}
    >
      {columns.map((col, cIdx) => {
        const value = typeof col.accessor === 'function' 
          ? col.accessor(row) 
          : row[col.accessor];
        
        return (
          <td 
            key={cIdx} 
            className={cn(
              "px-4 py-1 text-terminal-muted group-hover:text-white transition-colors bg-transparent",
              cIdx === 0 && "sticky left-0 bg-terminal-panel group-hover:bg-[#1a1a1a] z-10",
              cIdx === 0 && isSelected && "bg-terminal-amber/10 group-hover:bg-terminal-amber/20",
              col.align === 'right' && "text-right tabular-nums",
              col.align === 'center' && "text-center",
              col.className
            )}
          >
            {value}
          </td>
        );
      })}
    </tr>
  );
});

export function DataTable<T extends Record<string, any>>({ 
  data: rawData = [], 
  columns: rawColumns = [], 
  onRowClick, 
  selectedRowId, 
  rowIdKey = 'id',
  isLoading,
  className,
  density = 'compact'
}: DataTableProps<T>) {
  const data = Array.isArray(rawData) ? rawData : [];
  const columns = Array.isArray(rawColumns) ? rawColumns : [];
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full text-[10px] text-left border-collapse">
        <thead className="sticky top-0 bg-terminal-panel shadow-sm text-terminal-muted uppercase font-bold tracking-wider z-10 border-b border-terminal-border">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={cn(
                  "px-4 py-2", 
                  idx === 0 && "sticky left-0 bg-terminal-panel z-20",
                  col.align === 'right' && "text-right",
                  col.align === 'center' && "text-center",
                  col.className
                )}
              >
                <div className={cn("flex items-center gap-1", col.align === 'right' && "justify-end")}>
                  {col.header}
                  {col.sortable && <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono divide-y divide-terminal-border/30">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse h-8">
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-1.5"><div className="h-2 bg-white/5 rounded-sm" /></td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr className="h-24">
              <td colSpan={columns.length} className="text-center font-mono py-6">
                <span className="text-terminal-amber font-bold text-xs uppercase block tracking-wider">NO CURRENT DATA</span>
                <span className="text-[10px] text-terminal-muted block mt-0.5">No active records found for this lab context.</span>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <DataRow 
                key={row[rowIdKey] || idx}
                row={row}
                columns={columns}
                onRowClick={onRowClick}
                isSelected={selectedRowId !== undefined && row[rowIdKey] === selectedRowId}
                density={density}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- Specialized Components ---

export const SearchBar = React.memo(({ 
  placeholder = "Search...", 
  value = "", 
  onChange = () => {},
  className
}: { 
  placeholder?: string, 
  value?: string, 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  className?: string
}) => (
  <div className={cn("relative", className)} role="search">
    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-muted" aria-hidden="true" />
    <input 
      type="search"
      placeholder={placeholder} 
      aria-label={placeholder}
      value={value}
      onChange={onChange}
      className="bg-black/40 border border-terminal-border rounded-sm py-1.5 pl-8 pr-3 text-[10px] font-mono focus:outline-none focus:border-terminal-amber focus-visible:ring-1 focus-visible:ring-terminal-amber w-full transition-colors"
    />
  </div>
));

export const FilterBar = React.memo(({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-black/20 border-b border-terminal-border overflow-x-auto scrollbar-hide">
    {children}
  </div>
));
