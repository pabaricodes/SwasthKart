import { Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ToastContainer } from "./components/ui/Toast";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { HomePage } from "./routes/HomePage";
import { CategoryPage } from "./routes/CategoryPage";
import { ProductDetailPage } from "./routes/ProductDetailPage";
import { CartPage } from "./routes/CartPage";
import { CheckoutPage } from "./routes/CheckoutPage";
import { OrdersPage } from "./routes/OrdersPage";
import { OrderTrackingPage } from "./routes/OrderTrackingPage";
import { LoginPage } from "./routes/LoginPage";
import { ProfilePage } from "./routes/ProfilePage";
import { AdminDashboardPage } from "./routes/admin/DashboardPage";
import { AdminProductsPage } from "./routes/admin/ProductsPage";
import { AdminOrdersPage } from "./routes/admin/OrdersPage";
import { AdminInventoryPage } from "./routes/admin/InventoryPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><AdminProductsPage /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><AdminOrdersPage /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute><AdminInventoryPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
