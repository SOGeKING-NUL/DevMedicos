import React from 'react';

interface InventoryItem {
  item: string;
  units: number;
  mrp: number;
}

interface InventoryTableProps {
  items: InventoryItem[];
  formatCurrency: (value: number) => string;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, formatCurrency }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.item}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.units}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.mrp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items found matching your search criteria
        </div>
      )}
    </div>
  );
};

export default InventoryTable;