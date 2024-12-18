import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import BillingTableContainer from './billing/BillingTableContainer';
import NewBillForm from './billing/NewBillForm';

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBillSuccess = () => {
    setShowSuccess(true);
    // Refresh the bills list
    window.location.reload();
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          Successfully added bill
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Billing Management</h2>
          <button
            onClick={() => setShowNewBillModal(true)}
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
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <BillingTableContainer searchTerm={searchTerm} />

        {showNewBillModal && (
          <NewBillForm
            onClose={() => setShowNewBillModal(false)}
            onSuccess={handleBillSuccess}
          />
        )}
      </div>
    </main>
  );
};

export default BillingPage;