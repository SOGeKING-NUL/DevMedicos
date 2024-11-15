import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ShipmentForm from './ShipmentForm';
import { ShipmentItem, Shipment, ValidationErrors } from './types';

const ShipmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [items, setItems] = useState<ShipmentItem[]>([{
    invoiceNo: '',
    item: '',
    quantity: 0,
    bonus: null,
    packOf: 0,
    mrp: 0,
    rate: 0,
    amount: 0
  }]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateField = (value: any, field: keyof ShipmentItem) => {
    if (field === 'invoiceNo' && !value) return 'Invoice number is required';
    if (field === 'item' && !value) return 'Item name is required';
    if (field === 'quantity' && (value <= 0 || !value)) return 'Quantity must be greater than 0';
    if (field === 'packOf' && (value <= 0 || !value)) return 'Pack of must be greater than 0';
    if (field === 'mrp' && (value <= 0 || !value)) return 'MRP must be greater than 0';
    if (field === 'rate' && (value <= 0 || !value)) return 'Rate must be greater than 0';
    return '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: keyof ShipmentItem) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields: (keyof ShipmentItem)[] = ['invoiceNo', 'item', 'quantity', 'bonus', 'packOf', 'mrp', 'rate'];
      const currentFieldIndex = fields.indexOf(field);
      
      const currentValue = items[index][field];
      const error = validateField(currentValue, field);
      const errorKey = `${field}-${index}`;
      
      if (error) {
        setValidationErrors(prev => ({ ...prev, [errorKey]: error }));
        return;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }

      if (currentFieldIndex === fields.length - 1) {
        if (index === items.length - 1) {
          addRow();
          setTimeout(() => {
            const newRowInput = document.getElementById(`item-${index + 1}`);
            newRowInput?.focus();
          }, 0);
        }
      } else {
        const nextField = fields[currentFieldIndex + 1];
        const nextInput = document.getElementById(`${nextField}-${index}`);
        nextInput?.focus();
      }
    }
  };

  const handleItemChange = (index: number, field: keyof ShipmentItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'bonus' || field === 'rate') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const bonus = field === 'bonus' ? value : newItems[index].bonus || 0;
      const rate = field === 'rate' ? value : newItems[index].rate;
      newItems[index].amount = Number((rate * (bonus + quantity)).toFixed(2));
    }
    
    const errorKey = `${field}-${index}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
    
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, {
      invoiceNo: items[0].invoiceNo,
      item: '',
      quantity: 0,
      bonus: null,
      packOf: 0,
      mrp: 0,
      rate: 0,
      amount: 0
    }]);
  };

  const handleSubmit = () => {
    let hasErrors = false;
    const newErrors: ValidationErrors = {};

    items.forEach((item, index) => {
      Object.keys(item).forEach((field) => {
        const error = validateField(item[field as keyof ShipmentItem], field as keyof ShipmentItem);
        if (error) {
          hasErrors = true;
          newErrors[`${field}-${index}`] = error;
        }
      });
    });

    if (hasErrors) {
      setValidationErrors(newErrors);
      return;
    }

    const newShipment: Shipment = {
      id: Date.now(),
      createdOn: new Date().toISOString().split('T')[0],
      items: [...items]
    };
    
    setShipments([...shipments, newShipment]);
    setShowForm(false);
    setItems([{
      invoiceNo: '',
      item: '',
      quantity: 0,
      bonus: null,
      packOf: 0,
      mrp: 0,
      rate: 0,
      amount: 0
    }]);
    setValidationErrors({});
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Shipment Management</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shipment</span>
          </button>
        </div>

        {showForm && (
          <ShipmentForm
            items={items}
            validationErrors={validationErrors}
            onClose={() => setShowForm(false)}
            onItemChange={handleItemChange}
            onKeyDown={handleKeyDown}
            onAddRow={addRow}
            onSubmit={handleSubmit}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.createdOn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.items[0].invoiceNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${shipment.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default ShipmentPage;