import React, { useState } from 'react';
import { Plus, X, Search, Trash2 } from 'lucide-react';

const  {additemtoShipment}= require("../../backend/inventory_function")

interface ShipmentItem {
  item: string;
  quantity: number;
  bonus: number;
  pack_of: number;
  mrp: number;
  rate: number;
  amount: number;
}

interface ShipmentDisplay {
  invoice_no: string;
  date: string;
  total_amount: number;
}

const ShipmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  // Initialize with dummy data
  const [shipments, setShipments] = useState<ShipmentDisplay[]>([
    {
      invoice_no: "INV001",
      date: "2024-03-14",
      total_amount: 2500.50
    },
    {
      invoice_no: "INV002",
      date: "2024-03-13",
      total_amount: 1750.75
    },
    {
      invoice_no: "INV003",
      date: "2024-03-12",
      total_amount: 3200.25
    }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [items, setItems] = useState<ShipmentItem[]>([{
    item: '',
    quantity: 0,
    bonus: 0,
    pack_of: 0,
    mrp: 0,
    rate: 0,
    amount: 0
  }]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleItemChange = (index: number, field: keyof ShipmentItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'bonus' || field === 'rate') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const bonus = field === 'bonus' ? value : newItems[index].bonus;
      const rate = field === 'rate' ? value : newItems[index].rate;
      newItems[index].amount = rate * (Number(bonus) + Number(quantity));
    }
    
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, {
      item: '',
      quantity: 0,
      bonus: 0,
      pack_of: 0,
      mrp: 0,
      rate: 0,
      amount: 0
    }]);
  };

  const deleteRow = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async () => {
    try {
      // Add each item to the shipment table
      for (const item of items) {
        await additemtoShipment(
          invoiceNumber,
          item.quantity,
          item.bonus,
          item.pack_of,
          item.item,
          item.mrp,
          item.rate,
          item.amount
        );
      }

      // Update the display list
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      const newShipment: ShipmentDisplay = {
        invoice_no: invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        total_amount: totalAmount
      };
      
      setShipments([...shipments, newShipment]);
      setShowForm(false);
      setInvoiceNumber('');
      setItems([{
        item: '',
        quantity: 0,
        bonus: 0,
        pack_of: 0,
        mrp: 0,
        rate: 0,
        amount: 0
      }]);
    } catch (error) {
      console.error('Error adding shipment:', error);
      // Handle error appropriately (show error message to user)
    }
  };

  const filteredShipments = shipments.filter(shipment => 
    shipment.date.includes(searchTerm) || 
    shipment.invoice_no.includes(searchTerm)
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
              placeholder="Search by Date or Invoice Number..."
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
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-bold">New Shipment - {new Date().toLocaleDateString()}</h3>
                  <input
                    type="text"
                    placeholder="Invoice number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5" />
                </button>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.bonus}
                            onChange={(e) => handleItemChange(index, 'bonus', parseInt(e.target.value))}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.pack_of}
                            onChange={(e) => handleItemChange(index, 'pack_of', parseFloat(e.target.value))}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.mrp}
                            onChange={(e) => handleItemChange(index, 'mrp', parseFloat(e.target.value))}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => deleteRow(index)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={addRow}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Row</span>
                </button>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total Amount: ${items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${shipment.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.invoice_no}</td>
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