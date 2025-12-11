import { useState, useEffect } from "react";
import { ArrowLeft, Save, Layout as LayoutIcon, X } from "lucide-react";
import BlockEditor from "./BlockEditor";
import { Block } from "../types/blocks";
import {
  LAYOUT_TEMPLATES,
  getTemplateById,
  type LayoutTemplate,
} from "../types/layouts";

interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: Block[];
  layout: "default" | "full-width" | "sidebar";
  status: "draft" | "published";
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  isHomePage?: boolean;
}

interface PageEditorProps {
  pageId?: string;
}

export default function PageEditor({ pageId: pageIdProp }: PageEditorProps) {
  const [pageId, setPageId] = useState<string | undefined>(pageIdProp);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [layout, setLayout] = useState<"default" | "full-width" | "sidebar">(
    "default",
  );
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [hasShownTemplatePicker, setHasShownTemplatePicker] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);

  // Get page ID from URL if not provided as prop
  useEffect(() => {
    if (!pageIdProp && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get("id");
      if (idFromUrl) {
        setPageId(idFromUrl);
      }
    }
  }, [pageIdProp]);

  // Load existing page data
  useEffect(() => {
    if (pageId && typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      if (stored) {
        try {
          const pages: Page[] = JSON.parse(stored);
          const page = pages.find((p) => p.id === pageId);
          if (page) {
            setTitle(page.title);
            setSlug(page.slug);
            setBlocks(page.blocks || []);
            setLayout(page.layout);
            setStatus(page.status);
            setSeoTitle(page.seo.title);
            setSeoDescription(page.seo.description);
            setIsHomePage(!!page.isHomePage);
            setHasShownTemplatePicker(true); // Don't show picker for existing pages
          }
        } catch (e) {
          console.error("Failed to load page", e);
        }
      }
    }
  }, [pageId]);

  // Show template picker for new pages only once on mount
  useEffect(() => {
    if (!pageId && !hasShownTemplatePicker) {
      setShowTemplatePicker(true);
      setHasShownTemplatePicker(true);
    }
  }, [pageId, hasShownTemplatePicker]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!pageId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, pageId]);

  const handleSave = (saveStatus: "draft" | "published") => {
    if (!title.trim()) {
      alert("Please enter a page title");
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();

    const page: Page = {
      id: pageId || Date.now().toString(),
      title: title.trim(),
      slug: isHomePage
        ? ""
        : slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      blocks,
      layout,
      status: saveStatus,
      seo: {
        title: seoTitle.trim() || title.trim(),
        description: seoDescription.trim(),
      },
      createdAt: pageId ? (undefined as any) : now,
      updatedAt: now,
      ...(isHomePage && { isHomePage: true }),
    };

    // Save to localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      let pages: Page[] = [];
      if (stored) {
        try {
          pages = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored pages", e);
        }
      }

      if (pageId) {
        // Update existing page
        pages = pages.map((p) => (p.id === pageId ? { ...p, ...page } : p));
      } else {
        // Add new page
        pages.push(page);
      }

      localStorage.setItem("chukfi_pages", JSON.stringify(pages));
      window.dispatchEvent(new CustomEvent("pagesUpdated"));

      // Redirect to pages list after successful save
      setTimeout(() => {
        window.location.href = "/admin/pages";
      }, 500);
    }

    setIsSaving(false);
  };

  // Apply template to page
  const applyTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    setBlocks(template.blocks);
    setLayout(template.id as "default" | "full-width" | "sidebar");
    if (!title && template.name !== "Blank") {
      setTitle(template.name);
    }
    setShowTemplatePicker(false);
  };

  return (
    <div className="space-y-6">
      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={() => setShowTemplatePicker(false)}
          ></div>
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white sm:max-h-[85vh] dark:bg-gray-800">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Choose a Template
              </h3>
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Templates Grid - Scrollable */}
            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                {Object.entries(
                  LAYOUT_TEMPLATES.reduce(
                    (acc, template) => {
                      if (!acc[template.category]) acc[template.category] = [];
                      acc[template.category].push(template);
                      return acc;
                    },
                    {} as Record<string, LayoutTemplate[]>,
                  ),
                ).map(([category, templates]) => (
                  <div key={category}>
                    <h4 className="mb-3 text-base font-semibold text-gray-900 capitalize sm:mb-4 sm:text-lg dark:text-white">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template.id)}
                          className="group flex flex-col items-start rounded-lg border border-gray-300 p-3 text-left transition-all hover:border-indigo-500 hover:shadow-md sm:p-4 dark:border-gray-600 dark:hover:border-indigo-400"
                        >
                          <LayoutIcon className="mb-2 h-6 w-6 text-gray-400 group-hover:text-indigo-600 sm:mb-3 sm:h-8 sm:w-8 dark:group-hover:text-indigo-400" />
                          <h5 className="mb-1 text-sm font-semibold text-gray-900 sm:mb-2 sm:text-base dark:text-white">
                            {template.name}
                          </h5>
                          <p className="mb-2 text-xs text-gray-600 sm:mb-3 sm:text-sm dark:text-gray-400">
                            {template.description}
                          </p>
                          <div className="mt-auto flex flex-wrap gap-1">
                            {template.blocks.map((block, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 sm:py-1 dark:bg-gray-700 dark:text-gray-400"
                              >
                                {block.type}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/admin/pages"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {pageId ? "Edit Page" : "New Page"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {blocks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTemplatePicker(true)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <LayoutIcon className="h-4 w-4" />
              Change Template
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Page settings */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Page Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="About Us"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="slug"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              URL Slug
            </label>
            <input
              type="text"
              id="slug"
              value={isHomePage ? "(home page)" : slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="about-us"
              disabled={isHomePage}
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:disabled:bg-gray-800"
            />
            {isHomePage && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This is the home page and will be served at /
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="layout"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Layout
          </label>
          <select
            id="layout"
            value={layout}
            onChange={(e) =>
              setLayout(e.target.value as "default" | "full-width" | "sidebar")
            }
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
          >
            <option value="default">Default</option>
            <option value="full-width">Full Width</option>
            <option value="sidebar">With Sidebar</option>
          </select>
        </div>

        {/* SEO Settings */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            SEO Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="seoTitle"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Meta Title
              </label>
              <input
                type="text"
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || "Page title"}
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
            <div>
              <label
                htmlFor="seoDescription"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Meta Description
              </label>
              <textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                placeholder="Brief description of this page"
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Block editor */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Page Content
        </h3>
        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </div>
    </div>
  );
}
