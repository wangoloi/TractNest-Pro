import React from 'react';

const MySales = ({ salesRecords }) => {
  const [filter, setFilter] = React.useState('Daily');

  const getFilteredSales = () => {
    const now = new Date();

    return salesRecords.filter((record) => {
      const recordDate = new Date(record.date);
      switch (filter) {
        case 'Daily': {
          return (
            recordDate.getDate() === now.getDate() &&
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear()
          );
        }
        case 'Weekly': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
          return recordDate >= startOfWeek && recordDate <= endOfWeek;
        }
        case 'Monthly': {
          return (
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear()
          );
        }
        case 'Yearly':
          return recordDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredSales = getFilteredSales();

  // Calculate total profit for filtered sales
  const totalProfit = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.totalProfit || 0), 0);

  const handlePrint = () => {
    const printContent = document.getElementById('sales-print-area').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.writeln('<html><head><title>Print Sales</title></head><body>');
    printWindow.document.writeln(printContent);
    printWindow.document.writeln('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
      <h2>My Sales</h2>
      {/* filter buttons */}
      <div style={{ marginBottom: '20px' }}>
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period) => (
          <button
            key={period}
            style={{
              marginRight: '8px',
              padding: '8px 16px',
              backgroundColor: filter === period ? '#007bff' : '#f0f0f0',
              color: filter === period ? '#fff' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => setFilter(period)}
          >
            {period}
          </button>
        ))}
        <button
          style={{
            padding: '8px 16px',
            marginLeft: '20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={handlePrint}
        >
          Print
        </button>
      </div>
      {/* Sales Table */}
      <div id="sales-print-area">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Product Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Quantity</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Sale Price</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Profit</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{sale.productName}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{sale.quantity}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>UGX{/*Math.round*/ function formatNumber(num){return new Intl.NumberFormat(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(num);}(sale.salePrice)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>UGX{/*Math.round*/ function formatNumber(num){return new Intl.NumberFormat(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(num);}(sale.total)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>UGX{/*Math.round*/ function formatNumber(num){return new Intl.NumberFormat(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(num);}(sale.totalProfit)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '8px' }}>No sales data for {filter}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <h3>Total Profit: UGX {/*Math.round*/ function formatNumber(num){return new Intl.NumberFormat(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(num);}(totalProfit)}</h3>
      </div>
    </div>
  );
};

export default MySales;