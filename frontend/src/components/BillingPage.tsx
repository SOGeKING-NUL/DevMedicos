import React, { useState } from 'react';
import { Search, Plus, X, Eye } from 'lucide-react';

interface BillItem {
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Bill {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  totalAmount: number;
  paymentMethod: string;
}

const formatIndianCurrency = (number: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);
};

const BillingPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newBill, setNewBill] = useState<Bill>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    items: [{ itemName: '', quantity: 0, rate: 0, amount: 0 }],
    totalAmount: 0,
    paymentMethod: 'cash'
  });

  const handleItemChange = (index: number, field: keyof BillItem, value: string) => {
    const updatedItems = [...newBill.items];
    const item = { ...updatedItems[index] };

    if (field === 'quantity') {
      item.quantity = parseInt(value) || 0;
    } else if (field === 'rate') {
      item.rate = parseFloat(value) || 0;
    } else {
      (item as any)[field] = value;
    }

    item.amount = item.quantity * item.rate;
    updatedItems[index] = item;

    const totalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    setNewBill({ ...newBill, items: updatedItems, totalAmount });

    // Add new row if last row is being filled
    if (index === newBill.items.length - 1 && item.itemName && item.quantity && item.rate) {
      setNewBill(prev => ({
        ...prev,
        items: [...prev.items, { itemName: '', quantity: 0, rate: 0, amount: 0 }]
      }));
    }
  };

  const handleSubmit = () => {
    if (newBill.customerName && newBill.customerPhone && newBill.items.some(item => item.amount > 0)) {
      const billToAdd = {
        ...newBill,
        id: Date.now().toString(),
        items: newBill.items.filter(item => item.amount > 0)
      };
      setBills([...bills, billToAdd]);
      setShowForm(false);
      setNewBill({
        id: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        customerPhone: '',
        items: [{ itemName: '', quantity: 0, rate: 0, amount: 0 }],
        totalAmount: 0,
        paymentMethod: 'cash'
      });
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerPhone.includes(searchTerm)
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Billing Management</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Bill</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by customer name or phone..."
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
                <h3 className="text-lg font-bold">New Bill</h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newBill.customerName}
                    onChange={(e) => setNewBill({ ...newBill, customerName: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newBill.customerPhone}
                    onChange={(e) => setNewBill({ ...newBill, customerPhone: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {newBill.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate || ''}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-medium">{formatIndianCurrency(item.amount)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newBill.paymentMethod}
                    onChange={(e) => setNewBill({ ...newBill, paymentMethod: e.target.value })}
                    className="p-2 border rounded"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total Amount: {formatIndianCurrency(newBill.totalAmount)}
                  </p>
                </div>
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
                  Generate Bill
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(bill.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.customerPhone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianCurrency(bill.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{bill.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => setShowDetails(bill.id)}
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
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Bill Details</h3>
                <button onClick={() => setShowDetails(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {bills.find(b => b.id === showDetails) && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-medium">{bills.find(b => b.id === showDetails)?.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium">{bills.find(b => b.id === showDetails)?.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {new Date(bills.find(b => b.id === showDetails)?.date || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">
                        {bills.find(b => b.id === showDetails)?.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <table className="min-w-full divide-y divide-gray-200 mb-6">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bills.find(b => b.id === showDetails)?.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.itemName}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">{formatIndianCurrency(item.rate)}</td>
                          <td className="px-4 py-2">{formatIndianCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      Total Amount: {formatIndianCurrency(bills.find(b => b.id === showDetails)?.totalAmount || 0)}
                    </p>
                  </div>
                </>
              )}

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

export default BillingPage;