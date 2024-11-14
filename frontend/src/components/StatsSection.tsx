import React from 'react';
import { BarChart3 } from 'lucide-react';

const StatsSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
        <BarChart3 className="h-5 w-5 text-gray-500" />
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Top Selling Products</span>
            <span className="text-sm font-medium text-blue-600">View All</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Paracetamol 500mg</span>
              <span className="text-sm font-medium">1,234 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Ibuprofen 400mg</span>
              <span className="text-sm font-medium">987 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cetirizine 10mg</span>
              <span className="text-sm font-medium">654 units</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Low Stock Alerts</span>
            <span className="text-sm font-medium text-blue-600">View All</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Amoxicillin 250mg</span>
              <span className="text-sm font-medium text-red-600">180 left</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Ibuprofen 400mg</span>
              <span className="text-sm font-medium text-red-600">90 left</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Expiring Soon</span>
            <span className="text-sm font-medium text-blue-600">View All</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Omeprazole 20mg</span>
              <span className="text-sm font-medium text-yellow-600">30 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cetirizine 10mg</span>
              <span className="text-sm font-medium text-yellow-600">45 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;