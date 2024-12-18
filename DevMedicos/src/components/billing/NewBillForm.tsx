import React, { useState } from 'react';
import { X } from 'lucide-react';
import BillItemsTable from './BillItemsTable';
import { BillItem } from '../../types/billing';
import { formatIndianCurrency } from '../../utils/formatters';
import axios from 'axios';

interface NewBillFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const NewBillForm: React.FC<NewBillFormProps> = ({ onClose, onSuccess }) => {
  const [items, setItems] = useState<BillItem[]>([{
    item: '',
    quantity: 0,
    mrp_per_unit: 0,
    total_amount: 0
  }]);
  const [discount, setDiscount] = useState<number>(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountBeforeDiscount = items.reduce((sum, item) => sum + item.total_amount, 0);
  const finalAmount = amountBeforeDiscount - discount;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
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

    if (discount < 0) {
      newErrors.discount = 'Discount cannot be negative';
    }
    if (discount > amountBeforeDiscount) {
      newErrors.discount = 'Discount cannot be greater than total amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map(item => ({
          item: item.item,
          quantity: item.quantity,
          mrp_per_unit: item.mrp_per_unit
        })),
        discount
      };

      await axios.post('http://localhost:3500/api/bill/addbill', payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving bill:', error);
      setErrors({ submit: 'Failed to save bill. Please try again.' });
    } finally {
      setIsSubmitting(false);
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

        {errors.submit && (
          <p className="mt-4 text-red-500 text-center">{errors.submit}</p>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Bill</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewBillForm;