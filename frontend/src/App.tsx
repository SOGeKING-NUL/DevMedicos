import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ShipmentPage from './components/ShipmentPage';
import BillingPage from './components/BillingPage';
import InventorySection from './components/InventorySection';
import RecentActivity from './components/RecentActivity';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <main className="container mx-auto px-4 py-8">
              <Dashboard />
              <div className="mb-8">
                <InventorySection />
              </div>
              <RecentActivity />
            </main>
          } />
          <Route path="/shipment" element={<ShipmentPage />} />
          <Route path="/bills" element={<BillingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;