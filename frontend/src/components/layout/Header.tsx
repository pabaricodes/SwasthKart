import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";

export function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const setCartDrawerOpen = useUiStore((s) => s.setCartDrawerOpen);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            SwasthKart
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
                My Orders
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </button>
            )}

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {user?.name || "Profile"}
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
