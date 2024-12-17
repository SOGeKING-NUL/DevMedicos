import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-sm relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/bills" className="text-xl font-bold text-blue-600">DevMedicos</Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/bills" className={isActive('/bills')}>
              Bills
            </Link>
            <Link to="/inventory" className={isActive('/inventory')}>
              Inventory
            </Link>
            <Link to="/shipment" className={isActive('/shipment')}>
              Shipment
            </Link>
          </div>

          <Menu
            className="h-6 w-6 md:hidden cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/bills"
              className={`block px-3 py-2 ${isActive('/bills')} hover:bg-gray-100`}
            >
              Bills
            </Link>
            <Link
              to="/inventory"
              className={`block px-3 py-2 ${isActive('/inventory')} hover:bg-gray-100`}
            >
              Inventory
            </Link>
            <Link
              to="/shipment"
              className={`block px-3 py-2 ${isActive('/shipment')} hover:bg-gray-100`}
            >
              Shipment
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;