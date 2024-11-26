import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, Eye, Trash2, RefreshCw } from 'lucide-react';
import ShipmentPagination from './ShipmentPagination';
import axios from 'axios';
import { fetchShipmentDetails, ShipmentDetail } from './fetchShipmentDetails';

interface ShipmentItem {
  itemName: string;
  quantity: string;
  bonus: string;
  packOf: string;
  mrp: string;
  rate: string;
  amount: number;
}

interface ShipmentDetailsItem {
  item: string;
  quantity: number;
  bonus: number;
  pack_of: number;
  mrp: number;
  rate: number;
  amount: number;
}

// interface Shipment {
//   id: string;
//   date: string;
//   invoiceId: string;
//   items: ShipmentItem[];
//   totalAmount: number;
// }

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

const ITEMS_PER_PAGE = 10;

const ShipmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetail[]>([]);
  const [items, setItems] = useState<ShipmentItem[]>([{...emptyItem}]);
  const [invoiceId, setInvoiceId] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedShipmentDetails, setSelectedShipmentDetails] = useState<ShipmentDetailsItem[] | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await fetchShipmentDetails();
      setShipmentDetails(details);
    } catch (err) {
      setError('Failed to fetch shipment details. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchShipmentDetailsData = async (invoiceNo: string) => {
    setIsLoadingDetails(true);
    setDetailsError(null);
    try {
      const response = await axios.get('http://localhost:3500/api/shipments/getshipment', {
        params: { invoice_no: invoiceNo }
      });
      setSelectedShipmentDetails(response.data);
    } catch (err) {
      setDetailsError('Failed to fetch shipment details. Please try again.');
      console.error('Error fetching shipment details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

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
          // Move to next field in the same row
          const nextField = fieldOrder[currentFieldIndex + 1];
          inputRefs.current[`${nextField}-${index}`]?.focus();
        } else if (index === items.length - 1) {
          // If we're at the last field of the last row, add a new row
          addRow();
          // Focus on the first field of the new row after a short delay
          setTimeout(() => {
            inputRefs.current[`itemName-${index + 1}`]?.focus();
          }, 0);
        } else {
          // Move to first field of next row
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
      // const bonus = parseInt(newItems[index].bonus) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = rate * quantity;
    }
    
    setItems(newItems);
  };

  const deleteRow = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const addRow = () => {
    setItems([...items, {...emptyItem}]);
  };

  const formatShipmentData = () => {
    return items
      .filter(item => 
        validateField(item.itemName) &&
        validateField(item.quantity) &&
        validateField(item.packOf) &&
        validateField(item.mrp) &&
        validateField(item.rate)
      )
      .map(item => ({
        invoice_no: invoiceId,
        quantity: parseInt(item.quantity),
        bonus: parseInt(item.bonus) || 0,
        pack_of: parseInt(item.packOf),
        item: item.itemName,
        mrp: parseFloat(item.mrp),
        rate: parseFloat(item.rate)
      }));
  };

  const handleSubmit = async () => {
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
      setError(null);

      try {
        const formattedData = formatShipmentData();
        await axios.post('http://localhost:3500/api/shipments/addshipments', formattedData);
        
        setShowForm(false);
        setItems([{...emptyItem}]);
        setInvoiceId('');
        setValidationErrors({});
        setShowSuccess(true);
        
        // Refresh the shipment list
        await fetchData();

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while saving the shipment');
        console.error('Error saving shipment:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleViewDetails = async (invoiceNo: string) => {
    setShowDetails(invoiceNo);
    await fetchShipmentDetailsData(invoiceNo);
  };

  const filteredShipments = shipmentDetails.filter(shipment =>
    shipment.date.includes(searchTerm) ||
    shipment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentShipments = filteredShipments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          Successfully added shipment
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                    <span>Save Shipment</span>
                  )}
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
              {currentShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(shipment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.invoiceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianCurrency(shipment.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.itemCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleViewDetails(shipment.invoiceId)}
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

        {filteredShipments.length > ITEMS_PER_PAGE && (
          <ShipmentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Shipment Details</h3>
                <button onClick={() => {
                  setShowDetails(null);
                  setSelectedShipmentDetails(null);
                  setDetailsError(null);
                }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isLoadingDetails && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {detailsError && (
                <div className="text-red-600 text-center py-4">{detailsError}</div>
              )}

              {selectedShipmentDetails && !isLoadingDetails && !detailsError && (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pack Of</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRP</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedShipmentDetails.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{item.item}</td>
                            <td className="px-4 py-2 text-sm">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm">{item.bonus}</td>
                            <td className="px-4 py-2 text-sm">{item.pack_of}</td>
                            <td className="px-4 py-2 text-sm">{formatIndianCurrency(item.mrp)}</td>
                            <td className="px-4 py-2 text-sm">{formatIndianCurrency(item.rate)}</td>
                            <td className="px-4 py-2 text-sm">{formatIndianCurrency(item.amount)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td colSpan={6} className="px-4 py-2 text-right">Total:</td>
                          <td className="px-4 py-2">
                            {formatIndianCurrency(
                              selectedShipmentDetails.reduce((sum, item) => sum + item.amount, 0)
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setShowDetails(null);
                        setSelectedShipmentDetails(null);
                        setDetailsError(null);
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ShipmentPage;