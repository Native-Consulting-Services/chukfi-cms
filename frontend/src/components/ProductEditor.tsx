import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, Upload, X } from "lucide-react";
import { logActivity } from "../lib/activityLogger";

interface Product {
  id?: string;
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

interface ProductEditorProps {
  productId?: string;
  onSave?: (product: Product) => void;
  onCancel?: () => void;
}

export default function ProductEditor({
  productId: productIdProp,
  onSave,
  onCancel,
}: ProductEditorProps) {
  // Get product ID from prop or URL query parameter
  const [productId, setProductId] = useState<string | undefined>(productIdProp);

  useEffect(() => {
    if (!productIdProp && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get("id");
      if (idFromUrl) {
        setProductId(idFromUrl);
      }
    }
  }, [productIdProp]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [sku, setSku] = useState("");
  const [inventory, setInventory] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    "draft",
  );
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load product data if editing
  useEffect(() => {
    if (productId && typeof window !== "undefined") {
      const storedProducts = localStorage.getItem("chukfi_products");
      if (storedProducts) {
        try {
          const products = JSON.parse(storedProducts);
          const product = products.find((p: Product) => p.id === productId);
          if (product) {
            setName(product.name);
            setSlug(product.slug);
            setDescription(product.description || "");
            setPrice(product.price?.toString() || "");
            setCompareAtPrice(product.compareAtPrice?.toString() || "");
            setSku(product.sku || "");
            setInventory(product.inventory?.toString() || "");
            setCategory(product.category || "");
            setTags(product.tags?.join(", ") || "");
            setStatus(product.status);
            setFeatured(product.featured || false);
            setImages(product.images || []);
          }
        } catch (error) {
          console.error("Failed to load product", error);
        }
      }
    }
  }, [productId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!productId && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [name, productId]);

  const handleSave = async (newStatus: "active" | "draft" | "archived") => {
    if (!name.trim()) {
      alert("Please enter a product name");
      return;
    }

    if (!price || parseFloat(price) < 0) {
      alert("Please enter a valid price");
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();

    const product: Product = {
      id: productId || Date.now().toString(),
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description.trim(),
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      sku: sku.trim() || undefined,
      inventory: inventory ? parseInt(inventory) : undefined,
      category: category.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      status: newStatus,
      featured,
      images: images.filter((img) => img),
      createdAt: productId ? undefined : now,
      updatedAt: now,
    };

    if (typeof window !== "undefined") {
      const storedProducts = localStorage.getItem("chukfi_products");
      let products: Product[] = [];

      if (storedProducts) {
        try {
          products = JSON.parse(storedProducts);
        } catch (error) {
          console.error("Failed to parse stored products", error);
        }
      }

      if (productId) {
        const index = products.findIndex((p) => p.id === productId);
        if (index !== -1) {
          products[index] = { ...products[index], ...product };
        }
      } else {
        products.unshift(product);
      }

      localStorage.setItem("chukfi_products", JSON.stringify(products));

      await logActivity({
        action: productId ? "updated" : "created",
        entityType: "product",
        entityId: product.id!,
        entityName: product.name,
        metadata: {
          status: product.status,
          featured: product.featured,
          price: product.price,
        },
      }).catch((error) => console.error("Failed to log activity:", error));
    }

    setIsSaving(false);

    if (onSave) {
      onSave(product);
    } else {
      window.location.href = "/admin/products";
    }
  };

  const handleDelete = async () => {
    if (typeof window !== "undefined") {
      const storedProducts = localStorage.getItem("chukfi_products");
      if (storedProducts) {
        try {
          const products = JSON.parse(storedProducts);
          const product = products.find((p: Product) => p.id === productId);
          const updatedProducts = products.filter(
            (p: Product) => p.id !== productId,
          );

          localStorage.setItem(
            "chukfi_products",
            JSON.stringify(updatedProducts),
          );

          if (product) {
            await logActivity({
              action: "deleted",
              entityType: "product",
              entityId: productId!,
              entityName: product.name,
            }).catch((error) =>
              console.error("Failed to log activity:", error),
            );
          }

          setShowDeleteModal(false);
          window.location.href = "/admin/products";
        } catch (error) {
          console.error("Failed to delete product", error);
          alert("Failed to delete product. Please try again.");
          setShowDeleteModal(false);
        }
      }
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (window.location.href = "/admin/products")}
            className="inline-flex items-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Back to Products"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {productId ? "Edit Product" : "New Product"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {productId && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("active")}
            disabled={isSaving}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Save className="mr-2 h-4 w-4" />
            Publish
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Form */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/50">
        {/* Product Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name..."
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Slug
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="product-url-slug"
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description..."
            rows={4}
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
        </div>

        {/* Price Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Price *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="block w-full rounded-md border-0 bg-white py-2 pr-3 pl-7 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="compareAtPrice"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Compare at Price
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                id="compareAtPrice"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="block w-full rounded-md border-0 bg-white py-2 pr-3 pl-7 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SKU and Inventory */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sku"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              SKU
            </label>
            <input
              type="text"
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Product SKU..."
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="inventory"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Inventory
            </label>
            <input
              type="number"
              id="inventory"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              placeholder="Stock quantity..."
              min="0"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category and Tags */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Electronics"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="tags"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate tags with commas
            </p>
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Product Images
          </label>
          <div className="space-y-3">
            {/* Add Image URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="block flex-1 rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Product ${index + 1}`}
                      className="h-24 w-full rounded-lg border border-gray-300 object-cover dark:border-gray-600"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-indigo-800"></div>
            <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Product
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Show this product on the homepage
          </p>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Product
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
