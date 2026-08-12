import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  RefreshCcw, 
  Info, 
  SlidersHorizontal 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: ((row: T) => React.ReactNode) | keyof T;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
  align?: 'left' | 'center' | 'right';
  className?: string;
  defaultVisible?: boolean;
}

interface EnterpriseMarketTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  subtitle?: string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string;
  getRowId?: (row: T) => string;
  onRefresh?: () => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export function EnterpriseMarketTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  onRowClick,
  selectedRowId,
  getRowId,
  onRefresh,
  pageSizeOptions = [10, 25, 50, 100],
  isLoading = false
}: EnterpriseMarketTableProps<T>) {
  // 1. Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  
  // 2. Sorting States
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 3. Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] || 10);

  // 4. Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach(col => {
      initial[col.key] = col.defaultVisible !== false;
    });
    return initial;
  });
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  // Filtered Columns list
  const activeColumns = useMemo(() => {
    return columns.filter(col => visibleColumns[col.key] !== false);
  }, [columns, visibleColumns]);

  // Handle sorting click
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Helper to extract raw value for filter/sort/search
  const getRawValue = (row: T, col: ColumnDef<T>): any => {
    if (typeof col.accessor === 'function') {
      return col.accessor(row);
    }
    return row[col.accessor];
  };

  // Process data with Search, Column Filters, Sorting
  const processedData = useMemo(() => {
    let result = [...data];

    // Global Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(row => {
        return Object.values(row).some(val => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // Column Filters
    Object.entries(columnFilters).forEach(([colKey, filterVal]) => {
      if (!filterVal || filterVal === 'ALL') return;
      const col = columns.find(c => c.key === colKey);
      if (!col) return;
      
      result = result.filter(row => {
        const raw = getRawValue(row, col);
        const strVal = String(raw || '').toLowerCase();
        return strVal === String(filterVal || '').toLowerCase();
      });
    });

    // Sorting
    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      if (col) {
        result.sort((a, b) => {
          let valA = getRawValue(a, col);
          let valB = getRawValue(b, col);

          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();

          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, columns, searchTerm, columnFilters, sortKey, sortDirection]);

  // Paginated data
  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, safePage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (processedData.length === 0) return;
    const headers = activeColumns.map(c => c.header).join(',');
    const rows = processedData.map(row => {
      return activeColumns.map(col => {
        let val = getRawValue(row, col);
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(title || 'market_data').toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel Format
  const handleExportExcel = () => {
    if (processedData.length === 0) return;
    const headers = activeColumns.map(c => c.header).join('\t');
    const rows = processedData.map(row => {
      return activeColumns.map(col => {
        let val = getRawValue(row, col);
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        return String(val ?? '');
      }).join('\t');
    });

    const excelContent = "data:application/vnd.ms-excel;charset=utf-8," + encodeURIComponent([headers, ...rows].join('\n'));
    const link = document.createElement("a");
    link.setAttribute("href", excelContent);
    link.setAttribute("download", `${(title || 'market_data').toLowerCase().replace(/\s+/g, '_')}_export.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] border border-slate-800 rounded font-mono text-xs overflow-hidden">
      
      {/* Table Header Controls Toolbar */}
      <div className="p-3 bg-[#0c1221] border-b border-slate-800 flex flex-wrap gap-3 items-center justify-between shrink-0">
        
        {/* Title & Subtitle */}
        {(title || subtitle) && (
          <div className="flex flex-col">
            {title && <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>}
            {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-xs w-full flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search all columns..."
            className="w-full bg-black/60 border border-slate-800 focus:border-terminal-amber text-xs rounded pl-8 pr-3 py-1.5 text-white font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Column Filters Dropdown */}
          {columns.some(c => c.filterable) && (
            <div className="flex items-center gap-1.5">
              {columns.filter(c => c.filterable).map(col => (
                <select
                  key={col.key}
                  value={columnFilters[col.key] || 'ALL'}
                  onChange={(e) => {
                    setColumnFilters(prev => ({ ...prev, [col.key]: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-bold text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All {col.header}</option>
                  {col.filterOptions?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
            </div>
          )}

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[11px] font-bold flex items-center gap-1.5 transition"
              title="Show/Hide Columns"
            >
              <Eye className="w-3.5 h-3.5 text-terminal-amber" />
              Cols
            </button>

            {showVisibilityMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-[#0d1424] border border-slate-700 rounded shadow-2xl p-2 z-30 space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 block px-1 pb-1 border-b border-slate-800">
                  Toggle Visibility
                </span>
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-[10px] text-slate-200 hover:bg-slate-800 p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key] !== false}
                      onChange={(e) => {
                        setVisibleColumns(prev => ({ ...prev, [col.key]: e.target.checked }));
                      }}
                      className="accent-terminal-amber"
                    />
                    <span>{col.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV & Excel Buttons */}
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-[11px] font-bold flex items-center gap-1 transition"
            title="Export CSV File"
          >
            <Download className="w-3.5 h-3.5 text-terminal-green" />
            CSV
          </button>

          <button
            onClick={handleExportExcel}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-[11px] font-bold flex items-center gap-1 transition"
            title="Export Excel File"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-terminal-blue" />
            Excel
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded transition"
              title="Refresh Data"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-terminal-amber" />
            </button>
          )}

        </div>
      </div>

      {/* Main Scrollable Table Area */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse">
          
          {/* Sticky Table Header */}
          <thead className="sticky top-0 bg-[#0c1221] z-10 border-b border-slate-800 shadow-md">
            <tr>
              {activeColumns.map(col => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={cn(
                      "p-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none border-r border-slate-800/40 last:border-r-0",
                      col.sortable !== false && "cursor-pointer hover:bg-slate-800/60 hover:text-white",
                      col.align === 'center' && "text-center",
                      col.align === 'right' && "text-right"
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-1",
                      col.align === 'center' && "justify-center",
                      col.align === 'right' && "justify-end"
                    )}>
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span>
                          {isSorted ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-terminal-amber" /> : <ArrowDown className="w-3 h-3 text-terminal-amber" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-50 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/60 bg-[#090d16]">
            {isLoading ? (
              <tr>
                <td colSpan={activeColumns.length} className="p-8 text-center text-slate-400">
                  <RefreshCcw className="w-6 h-6 text-terminal-amber animate-spin mx-auto mb-2" />
                  <span>Loading enterprise master records...</span>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length} className="p-8 text-center text-slate-500 italic">
                  <Info className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <span>No matching records found.</span>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = getRowId ? getRowId(row) : (row.id || row.symbol || row.instrumentId || idx);
                const isSelected = selectedRowId === rowId;

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "hover:bg-slate-800/50 transition cursor-pointer",
                      isSelected && "bg-terminal-amber/15 border-l-2 border-l-terminal-amber"
                    )}
                  >
                    {activeColumns.map(col => {
                      const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "p-2.5 border-r border-slate-800/30 last:border-r-0 text-xs text-slate-200",
                            col.align === 'center' && "text-center",
                            col.align === 'right' && "text-right",
                            col.className
                          )}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-2.5 bg-[#0c1221] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-white">{totalItems > 0 ? (safePage - 1) * pageSize + 1 : 0}</strong> to <strong className="text-white">{Math.min(safePage * pageSize, totalItems)}</strong> of <strong className="text-terminal-amber">{totalItems}</strong> entries
          </span>

          <div className="flex items-center gap-1">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-black border border-slate-800 text-white font-bold rounded px-1.5 py-0.5 text-[11px]"
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-30 hover:bg-slate-800 text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-bold text-white px-1">
            Page {safePage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-30 hover:bg-slate-800 text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
