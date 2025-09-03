import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import Dropdown from '../forms/Dropdown';

const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  showSearch = true,
  showFilters = true,
  showExport = true,
  showSelection = false,
  onRowClick,
  onSelectionChange,
  loading = false,
  className = '',
  tableHeight = 'max-h-[500px]'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState({});

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = data;
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = column.accessor ? column.accessor(item) : item[column.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    
    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        filtered = filtered.filter(item => {
          const column = columns.find(col => col.key === key);
          const itemValue = column?.accessor ? column.accessor(item) : item[key];
          return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });
    
    return filtered;
  }, [data, searchTerm, columns, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = columns.find(col => col.key === sortConfig.key)?.accessor?.(a) ?? a[sortConfig.key];
      const bValue = columns.find(col => col.key === sortConfig.key)?.accessor?.(b) ?? b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, sortedData.length);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle row selection
  const handleRowSelection = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = paginatedData.map(item => item.id);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  };

  // Export data
  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...sortedData.map(row => 
        columns.map(col => {
          const value = col.accessor ? col.accessor(row) : row[col.key];
          return `"${value}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
             <style jsx>{`
         .scrollable-table::-webkit-scrollbar {
           width: 8px;
           height: 8px;
         }
         .scrollable-table::-webkit-scrollbar-track {
           background: #f1f5f9;
           border-radius: 4px;
         }
         .scrollable-table::-webkit-scrollbar-thumb {
           background: #cbd5e1;
           border-radius: 4px;
         }
         .scrollable-table::-webkit-scrollbar-thumb:hover {
           background: #94a3b8;
         }
         
         .dark .scrollable-table::-webkit-scrollbar-track {
           background: #374151;
         }
         .dark .scrollable-table::-webkit-scrollbar-thumb {
           background: #6b7280;
         }
         .dark .scrollable-table::-webkit-scrollbar-thumb:hover {
           background: #9ca3af;
         }
       `}</style>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showFiltersPanel 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter size={16} />
                Filters
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showExport && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Download size={16} />
                Export
              </button>
            )}
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && showFilters && (
                 <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.filter(col => col.filterable !== false).map(column => (
              <div key={column.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {column.header}
                </label>
                <input
                  type="text"
                  placeholder={`Filter ${column.header}...`}
                  value={filters[column.key] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    [column.key]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({})}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

             {/* Table Container with Scrollbar */}
       <div className="relative">
         {/* Fixed Header */}
         <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700">
           <table className="min-w-full">
                           <thead className="bg-gray-100 dark:bg-gray-800">
               <tr>
                 {showSelection && (
                   <th className="px-6 py-3 text-left">
                     <input
                       type="checkbox"
                       checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                       onChange={handleSelectAll}
                       className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                     />
                   </th>
                 )}
                 {columns.map(column => (
                   <th
                     key={column.key}
                     className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                       column.sortable !== false ? 'hover:text-gray-700 dark:hover:text-gray-300' : ''
                     }`}
                     onClick={() => column.sortable !== false && handleSort(column.key)}
                   >
                     <div className="flex items-center gap-1">
                       {column.header}
                       {column.sortable !== false && sortConfig.key === column.key && (
                         <span className="text-blue-600 dark:text-blue-400">
                           {sortConfig.direction === 'asc' ? '↑' : '↓'}
                         </span>
                       )}
                     </div>
                   </th>
                 ))}
               </tr>
             </thead>
           </table>
         </div>
         
         {/* Scrollable Body */}
         <div className={`scrollable-table overflow-y-auto ${tableHeight} overflow-x-auto`}>
           <table className="min-w-full">
                           <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
               {paginatedData.length > 0 ? (
                 paginatedData.map((row, index) => (
                   <tr
                     key={row.id || index}
                                           className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        onRowClick ? 'cursor-pointer' : ''
                      } ${selectedRows.has(row.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                     onClick={() => onRowClick?.(row)}
                   >
                     {showSelection && (
                       <td className="px-6 py-4 whitespace-nowrap">
                         <input
                           type="checkbox"
                           checked={selectedRows.has(row.id)}
                           onChange={() => handleRowSelection(row.id)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                           onClick={(e) => e.stopPropagation()}
                         />
                       </td>
                     )}
                                           {columns.map(column => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {column.render ? column.render(row) : (column.accessor ? column.accessor(row) : row[column.key])}
                        </td>
                      ))}
                   </tr>
                 ))
               ) : (
                                   <tr>
                    <td colSpan={columns.length + (showSelection ? 1 : 0)} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Search className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-lg font-medium">No data found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>

             {/* Pagination */}
       <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <span>
              Showing {startItem} to {endItem} of {sortedData.length} results
            </span>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Dropdown
                options={pageSizeOptions.map(size => ({ value: size, label: size.toString() }))}
                value={rowsPerPage}
                onChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
                size="sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
                         <button
               onClick={() => setCurrentPage(1)}
               disabled={currentPage === 1}
               className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
             >
               <ChevronsLeft size={16} />
             </button>
             <button
               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
               disabled={currentPage === 1}
               className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
             >
               <ChevronLeft size={16} />
             </button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                
                return (
                                     <button
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`px-3 py-1 text-sm rounded-md transition-colors ${
                       currentPage === page
                         ? 'bg-blue-600 text-white'
                         : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                     }`}
                   >
                     {page}
                   </button>
                );
              })}
            </div>
            
                         <button
               onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
               disabled={currentPage === totalPages}
               className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
             >
               <ChevronRight size={16} />
             </button>
             <button
               onClick={() => setCurrentPage(totalPages)}
               disabled={currentPage === totalPages}
               className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
             >
               <ChevronsRight size={16} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
