import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as LucideIcons from "lucide-react";

interface NewCollectionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (collection: NewCollectionData) => void;
}

export interface NewCollectionData {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
}

// Popular Lucide icons for collections
const AVAILABLE_ICONS = [
  "FileText",
  "Folder",
  "Database",
  "Image",
  "Video",
  "Music",
  "File",
  "FileCode",
  "Book",
  "BookOpen",
  "Newspaper",
  "Mail",
  "MessageSquare",
  "Users",
  "User",
  "UserCircle",
  "Calendar",
  "Clock",
  "MapPin",
  "Tag",
  "Star",
  "Heart",
  "ShoppingCart",
  "Package",
  "Box",
  "Layers",
  "Grid",
  "List",
  "Settings",
  "Briefcase",
];

// Color options with hex values for proper rendering
const COLORS = [
  { name: "Gray", value: "gray", hex: "#6b7280" },
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Orange", value: "orange", hex: "#f97316" },
  { name: "Amber", value: "amber", hex: "#f59e0b" },
  { name: "Yellow", value: "yellow", hex: "#eab308" },
  { name: "Lime", value: "lime", hex: "#84cc16" },
  { name: "Green", value: "green", hex: "#22c55e" },
  { name: "Emerald", value: "emerald", hex: "#10b981" },
  { name: "Teal", value: "teal", hex: "#14b8a6" },
  { name: "Cyan", value: "cyan", hex: "#06b6d4" },
  { name: "Sky", value: "sky", hex: "#0ea5e9" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Indigo", value: "indigo", hex: "#6366f1" },
  { name: "Violet", value: "violet", hex: "#8b5cf6" },
  { name: "Purple", value: "purple", hex: "#a855f7" },
  { name: "Fuchsia", value: "fuchsia", hex: "#d946ef" },
  { name: "Pink", value: "pink", hex: "#ec4899" },
  { name: "Rose", value: "rose", hex: "#f43f5e" },
];

export default function NewCollectionModal({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  onSave: onSaveProp,
}: NewCollectionModalProps) {
  const [isOpen, setIsOpen] = useState(isOpenProp ?? false);
  const [formData, setFormData] = useState<NewCollectionData>({
    name: "",
    displayName: "",
    description: "",
    icon: "FileText",
    color: "indigo",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iconSearch, setIconSearch] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
    };

    window.addEventListener("openNewCollectionModal", handleOpenModal);

    return () => {
      window.removeEventListener("openNewCollectionModal", handleOpenModal);
    };
  }, []);

  const onClose = () => {
    setIsOpen(false);
    if (onCloseProp) onCloseProp();
  };

  const onSave = (collection: NewCollectionData) => {
    console.log("Creating collection:", collection);

    // Dispatch event to notify CollectionsList
    window.dispatchEvent(
      new CustomEvent("newCollectionCreated", {
        detail: collection,
      }),
    );

    // TODO: Make API call to create collection
    if (onSaveProp) onSaveProp(collection);
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: "",
        displayName: "",
        description: "",
        icon: "FileText",
        color: "indigo",
      });
      setErrors({});
      setIconSearch("");
      setShowIconPicker(false);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate name from displayName
    if (name === "displayName") {
      const slugName = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      setFormData((prev) => ({ ...prev, name: slugName }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name =
        "Name can only contain lowercase letters, numbers, and underscores";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleIconSelect = (iconName: string) => {
    setFormData((prev) => ({ ...prev, icon: iconName }));
    setShowIconPicker(false);
    setIconSearch("");
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.FileText;
  };

  const getColorHex = (colorName: string): string => {
    return COLORS.find((c) => c.value === colorName)?.hex || "#6366f1";
  };

  const filteredIcons = AVAILABLE_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  const SelectedIcon = getIconComponent(formData.icon);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl transform rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Collection
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-6">
              {/* Display Name */}
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Display Name *
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.displayName
                      ? "ring-red-500 dark:ring-red-600"
                      : "ring-gray-300 dark:ring-gray-600"
                  } placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6`}
                  placeholder="e.g., Blog Posts"
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Name (slug) */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name (slug) *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.name
                      ? "ring-red-500 dark:ring-red-600"
                      : "ring-gray-300 dark:ring-gray-600"
                  } placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6`}
                  placeholder="e.g., blog_posts"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Used in URLs and API endpoints. Lowercase letters, numbers,
                  and underscores only.
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  placeholder="Describe what this collection is used for..."
                />
              </div>

              {/* Icon and Color Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className={`flex items-center justify-between w-full rounded-md border-0 py-2 px-3 bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500`}
                    >
                      <div className="flex items-center space-x-2">
                        <SelectedIcon
                          className="h-5 w-5"
                          style={{ color: getColorHex(formData.color) }}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formData.icon}
                        </span>
                      </div>
                      <LucideIcons.ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* Icon Picker Dropdown */}
                    {showIconPicker && (
                      <div className="absolute z-10 mt-2 w-full rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search icons..."
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2">
                          <div className="grid grid-cols-5 gap-2">
                            {filteredIcons.map((iconName) => {
                              const Icon = getIconComponent(iconName);
                              return (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => handleIconSelect(iconName)}
                                  className={`flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                    formData.icon === iconName
                                      ? "bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-600 dark:ring-indigo-500"
                                      : ""
                                  }`}
                                  title={iconName}
                                >
                                  <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            color: color.value,
                          }))
                        }
                        className={`relative h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${
                          formData.color === color.value
                            ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white"
                            : ""
                        }`}
                        title={color.name}
                        style={{
                          backgroundColor: color.hex,
                        }}
                      >
                        {formData.color === color.value && (
                          <LucideIcons.Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div
                    className="flex-shrink-0 p-2 rounded-lg"
                    style={{
                      backgroundColor: `${getColorHex(formData.color)}20`,
                    }}
                  >
                    <SelectedIcon
                      className="h-6 w-6"
                      style={{ color: getColorHex(formData.color) }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.displayName || "Collection Name"}
                    </p>
                    {formData.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
              >
                Create Collection
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
