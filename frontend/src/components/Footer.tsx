import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold mb-4">FIND A STORE</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Store Locator</a></li>
              <li><a href="#" className="hover:text-white">Nike Retail</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">GET HELP</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Order Status</a></li>
              <li><a href="#" className="hover:text-white">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
              <li><a href="#" className="hover:text-white">Payment Options</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">ABOUT NIKE</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">News</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Investors</a></li>
              <li><a href="#" className="hover:text-white">Sustainability</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">FOLLOW US</h4>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 cursor-pointer hover:text-gray-400" />
              <Twitter className="h-6 w-6 cursor-pointer hover:text-gray-400" />
              <Instagram className="h-6 w-6 cursor-pointer hover:text-gray-400" />
              <Youtube className="h-6 w-6 cursor-pointer hover:text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">© 2024 Nike, Inc. All Rights Reserved</span>
            </div>
            <div className="flex flex-wrap justify-center space-x-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Guides</a>
              <a href="#" className="hover:text-white">Terms of Sale</a>
              <a href="#" className="hover:text-white">Terms of Use</a>
              <a href="#" className="hover:text-white">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;