import React from 'react';
import { X } from 'lucide-react';
import { BillDetails } from '../../types/billing';
import { formatIndianCurrency } from '../../utils/formatters';

interface BillDetailsModalProps {
  billNo: string;
  details: BillDetails;
  onClose: () => void;
}

const BillDetailsModal: React.FC<BillDetailsModalProps> = ({ billNo, details, onClose }) => {
  const amountBeforeDiscount = details.items.reduce((sum, item) => sum + item.total_amount, 0);
  const finalAmount = amountBeforeDiscount - details.discount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Bill Details - {billNo}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRP per Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {details.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatIndianCurrency(item.mrp_per_unit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatIndianCurrency(item.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount before discount:</span>
            <span className="text-sm font-medium">{formatIndianCurrency(amountBeforeDiscount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Discount amount:</span>
            <span className="text-sm font-medium text-green-600">
              -{formatIndianCurrency(details.discount)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-base font-medium text-gray-900">Final amount:</span>
            <span className="text-base font-bold text-gray-900">
              {formatIndianCurrency(finalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailsModal;