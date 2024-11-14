import React, { useState } from 'react';
import { Menu, Bell, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">MediManager</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Inventory
            </a>

            <Link to="/shipment" className="text-gray-700 hover:text-blue-600">
              Shipment
            </Link>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Bills
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-gray-600 cursor-pointer" />
            <Settings className="h-5 w-5 text-gray-600 cursor-pointer" />
            <User className="h-5 w-5 text-gray-600 cursor-pointer" />
            <Menu
              className="h-6 w-6 md:hidden cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Inventory
            </a>
            
            <Link
              to="/shipment"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Shipment
            </Link>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Bills
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;