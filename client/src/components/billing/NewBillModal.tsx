import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import BillItemsTable from './BillItemsTable';
import { BillItem } from '../../types/billing';
import { formatIndianCurrency } from '../../utils/formatters';

interface NewBillModalProps {
  onClose: () => void;
  onSave: (items: BillItem[], discount: number) => void;
}

const NewBillModal: React.FC<NewBillModalProps> = ({ onClose, onSave }) => {
  const [items, setItems] = useState<BillItem[]>([{ 
    item: '', 
    quantity: 0,
    mrp_per_unit: 0,
    total_amount: 0
  }]);
  const [discount, setDiscount] = useState<number>(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const amountBeforeDiscount = items.reduce((sum, item) => sum + item.total_amount, 0);
  const finalAmount = amountBeforeDiscount - discount;

  const handleSave = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate items
    items.forEach((item, index) => {
      if (!item.item.trim()) {
        newErrors[`item-${index}`] = 'Item name is required';
      }
      if (item.quantity <= 0) {
        newErrors[`quantity-${index}`] = 'Quantity must be greater than 0';
      }
      if (item.mrp_per_unit <= 0) {
        newErrors[`mrp-${index}`] = 'MRP must be greater than 0';
      }
    });

    // Validate discount
    if (discount < 0) {
      newErrors.discount = 'Discount cannot be negative';
    }
    if (discount > amountBeforeDiscount) {
      newErrors.discount = 'Discount cannot be greater than total amount';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(items, discount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">New Bill</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <BillItemsTable
          items={items}
          setItems={setItems}
          errors={errors}
        />

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-gray-700">
            <span>Amount Before Discount:</span>
            <span className="font-medium">{formatIndianCurrency(amountBeforeDiscount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <label htmlFor="discount" className="text-gray-700">Discount:</label>
            <div className="w-48">
              <input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className={`w-full p-2 border rounded-lg ${
                  errors.discount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.discount && (
                <p className="text-red-500 text-sm mt-1">{errors.discount}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Final Amount:</span>
            <span>{formatIndianCurrency(finalAmount)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewBillModal;