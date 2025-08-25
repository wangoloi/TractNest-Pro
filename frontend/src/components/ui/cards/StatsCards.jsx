import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { formatNumber } from '../../utils/formatNumber';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Sales',
      value: `UGX ${formatNumber(stats.totalSales)}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Total Profit',
      value: `UGX ${formatNumber(stats.totalProfit)}`,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockItems,
      icon: Package,
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          value: 'text-gray-900'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          value: 'text-gray-900'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-600',
          value: 'text-yellow-600'
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          value: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          value: 'text-gray-900'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const colors = getColorClasses(card.color);
        
        return (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${colors.value}`}>{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                <Icon size={24} className={colors.text} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
