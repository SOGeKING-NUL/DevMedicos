import React from 'react';
import { Eye } from 'lucide-react';
import { formatIndianCurrency, formatDateTime } from '../../utils/formatters';
import { Bill } from '../../types/billing';

interface BillingTableProps {
  bills: Bill[];
  onViewDetails: (billNo: string) => void;
}

const BillingTable: React.FC<BillingTableProps> = ({ bills, onViewDetails }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bills.map((bill) => (
            <tr key={bill.bill_no} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDateTime(bill.created_on)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.bill_no}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.item_count}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatIndianCurrency(bill.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button
                  onClick={() => onViewDetails(bill.bill_no)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No bills found matching your search criteria
        </div>
      )}
    </div>
  );
};

export default BillingTable;