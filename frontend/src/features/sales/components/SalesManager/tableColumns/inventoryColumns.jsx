import { Eye, Edit, Trash2, Package, DollarSign, Users, Copy } from "lucide-react";
import ActionDropdown from "../../../../../components/ui/forms/ActionDropdown";

export const createInventoryColumns = (isAdmin, handlers) => {
  const {
    handleViewDetails,
    handleEditStock,
    handleUpdateQuantity,
    handleUpdatePricing,
    handleUpdateSupplier,
    handleDuplicateItem,
    handleDeleteStockClick
  } = handlers;

  return [
    {
      key: "name",
      header: "Item Name",
      accessor: (item) => item.name,
      sortable: true,
    },
    {
      key: "category",
      header: "Category",
      accessor: (item) => item.category,
      sortable: true,
    },
    {
      key: "quantity",
      header: "Quantity",
      accessor: (item) => item.quantity,
      render: (item) => (
        <span
          className={`font-medium ${
            item.quantity > 10
              ? "text-green-600"
              : item.quantity > 0
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {item.quantity}
        </span>
      ),
      sortable: true,
    },
    {
      key: "price",
      header: "Selling Price",
      accessor: (item) => `UGX ${item.price.toLocaleString()}`,
      sortable: true,
    },
    {
      key: "cost",
      header: "Cost Price",
      accessor: (item) => `UGX ${item.cost.toLocaleString()}`,
      sortable: true,
    },
    {
      key: "profit",
      header: "Profit/Unit",
      accessor: (item) => `UGX ${(item.price - item.cost).toLocaleString()}`,
      render: (item) => (
        <span
          className={`font-medium ${
            item.price - item.cost >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          UGX {(item.price - item.cost).toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (item) => item.status,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "in-stock"
              ? "bg-green-100 text-green-800"
              : item.status === "low-stock"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.status}
        </span>
      ),
      sortable: true,
    },
    {
      key: "supplier",
      header: "Supplier",
      accessor: (item) => item.supplier,
      sortable: true,
    },
    {
      key: "dateAdded",
      header: "Date Added",
      accessor: (item) => new Date(item.dateAdded).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => {
        const options = [];

        // Add view-only options for all users
        options.push(
          {
            label: "View Details",
            icon: Eye,
            onClick: () => handleViewDetails(item),
          }
        );

        // Only show edit and delete options for admins
        if (isAdmin) {
          options.push(
            {
              label: "Edit Stock Item",
              icon: Edit,
              onClick: () => handleEditStock(item),
            },
            {
              label: "Update Quantity",
              icon: Package,
              onClick: () => handleUpdateQuantity(item),
            },
            {
              label: "Update Pricing",
              icon: DollarSign,
              onClick: () => handleUpdatePricing(item),
            },
            {
              label: "Update Supplier Info",
              icon: Users,
              onClick: () => handleUpdateSupplier(item),
            },
            {
              label: "Duplicate Item",
              icon: Copy,
              onClick: () => handleDuplicateItem(item),
            },
            {
              label: "Delete Stock",
              icon: Trash2,
              onClick: () => handleDeleteStockClick(item),
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

