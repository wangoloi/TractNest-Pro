import { Eye, Edit, Trash2, Printer, Copy } from "lucide-react";
import { formatAppCurrency } from "../../../../../lib/utils/formatNumber";
import ActionDropdown from "../../../../../components/ui/forms/ActionDropdown";

// Helper function to format items for display
const formatItemsForDisplay = (items) => {
  if (!items || items.length === 0) return "No items";

  if (items.length === 1) {
    return `${items[0].name} (${items[0].quantity})`;
  }

  if (items.length === 2) {
    return `${items[0].name} (${items[0].quantity}), ${items[1].name} (${items[1].quantity})`;
  }

  return `${items[0].name} (${items[0].quantity}), ${items[1].name} (${
    items[1].quantity
  }) +${items.length - 2} more`;
};

export const createSalesColumns = (isAdmin, handlers) => {
  const {
    handleViewReceipt,
    handlePrintReceipt,
    handleCopyReceiptNumber,
    handleEditSale,
    handleDeleteSaleClick
  } = handlers;

  return [
    {
      key: "date",
      header: "Date",
      accessor: (sale) => new Date(sale.date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "receiptNumber",
      header: "Receipt #",
      accessor: (sale) => sale.receiptNumber,
      sortable: true,
    },
    {
      key: "customerName",
      header: "Customer",
      accessor: (sale) => sale.customerName,
      sortable: true,
    },
    {
      key: "items",
      header: "Items",
      accessor: (sale) => formatItemsForDisplay(sale.items),
      render: (sale) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900">
            {formatItemsForDisplay(sale.items)}
          </div>
          {sale.items.length > 2 && (
            <div className="text-xs text-gray-500 mt-1">
              Click to view all {sale.items.length} items
            </div>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      key: "total",
      header: "Total",
      accessor: (sale) => formatAppCurrency(sale.total),
      sortable: true,
    },
    {
      key: "profit",
      header: "Profit",
      accessor: (sale) => formatAppCurrency(sale.profit),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (sale) => sale.status,
      render: (sale) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            sale.status === "completed"
              ? "bg-green-100 text-green-800"
              : sale.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {sale.status}
        </span>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (sale) => {
        const options = [
          {
            label: "View Receipt",
            icon: Eye,
            onClick: () => handleViewReceipt(sale),
          },
          {
            label: "Print Receipt",
            icon: Printer,
            onClick: () => handlePrintReceipt(sale),
          },
          {
            label: "Copy Receipt Number",
            icon: Copy,
            onClick: () => handleCopyReceiptNumber(sale.receiptNumber),
          },
        ];

        // Only show edit and delete options for admins
        if (isAdmin) {
          options.push(
            {
              label: "Edit Sale",
              icon: Edit,
              onClick: () => handleEditSale(sale),
            },
            {
              label: "Delete Sale",
              icon: Trash2,
              onClick: () => handleDeleteSaleClick(sale),
              danger: true,
            }
          );
        }

        return (
          <ActionDropdown
            options={options}
            buttonClassName="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          />
        );
      },
      sortable: false,
    },
  ];
};







