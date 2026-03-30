export function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/admin/products" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900">Products</h3>
          <p className="text-sm text-gray-500 mt-1">Manage catalog products</p>
        </a>
        <a href="/admin/orders" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900">Orders</h3>
          <p className="text-sm text-gray-500 mt-1">View and manage orders</p>
        </a>
        <a href="/admin/inventory" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900">Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">Check stock levels</p>
        </a>
      </div>
    </div>
  );
}
