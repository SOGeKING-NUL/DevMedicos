import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ShipmentPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const renderPageNumbers = () => {
    let pagesToShow = pages;
    
    if (totalPages > 7) {
      if (currentPage <= 4) {
        pagesToShow = [...pages.slice(0, 5), -1, totalPages];
      } else if (currentPage >= totalPages - 3) {
        pagesToShow = [1, -1, ...pages.slice(totalPages - 5)];
      } else {
        pagesToShow = [
          1,
          -1,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          -1,
          totalPages,
        ];
      }
    }

    return pagesToShow.map((page, index) => {
      if (page === -1) {
        return (
          <span
            key={`ellipsis-${index}`}
            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
          >
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            currentPage === page
              ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
          } ${index === 0 ? 'rounded-l-md' : ''} ${
            index === pagesToShow.length - 1 ? 'rounded-r-md' : ''
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                currentPage === 1
                  ? 'cursor-not-allowed'
                  : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                currentPage === totalPages
                  ? 'cursor-not-allowed'
                  : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ShipmentPagination;