import React from 'react';
import { Clock } from 'lucide-react';

const activities = [
  { id: 1, action: 'Stock Update', item: 'Paracetamol 500mg', quantity: '+500', time: '2 hours ago', type: 'addition' },
  { id: 2, action: 'Low Stock Alert', item: 'Amoxicillin 250mg', quantity: '180', time: '3 hours ago', type: 'alert' },
  { id: 3, action: 'Sale', item: 'Omeprazole 20mg', quantity: '-50', time: '4 hours ago', type: 'sale' },
  { id: 4, action: 'New Order', item: 'Cetirizine 10mg', quantity: '+1000', time: '5 hours ago', type: 'order' },
];

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <Clock className="h-5 w-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'addition' ? 'bg-green-500' :
                activity.type === 'alert' ? 'bg-red-500' :
                activity.type === 'sale' ? 'bg-blue-500' :
                'bg-purple-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.item}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{activity.quantity}</p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full text-center text-sm text-blue-600 hover:text-blue-700">
        View All Activity
      </button>
    </div>
  );
};

export default RecentActivity;