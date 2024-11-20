import React, { useState, useRef } from 'react';
import { Plus, X, Search, Eye, Trash2 } from 'lucide-react';
import { saveShipments, ShipmentData } from '../services/shipmentService';

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

const ShipmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [items, setItems] = useState<ShipmentItem[]>([{...emptyItem}]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  const validateField = (value: string) => value.trim() !== '';

  const handleKeyDown = (index: number, field: keyof ShipmentItem, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const currentValue = (e.target as HTMLInputElement).value;
      let isValid = true;

      if (field !== 'bonus' && !validateField(currentValue)) {
        setValidationErrors(prev => ({
          ...prev,
          [`${field}-${index}`]: true
        }));
        isValid = false;
      }

      if (isValid) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`${field}-${index}`];
          return newErrors;
        });

        const fieldOrder: (keyof ShipmentItem)[] = ['itemName', 'quantity', 'bonus', 'packOf', 'mrp', 'rate'];
        const currentFieldIndex = fieldOrder.indexOf(field);

        if (currentFieldIndex < fieldOrder.length - 1) {
          const nextField = fieldOrder[currentFieldIndex + 1];
          inputRefs.current[`${nextField}-${index}`]?.focus();
        } else if (index < items.length - 1) {
          inputRefs.current[`itemName-${index + 1}`]?.focus();
        }
      }
    }
  };

  const handleItemChange = (index: number, field: keyof ShipmentItem, value: string) => {
    if (['quantity', 'bonus', 'packOf'].includes(field)) {
      if (value && !Number.isInteger(Number(value))) {
        return;
      }
    }
    
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

    if (invoiceId) {
      const shipmentData: ShipmentData = {
        invoice_no: invoiceId,
        quantity: parseInt(newItems[index].quantity) || 0,
        bonus: parseInt(newItems[index].bonus) || 0,
        pack_of: parseInt(newItems[index].packOf) || 0,
        item: newItems[index].itemName,
        mrp: parseFloat(newItems[index].mrp) || 0,
        rate: parseFloat(newItems[index].rate) || 0
      };
      localStorage.setItem(`shipment_${invoiceId}_${index}`, JSON.stringify(shipmentData));
    }

    if (index === items.length - 1 && 
        validateField(newItems[index].itemName) &&
        validateField(newItems[index].quantity) &&
        validateField(newItems[index].packOf) &&
        validateField(newItems[index].mrp) &&
        validateField(newItems[index].rate)) {
      addRow();
    }
  };

  const deleteRow = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);

      if (invoiceId) {
        localStorage.removeItem(`shipment_${invoiceId}_${index}`);
      }
    }
  };

  const addRow = () => {
    setItems([...items, {...emptyItem}]);
  };

  const formatShipmentData = (validItems: ShipmentItem[]): ShipmentData[] => {
    return validItems.map(item => ({
      invoice_no: invoiceId,
      quantity: parseInt(item.quantity) || 0,
      bonus: parseInt(item.bonus) || 0,
      pack_of: parseInt(item.packOf) || 0,
      item: item.itemName,
      mrp: parseFloat(item.mrp) || 0,
      rate: parseFloat(item.rate) || 0
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const errors: {[key: string]: boolean} = {};
    let hasError = false;

    if (!validateField(invoiceId)) {
      errors['invoiceId'] = true;
      hasError = true;
    }

    const validItems = items.filter(item => {
      const isValid = validateField(item.itemName) &&
                     validateField(item.quantity) &&
                     validateField(item.packOf) &&
                     validateField(item.mrp) &&
                     validateField(item.rate);
      
      if (!isValid && (validateField(item.itemName) || validateField(item.quantity) || 
          validateField(item.packOf) || validateField(item.mrp) || validateField(item.rate))) {
        hasError = true;
        if (!validateField(item.itemName)) errors[`itemName-${items.indexOf(item)}`] = true;
        if (!validateField(item.quantity)) errors[`quantity-${items.indexOf(item)}`] = true;
        if (!validateField(item.packOf)) errors[`packOf-${items.indexOf(item)}`] = true;
        if (!validateField(item.mrp)) errors[`mrp-${items.indexOf(item)}`] = true;
        if (!validateField(item.rate)) errors[`rate-${items.indexOf(item)}`] = true;
      }
      return isValid;
    });

    setValidationErrors(errors);

    if (!hasError && validItems.length > 0) {
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const shipmentData = formatShipmentData(validItems);
        await saveShipments(shipmentData);

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
        setShowSuccess(true);

        for (let i = 0; i < items.length; i++) {
          localStorage.removeItem(`shipment_${invoiceId}_${i}`);
        }

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } catch (error) {
        setErrorMessage('Failed to save shipment. Please try again.');
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredShipments = shipments.filter(shipment => 
    shipment.date.includes(searchTerm) || 
    shipment.invoiceId.includes(searchTerm)
  );

  return (
    <main className="container mx-auto px-4 py-8">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          Successfully added shipment
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          {errorMessage}
        </div>
      )}

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
                <h3 className="text-lg font-bold">
                  New Shipment - {new Date().toLocaleDateString()}
                </h3>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && validateField(invoiceId)) {
                      inputRefs.current['itemName-0']?.focus();
                    }
                  }}
                  className={`w-full p-2 border rounded ${
                    validationErrors['invoiceId'] ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Enter Invoice ID"
                />
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
                            ref={el => { if (el) inputRefs.current[`itemName-${index}`] = el }}
                            onKeyDown={(e) => handleKeyDown(index, 'itemName', e)}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`itemName-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            ref={el => { if (el) inputRefs.current[`quantity-${index}`] = el }}
                            onKeyDown={(e) => handleKeyDown(index, 'quantity', e)}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`quantity-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.bonus}
                            onChange={(e) => handleItemChange(index, 'bonus', e.target.value)}
                            ref={el => { if (el) inputRefs.current[`bonus-${index}`] = el }}
                            onKeyDown={(e) => handleKeyDown(index, 'bonus', e)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.packOf}
                            onChange={(e) => handleItemChange(index, 'packOf', e.target.value)}
                            ref={el => { if (el) inputRefs.current[`packOf-${index}`] = el }}
                            onKeyDown={(e) => handleKeyDown(index, 'packOf', e)}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`packOf-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.mrp}
                            onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
                            ref={el => { if (el) inputRefs.current[`mrp-${index}`] = el }}
                            onKeyDown={(e) => handleKeyDown(index, 'mrp', e)}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`mrp-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            ref={el => { if (el) inputRefs.current[`rate-${index}`] = el }}
                            onKeyDown={(e) => handleKeyDown(index, 'rate', e)}
                            className={`w-full p-1 border rounded ${
                              validationErrors[`rate-${index}`] ? 'border-red-500 bg-red-50' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-medium">{formatIndianCurrency(item.amount)}</span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => deleteRow(index)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Row"
                          >
                            <Trash2 className="h-4 w-4" />
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
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Shipment'}
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </main>
  );
};

export default ShipmentPage;