import { Plus, Search } from 'lucide-react';

const medicines = [
  { id: 1, name: 'Paracetamol 500mg', stock: 2500, category: 'Pain Relief', supplier: 'PharmaCo', price: 5.99, status: 'In Stock' },
  { id: 2, name: 'Amoxicillin 250mg', stock: 180, category: 'Antibiotics', supplier: 'MediSupply', price: 12.99, status: 'Low Stock' },
  { id: 3, name: 'Omeprazole 20mg', stock: 850, category: 'Digestive', supplier: 'HealthCare Ltd', price: 8.99, status: 'In Stock' },
  { id: 4, name: 'Cetirizine 10mg', stock: 1200, category: 'Allergy', supplier: 'PharmaCo', price: 6.99, status: 'In Stock' },
  { id: 5, name: 'Ibuprofen 400mg', stock: 90, category: 'Pain Relief', supplier: 'MediSupply', price: 4.99, status: 'Low Stock' },
];

const InventorySection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Inventory Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((medicine) => (
              <tr key={medicine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{medicine.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.supplier}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${medicine.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    medicine.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {medicine.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventorySection;