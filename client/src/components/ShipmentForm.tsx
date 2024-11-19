import React from 'react';
import { X, Plus } from 'lucide-react';
import { ShipmentItem, ValidationErrors } from './types';

interface ShipmentFormProps {
  items: ShipmentItem[];
  validationErrors: ValidationErrors;
  onClose: () => void;
  onItemChange: (index: number, field: keyof ShipmentItem, value: any) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: keyof ShipmentItem) => void;
  onAddRow: () => void;
  onSubmit: () => void;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({
  items,
  validationErrors,
  onClose,
  onItemChange,
  onKeyDown,
  onAddRow,
  onSubmit
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Enter Invoice Number"
            value={items[0]?.invoiceNo || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              items.forEach((_, index) => {
                onItemChange(index, 'invoiceNo', newValue);
              });
            }}
            className="text-lg font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none"
          />
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name*</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity*</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pack Of*</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRP*</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate*</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <input
                        id={`item-${index}`}
                        type="text"
                        value={item.item}
                        onChange={(e) => onItemChange(index, 'item', e.target.value)}
                        onKeyDown={(e) => onKeyDown(e, index, 'item')}
                        className="w-full p-1 border rounded"
                      />
                      {validationErrors[`item-${index}`] && (
                        <span className="text-red-500 text-xs mt-1">{validationErrors[`item-${index}`]}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <input
                        id={`quantity-${index}`}
                        type="number"
                        min="0"
                        value={item.quantity || ''}
                        onChange={(e) => onItemChange(index, 'quantity', e.target.value ? parseInt(e.target.value) : 0)}
                        onKeyDown={(e) => onKeyDown(e, index, 'quantity')}
                        className="w-full p-1 border rounded"
                      />
                      {validationErrors[`quantity-${index}`] && (
                        <span className="text-red-500 text-xs mt-1">{validationErrors[`quantity-${index}`]}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      id={`bonus-${index}`}
                      type="number"
                      min="0"
                      value={item.bonus ?? ''}
                      onChange={(e) => onItemChange(index, 'bonus', e.target.value ? parseInt(e.target.value) : null)}
                      onKeyDown={(e) => onKeyDown(e, index, 'bonus')}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <input
                        id={`packOf-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.packOf || ''}
                        onChange={(e) => onItemChange(index, 'packOf', e.target.value ? parseFloat(e.target.value) : 0)}
                        onKeyDown={(e) => onKeyDown(e, index, 'packOf')}
                        className="w-full p-1 border rounded"
                      />
                      {validationErrors[`packOf-${index}`] && (
                        <span className="text-red-500 text-xs mt-1">{validationErrors[`packOf-${index}`]}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <input
                        id={`mrp-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.mrp || ''}
                        onChange={(e) => onItemChange(index, 'mrp', e.target.value ? parseFloat(e.target.value) : 0)}
                        onKeyDown={(e) => onKeyDown(e, index, 'mrp')}
                        className="w-full p-1 border rounded"
                      />
                      {validationErrors[`mrp-${index}`] && (
                        <span className="text-red-500 text-xs mt-1">{validationErrors[`mrp-${index}`]}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <input
                        id={`rate-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate || ''}
                        onChange={(e) => onItemChange(index, 'rate', e.target.value ? parseFloat(e.target.value) : 0)}
                        onKeyDown={(e) => onKeyDown(e, index, 'rate')}
                        className="w-full p-1 border rounded"
                      />
                      {validationErrors[`rate-${index}`] && (
                        <span className="text-red-500 text-xs mt-1">{validationErrors[`rate-${index}`]}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="font-medium">₹{item.amount.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={onAddRow}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Row</span>
          </button>
          <div className="text-right">
            <p className="text-lg font-bold">
              Total Amount: ₹{items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Shipment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentForm;