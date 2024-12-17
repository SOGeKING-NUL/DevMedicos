import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import BillingTable from './BillingTable';
import BillDetailsModal from './BillDetailsModal';
import Pagination from '../Pagination';
import { fetchBills, fetchBillDetails } from '../../services/billingService';
import { Bill, BillDetails } from '../../types/billing';

const ITEMS_PER_PAGE = 10;

const BillingTableContainer: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const loadBills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBills();
      const sortedBills = data.sort((a, b) => 
        new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
      );
      setBills(sortedBills);
    } catch (err) {
      setError('Failed to fetch bills. Please try again.');
      console.error('Error fetching bills:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = async (billNo: string) => {
    setSelectedBill(billNo);
    setIsLoadingDetails(true);
    setDetailsError(null);
    
    try {
      const details = await fetchBillDetails(billNo);
      setBillDetails(details);
    } catch (err) {
      setDetailsError('Failed to fetch bill details. Please try again.');
      console.error('Error fetching bill details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedBill(null);
    setBillDetails(null);
    setDetailsError(null);
  };

  const filteredBills = bills.filter(bill =>
    bill.bill_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(bill.created_on).toLocaleDateString('en-IN').includes(searchTerm) ||
    new Date(bill.created_on).toLocaleTimeString('en-IN').includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBills = filteredBills.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadBills}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <BillingTable bills={currentBills} onViewDetails={handleViewDetails} />
      {filteredBills.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {isLoadingDetails ? (
            <div className="bg-white rounded-lg p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : detailsError ? (
            <div className="bg-white rounded-lg p-8">
              <p className="text-red-600 mb-4">{detailsError}</p>
              <button
                onClick={() => handleViewDetails(selectedBill)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            </div>
          ) : billDetails ? (
            <BillDetailsModal
              billNo={selectedBill}
              details={billDetails}
              onClose={handleCloseDetails}
            />
          ) : null}
        </div>
      )}
    </>
  );
};

export default BillingTableContainer;