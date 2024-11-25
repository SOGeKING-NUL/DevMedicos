import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ShipmentPage from './components/ShipmentPage';
import BillingPage from './components/BillingPage';
import InventoryPage from './components/InventoryPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/bills" replace />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/shipment" element={<ShipmentPage />} />
          <Route path="/bills" element={<BillingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;