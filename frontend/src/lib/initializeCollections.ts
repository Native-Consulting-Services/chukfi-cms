/**
 * Initialize default collections if they don't exist
 * This runs on app load to ensure core collections are available
 */

interface Collection {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  description: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  documents?: any[];
}

const defaultCollections: Omit<Collection, "id" | "createdAt" | "updatedAt">[] =
  [
    {
      name: "Pages",
      slug: "pages",
      status: "active",
      description: "Static pages for your website (About, Contact, etc.)",
      icon: "📄",
      documents: [],
    },
    {
      name: "Media",
      slug: "media",
      status: "active",
      description: "Images and videos for your content",
      icon: "🖼️",
      documents: [],
    },
    {
      name: "Documents",
      slug: "documents",
      status: "active",
      description: "Downloadable files (PDFs, Word docs, spreadsheets, etc.)",
      icon: "📎",
      documents: [],
    },
    {
      name: "Blog Posts",
      slug: "blog-posts",
      status: "active",
      description: "Blog articles and posts",
      icon: "📝",
      documents: [],
    },
  ];

export function initializeCollections(): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem("chukfi_collections");
  let collections: Collection[] = [];

  if (stored) {
    try {
      collections = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse collections", e);
      collections = [];
    }
  }

  let hasChanges = false;

  // Add default collections if they don't exist
  defaultCollections.forEach((defaultCol) => {
    const exists = collections.some((col) => col.slug === defaultCol.slug);

    if (!exists) {
      const now = new Date().toISOString();
      const newCollection: Collection = {
        ...defaultCol,
        id: `${defaultCol.slug}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };

      collections.push(newCollection);
      hasChanges = true;
      console.log(`✅ Created default collection: ${defaultCol.name}`);
    }
  });

  // Save if there were changes
  if (hasChanges) {
    localStorage.setItem("chukfi_collections", JSON.stringify(collections));

    // Dispatch event to update any components listening for collection changes
    window.dispatchEvent(new CustomEvent("collectionsStorageUpdated"));

    console.log(`📦 Initialized ${collections.length} collections`);
  }
}

/**
 * Check if collections are initialized
 */
export function areCollectionsInitialized(): boolean {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem("chukfi_collections");
  if (!stored) return false;

  try {
    const collections = JSON.parse(stored);
    return collections.length > 0;
  } catch {
    return false;
  }
}
