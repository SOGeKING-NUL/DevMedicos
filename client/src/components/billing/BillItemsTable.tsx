import React, { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { BillItem } from '../../types/billing';
import { formatIndianCurrency } from '../../utils/formatters';
import AutocompleteInput from './AutocompleteInput';

interface BillItemsTableProps {
  items: BillItem[];
  setItems: React.Dispatch<React.SetStateAction<BillItem[]>>;
  errors: {[key: string]: string};
}

const BillItemsTable: React.FC<BillItemsTableProps> = ({ items, setItems, errors }) => {
  const inputRefs = useRef<{[key: string]: HTMLInputElement}>({});
  const [validSelections, setValidSelections] = React.useState<{[key: number]: boolean}>({});

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current['item-0']?.focus();
  }, []);

  const handleKeyDown = (index: number, field: keyof BillItem, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const fields: (keyof BillItem)[] = ['item', 'quantity'];
      const currentFieldIndex = fields.indexOf(field);
      
      // Only proceed if we have a valid item selection when moving from item field
      if (field === 'item' && !validSelections[index]) {
        return;
      }

      if (currentFieldIndex < fields.length - 1) {
        // Move to next field in same row
        const nextField = fields[currentFieldIndex + 1];
        inputRefs.current[`${nextField}-${index}`]?.focus();
      } else if (index === items.length - 1) {
        // Add new row and focus its first field
        handleAddRow();
        setTimeout(() => {
          inputRefs.current[`item-${index + 1}`]?.focus();
        }, 0);
      } else {
        // Move to first field of next row
        inputRefs.current[`item-${index + 1}`]?.focus();
      }
    }
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: string, mrp?: number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'quantity') {
      const quantity = parseInt(value) || 0;
      item.quantity = quantity;
      item.total_amount = quantity * item.mrp_per_unit;
    } else if (field === 'item') {
      item.item = value;
      if (mrp !== undefined) {
        item.mrp_per_unit = mrp;
        item.total_amount = item.quantity * mrp;
      }
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const handleAddRow = () => {
    setItems([...items, { item: '', quantity: 0, mrp_per_unit: 0, total_amount: 0 }]);
  };

  const handleDeleteRow = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      
      // Update validSelections
      const newValidSelections = { ...validSelections };
      delete newValidSelections[index];
      setValidSelections(newValidSelections);
    }
  };

  const handleValidSelection = (index: number, isValid: boolean) => {
    setValidSelections(prev => ({
      ...prev,
      [index]: isValid
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MRP
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={index}>
              <td className="px-4 py-2">
                <AutocompleteInput
                  value={item.item}
                  onChange={(value, mrp) => handleItemChange(index, 'item', value, mrp)}
                  onKeyDown={(e) => handleKeyDown(index, 'item', e)}
                  error={errors[`item-${index}`]}
                  placeholder="Enter item name"
                  inputRef={el => { if (el) inputRefs.current[`item-${index}`] = el }}
                  onValidSelection={(isValid) => handleValidSelection(index, isValid)}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  ref={el => { if (el) inputRefs.current[`quantity-${index}`] = el }}
                  type="number"
                  min="0"
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, 'quantity', e)}
                  className={`w-full p-2 border rounded-lg ${
                    errors[`quantity-${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                  disabled={!validSelections[index]}
                />
                {errors[`quantity-${index}`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`quantity-${index}`]}</p>
                )}
              </td>
              <td className="px-4 py-2">
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {formatIndianCurrency(item.mrp_per_unit)}
                </div>
              </td>
              <td className="px-4 py-2">
                <span className="text-gray-900 font-medium">
                  {formatIndianCurrency(item.total_amount)}
                </span>
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleDeleteRow(index)}
                  className="text-red-600 hover:text-red-700"
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleAddRow}
        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Add Another Item
      </button>
    </div>
  );
};

export default BillItemsTable;