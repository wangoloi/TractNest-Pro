export const mockSales = [
  {
    id: 1,
    customerName: 'John Smith',
    items: [{ name: 'Laptop Pro', quantity: 1, price: 1200000, total: 1200000 }],
    total: 1200000,
    profit: 400000,
    date: '2024-01-15',
    status: 'completed',
    receiptNumber: 'RCP-20240115-001',
    customerPhone: '+256 701 234 567',
    customerEmail: 'john.smith@email.com',
    paymentMethod: 'cash',
    discount: 0,
    tax: 0,
    notes: ''
  },
  {
    id: 2,
    customerName: 'Jane Doe',
    items: [{ name: 'Smartphone X', quantity: 2, price: 800000, total: 1600000 }],
    total: 1600000,
    profit: 400000,
    date: '2024-01-14',
    status: 'completed',
    receiptNumber: 'RCP-20240114-002',
    customerPhone: '+256 702 345 678',
    customerEmail: 'jane.doe@email.com',
    paymentMethod: 'mobile_money',
    discount: 5,
    tax: 2,
    notes: 'Customer requested delivery'
  }
];

export const mockInventory = [
  { 
    id: 1, 
    name: 'Laptop Pro', 
    quantity: 15, 
    price: 1200000, 
    cost: 800000, 
    status: 'in-stock',
    category: 'Electronics',
    supplier: 'Tech Solutions Ltd',
    supplierPhone: '+256 703 456 789',
    supplierEmail: 'supplier@techsolutions.com',
    dateAdded: '2024-01-01'
  },
  { 
    id: 2, 
    name: 'Smartphone X', 
    quantity: 25, 
    price: 800000, 
    cost: 600000, 
    status: 'in-stock',
    category: 'Electronics',
    supplier: 'Mobile World',
    supplierPhone: '+256 704 567 890',
    supplierEmail: 'info@mobileworld.com',
    dateAdded: '2024-01-02'
  },
  { 
    id: 3, 
    name: 'Tablet Air', 
    quantity: 8, 
    price: 500000, 
    cost: 350000, 
    status: 'in-stock',
    category: 'Electronics',
    supplier: 'Tech Solutions Ltd',
    supplierPhone: '+256 703 456 789',
    supplierEmail: 'supplier@techsolutions.com',
    dateAdded: '2024-01-03'
  },
  { 
    id: 4, 
    name: 'Wireless Headphones', 
    quantity: 2, 
    price: 150000, 
    cost: 100000, 
    status: 'low-stock',
    category: 'Accessories',
    supplier: 'Audio Pro',
    supplierPhone: '+256 705 678 901',
    supplierEmail: 'sales@audiopro.com',
    dateAdded: '2024-01-04'
  },
  { 
    id: 5, 
    name: 'Gaming Mouse', 
    quantity: 0, 
    price: 80000, 
    cost: 50000, 
    status: 'out-of-stock',
    category: 'Accessories',
    supplier: 'Gaming Gear',
    supplierPhone: '+256 706 789 012',
    supplierEmail: 'orders@gaminggear.com',
    dateAdded: '2024-01-05'
  }
];
