import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Package,
  DollarSign,
  LogIn,
  UserPlus,
} from "lucide-react";
import UserMenu from "./UserMenu";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  status?: string;
  image?: string;
}

export default function PublicProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadProducts();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("chukfi_auth_token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const loadProducts = () => {
    const storedProducts = localStorage.getItem("chukfi_products");
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        // Only show active products with stock
        const availableProducts = parsedProducts.filter(
          (product: Product) =>
            product.status === "active" &&
            (product.stock === undefined || product.stock > 0),
        );
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
      } catch (e) {
        console.error("Failed to parse products", e);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Products
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Browse our catalog and shop now
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <a
                    href="/dashboard"
                    className="hidden rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 sm:block dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                  >
                    My Dashboard
                  </a>
                  <UserMenu />
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="hidden items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:flex dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <LogIn className="h-4 w-4" />
                    Log In
                  </a>
                  <a
                    href="/signup"
                    className="hidden items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:flex"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white py-3 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
              >
                {/* Product Image Placeholder */}
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                  <Package className="h-16 w-16 text-indigo-300 dark:text-indigo-700" />
                </div>

                {/* Product Details */}
                <div className="flex-1 p-4">
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                      <DollarSign className="h-5 w-5" />
                      {product.price.toFixed(2)}
                    </div>
                    {product.stock !== undefined && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.stock} in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                  <button className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {searchTerm ? "No products found" : "No products available"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Check back later for new products"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
