import React, { useState } from 'react';
import { X } from 'lucide-react';
import BillItemsTable from './BillItemsTable';
import { BillItem } from '../../types/billing';
import { formatIndianCurrency } from '../../utils/formatters';
import axios from 'axios';

interface ReturnItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ReturnItemForm: React.FC<ReturnItemFormProps> = ({ onClose, onSuccess }) => {
  const [items, setItems] = useState<BillItem[]>([{
    item: '',
    quantity: 0,
    mrp_per_unit: 0,
    total_amount: 0
  }]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.total_amount, 0);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Process each item return sequentially
      for (const item of items) {
        const addPayload = {
          invoice_no: "return",
          item: item.item,
          total_units: item.quantity,
          rate_per_unit: item.mrp_per_unit
        };
        const returnPayload = {
            item: item.item,
            units: item.quantity,
            rate_per_unit: item.mrp_per_unit
          };

        await axios.post('http://localhost:3500/api/inventory/addinventory', addPayload);
        await axios.post('http://localhost:3500/api/bill/addreturnitem', returnPayload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing return:', error);
      setErrors({ 
        submit: 'Failed to process return. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Return Item</h3>
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
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount:</span>
            <span>{formatIndianCurrency(totalAmount)}</span>
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
            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing Return...</span>
              </>
            ) : (
              <span>Return</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnItemForm;