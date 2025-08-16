import React from 'react';

const Navigation = ({ activeTab, onTabChange }) => {
  const menuItems = [
    'Dashboard',
    'StockingPlus',
    'SalesPlus',
    'MySales',
    'MyStock',
  ];

  return (
    <nav>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menuItems.map((item) => (
          <li key={item} style={{ margin: '8px 0' }}>
            <button
              style={{
                backgroundColor: activeTab === item ? '#096735b6' : '#f0f0f0',
                color: activeTab === item ? '#fff' : '#000',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => onTabChange(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;