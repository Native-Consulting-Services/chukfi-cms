import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Package, DollarSign, Tag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventory?: number;
  images?: string[];
  category?: string;
  tags?: string[];
  status: "active" | "draft" | "archived";
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "archived"
  >("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const loadProducts = () => {
    try {
      const stored = localStorage.getItem("chukfi_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProducts(parsed);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (confirm(`Delete "${product.name}"?`)) {
      const updatedProducts = products.filter((p) => p.id !== id);
      localStorage.setItem("chukfi_products", JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          No products yet
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating your first product.
        </p>
        <div className="mt-6">
          <a
            href="/admin/products/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            <Package className="mr-2 h-4 w-4" />
            New Product
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No products match your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50 dark:hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex h-full items-center justify-center">
                          <svg class="h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : product.status === "draft"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {product.status}
                    </span>
                    {product.featured && (
                      <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {product.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {product.description}
                  </p>
                )}

                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through dark:text-gray-400">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                </div>

                {product.inventory !== undefined && (
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Stock:{" "}
                    <span className="font-medium">{product.inventory}</span>{" "}
                    units
                  </p>
                )}

                {product.category && (
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {product.category}
                    </span>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        +{product.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Updated {formatDate(product.updatedAt)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`/admin/products/new?id=${product.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
