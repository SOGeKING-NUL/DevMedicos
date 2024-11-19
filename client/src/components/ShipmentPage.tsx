import React, { useState, useRef } from 'react';
import { Plus, X, Search, Eye, Trash2 } from 'lucide-react';

interface ShipmentItem {
  itemName: string;
  quantity: string;
  bonus: string;
  packOf: string;
  mrp: string;
  rate: string;
  amount: number;
}

interface Shipment {
  id: string;
  date: string;
  totalAmount: number;
  invoiceId: string;
  items: ShipmentItem[];
}

const emptyItem: ShipmentItem = {
  itemName: '',
  quantity: '',
  bonus: '',
  packOf: '',
  mrp: '',
  rate: '',
  amount: 0
};

const formatIndianCurrency = (number: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);
};

const validateField = (value: any, field: keyof ShipmentItem) => {
  if (field === 'itemName' && !value) return 'Item name is required';
  if (field === 'quantity' && (value <= 0 || !value)) return 'Quantity must be greater than 0';
  if (field === 'packOf' && (value <= 0 || !value)) return 'Pack of must be greater than 0';
  if (field === 'mrp' && (value <= 0 || !value)) return 'MRP must be greater than 0';
  if (field === 'rate' && (value <= 0 || !value)) return 'Rate must be greater than 0';
  return '';
};

const ShipmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [items, setItems] = useState<ShipmentItem[]>([{...emptyItem}]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: keyof ShipmentItem) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields: (keyof ShipmentItem)[] = ['itemName', 'quantity', 'bonus', 'packOf', 'mrp', 'rate'];
      const currentFieldIndex = fields.indexOf(field);
      
      const currentValue = items[index][field];
      const error = validateField(currentValue, field);
      
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [`${field}-${index}`]: error
        }));
        return;
      }

      // Clear validation error if field is valid
      if (validationErrors[`${field}-${index}`]) {
        const newErrors = { ...validationErrors };
        delete newErrors[`${field}-${index}`];
        setValidationErrors(newErrors);
      }

      // Move to next field
      if (currentFieldIndex < fields.length - 1) {
        // Move to next field in same row
        const nextField = fields[currentFieldIndex + 1];
        inputRefs.current[`${nextField}-${index}`]?.focus();
      } else if (index < items.length - 1) {
        // Move to first field of next row
        inputRefs.current[`itemName-${index + 1}`]?.focus();
      }
    }
  };

  const handleDeleteRow = (indexToDelete: number) => {
    if (items.length === 1) {
      return;
    }
    
    const newItems = items.filter((_, index) => index !== indexToDelete);
    setItems(newItems);

    const newErrors = { ...validationErrors };
    Object.keys(newErrors).forEach(key => {
      if (key.endsWith(`-${indexToDelete}`)) {
        delete newErrors[key];
      }
    });
    setValidationErrors(newErrors);
  };

  const handleItemChange = (index: number, field: keyof ShipmentItem, value: string) => {
    // Validate integer inputs
    if (['quantity', 'bonus', 'packOf'].includes(field)) {
      if (value && !Number.isInteger(Number(value))) {
        return;
      }
    }
    
    // Validate decimal inputs for mrp and rate
    if (['mrp', 'rate'].includes(field)) {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'bonus' || field === 'rate') {
      const quantity = parseInt(newItems[index].quantity) || 0;
      const bonus = parseInt(newItems[index].bonus) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = rate * (bonus + quantity);
    }
    
    setItems(newItems);

    // Validate the field
    const error = validateField(value, field);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [`${field}-${index}`]: error
      }));
    } else {
      const newErrors = { ...validationErrors };
      delete newErrors[`${field}-${index}`];
      setValidationErrors(newErrors);
    }

    // If all required fields are filled in the last row, add a new row
    if (index === items.length - 1 && 
        !validateField(newItems[index].itemName, 'itemName') &&
        !validateField(newItems[index].quantity, 'quantity') &&
        !validateField(newItems[index].packOf, 'packOf') &&
        !validateField(newItems[index].mrp, 'mrp') &&
        !validateField(newItems[index].rate, 'rate')) {
      setItems([...newItems, {...emptyItem}]);
    }
  };

  const handleSubmit = () => {
    if (!invoiceId.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        invoiceId: 'Invoice ID is required'
      }));
      return;
    }

    const validItems = items.filter(item => {
      return !validateField(item.itemName, 'itemName') &&
             !validateField(item.quantity, 'quantity') &&
             !validateField(item.packOf, 'packOf') &&
             !validateField(item.mrp, 'mrp') &&
             !validateField(item.rate, 'rate');
    });

    if (validItems.length > 0) {
      const totalAmount = validItems.reduce((sum, item) => sum + item.amount, 0);
      const newShipment: Shipment = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        totalAmount,
        invoiceId,
        items: validItems
      };
      
      setShipments([...shipments, newShipment]);
      setShowForm(false);
      setItems([{...emptyItem}]);
      setInvoiceId('');
      setValidationErrors({});
    }
  };

  const filteredShipments = shipments.filter(shipment => 
    shipment.date.includes(searchTerm) || 
    shipment.invoiceId.includes(searchTerm)
  );

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

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Date or Invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">New Shipment</h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice ID
                </label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className={`w-full p-2 border rounded ${
                    validationErrors.invoiceId ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Enter Invoice ID"
                />
                {validationErrors.invoiceId && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.invoiceId}</p>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pack Of</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'itemName')}
                            ref={el => { if (el) inputRefs.current[`itemName-${index}`] = el; }}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`itemName-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                          {validationErrors[`itemName-${index}`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`itemName-${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'quantity')}
                            ref={el => { if (el) inputRefs.current[`quantity-${index}`] = el; }}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`quantity-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                          {validationErrors[`quantity-${index}`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`quantity-${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.bonus}
                            onChange={(e) => handleItemChange(index, 'bonus', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'bonus')}
                            ref={el => { if (el) inputRefs.current[`bonus-${index}`] = el; }}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.packOf}
                            onChange={(e) => handleItemChange(index, 'packOf', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'packOf')}
                            ref={el => { if (el) inputRefs.current[`packOf-${index}`] = el; }}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`packOf-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                          {validationErrors[`packOf-${index}`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`packOf-${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.mrp}
                            onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'mrp')}
                            ref={el => { if (el) inputRefs.current[`mrp-${index}`] = el; }}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`mrp-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                          {validationErrors[`mrp-${index}`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`mrp-${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'rate')}
                            ref={el => { if (el) inputRefs.current[`rate-${index}`] = el; }}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`rate-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                          {validationErrors[`rate-${index}`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`rate-${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-medium">{formatIndianCurrency(item.amount)}</span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleDeleteRow(index)}
                            disabled={items.length === 1}
                            className={`p-1 rounded hover:bg-red-100 ${
                              items.length === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'
                            }`}
                            title={items.length === 1 ? "Can't delete the last row" : "Delete row"}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right">
                <p className="text-lg font-bold">
                  Total Amount: {formatIndianCurrency(items.reduce((sum, item) => sum + item.amount, 0))}
                </p>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Shipment
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(shipment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.invoiceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianCurrency(shipment.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.items.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => setShowDetails(shipment.id)}
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
        </div>

        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  Shipment Details - {new Date(shipments.find(s => s.id === showDetails)?.date || '').toLocaleDateString()}
                </h3>
                <button onClick={() => setShowDetails(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">
                  Invoice ID: {shipments.find(s => s.id === showDetails)?.invoiceId}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pack Of</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shipments.find(s => s.id === showDetails)?.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{item.itemName}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.bonus}</td>
                        <td className="px-4 py-2">{item.packOf}</td>
                        <td className="px-4 py-2">{formatIndianCurrency(parseFloat(item.mrp))}</td>
                        <td className="px-4 py-2">{formatIndianCurrency(parseFloat(item.rate))}</td>
                        <td className="px-4 py-2">{formatIndianCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ShipmentPage;