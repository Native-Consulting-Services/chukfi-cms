import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Typography from "@tiptap/extension-typography";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Save,
  Upload,
  FolderOpen,
  X,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Youtube as YoutubeIcon,
  Table as TableIcon,
  Paperclip,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { logActivity } from "../lib/activityLogger";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  author: string;
  featuredImage?: string;
  bannerImage?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  publishAt?: string;
}

interface BlogPostEditorProps {
  postId?: string;
  onSave?: (post: BlogPost) => void;
  onCancel?: () => void;
}

export default function BlogPostEditor({
  postId,
  onSave,
  onCancel,
}: BlogPostEditorProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    "draft",
  );
  const [bannerImage, setBannerImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [bannerInputMode, setBannerInputMode] = useState<
    "url" | "upload" | "media"
  >("url");
  const [, setEditorUpdate] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState<"external" | "internal">("external");
  const [pages, setPages] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaInputMode, setMediaInputMode] = useState<
    "url" | "upload" | "library"
  >("upload");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaItems, setMediaItems] = useState<
    Array<{ id: string; title: string; url: string; type: string }>
  >([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentInputMode, setDocumentInputMode] = useState<
    "url" | "upload" | "library"
  >("upload");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documents, setDocuments] = useState<
    Array<{ id: string; title: string; url: string; filename: string }>
  >([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
      CharacterCount,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3 text-gray-900 dark:text-white caret-gray-900 dark:caret-white prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl",
      },
    },
    onUpdate: () => {
      // Force re-render when editor content changes to update button states
      setEditorUpdate((prev) => prev + 1);
    },
    onSelectionUpdate: () => {
      // Force re-render when cursor position changes (for table toolbar)
      setEditorUpdate((prev) => prev + 1);
    },
  });

  // Load existing post if editing
  useEffect(() => {
    if (postId && typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const posts: BlogPost[] = JSON.parse(stored);
          const post = posts.find((p) => p.id === postId);
          if (post) {
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt);
            setStatus(post.status);
            setBannerImage(post.bannerImage || "");
            setFeatured(post.featured || false);
            setPublishAt(post.publishAt || "");
            editor?.commands.setContent(post.content);
          }
        } catch (e) {
          console.error("Failed to load post", e);
        }
      }
    }
  }, [postId, editor]);

  // Load pages from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_collections");
      if (stored) {
        try {
          const collections = JSON.parse(stored);
          // Find the Pages collection
          const pagesCollection = collections.find(
            (c: any) => c.slug === "pages",
          );
          if (pagesCollection?.documents) {
            setPages(
              pagesCollection.documents.map((doc: any) => ({
                id: doc.id,
                title: doc.title || doc.name || "Untitled",
                slug: doc.slug || "",
              })),
            );
          }
        } catch (e) {
          console.error("Failed to load pages", e);
        }
      }
    }
  }, []);

  // Load media items from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_collections");
      if (stored) {
        try {
          const collections = JSON.parse(stored);
          // Find the Media collection
          const mediaCollection = collections.find(
            (c: any) => c.slug === "media",
          );
          if (mediaCollection?.documents) {
            // Filter to only images and videos
            setMediaItems(
              mediaCollection.documents
                .filter((doc: any) => {
                  const type = (doc.type || doc.mimeType || "").toLowerCase();
                  return type.startsWith("image") || type.startsWith("video");
                })
                .map((doc: any) => ({
                  id: doc.id,
                  title: doc.title || doc.filename || "Untitled",
                  url: doc.url || doc.path || "",
                  type: doc.type || doc.mimeType || "image",
                })),
            );
          }
        } catch (e) {
          console.error("Failed to load media", e);
        }
      }
    }
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!postId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, postId]);

  const handleSave = async (
    saveStatus: "draft" | "published" | "scheduled",
  ) => {
    if (!editor || !title.trim()) {
      alert("Please enter a title");
      return;
    }

    setIsSaving(true);

    const content = editor.getHTML();
    const now = new Date().toISOString();

    // Get the current user's name from localStorage (only for new posts)
    let authorName = "Admin User";
    if (typeof window !== "undefined" && !postId) {
      const storedUser = localStorage.getItem("chukfi_user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          authorName = user.name || user.username || user.email || "Admin User";
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
    }

    const post: BlogPost = {
      id: postId || Date.now().toString(),
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      content,
      excerpt:
        excerpt.trim() || content.replace(/<[^>]*>/g, "").substring(0, 160),
      status: saveStatus,
      author: postId ? undefined : authorName, // Only set author for new posts
      bannerImage: bannerImage || undefined,
      featured,
      publishAt:
        saveStatus === "scheduled" ? publishAt || undefined : undefined,
      createdAt: postId ? undefined : now,
      updatedAt: now,
    };

    // Save to localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      let posts: BlogPost[] = [];
      if (stored) {
        try {
          posts = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored posts", e);
        }
      }

      if (postId) {
        // Update existing post
        const index = posts.findIndex((p) => p.id === postId);
        if (index !== -1) {
          posts[index] = { ...posts[index], ...post };
        }
      } else {
        // Add new post
        posts.unshift(post);
      }

      localStorage.setItem("chukfi_blog_posts", JSON.stringify(posts));
      window.dispatchEvent(new CustomEvent("blogPostsUpdated"));

      // Log activity to backend
      await logActivity({
        action: postId ? "updated" : "created",
        entityType: "blog_post",
        entityId: post.id,
        entityName: post.title,
        metadata: {
          status: post.status,
          featured: post.featured,
        },
      }).catch((err) => console.error("Failed to log activity:", err));
    }

    setIsSaving(false);

    if (onSave) {
      onSave(post);
    } else {
      // Redirect to blog posts list
      window.location.href = "/admin/blog_posts";
    }
  };

  const handleDelete = () => {
    if (!postId) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(stored);
          const postToDelete = parsedPosts.find((p) => p.id === postId);
          const filtered = parsedPosts.filter((p) => p.id !== postId);
          localStorage.setItem("chukfi_blog_posts", JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent("blogPostsUpdated"));

          // Log delete activity to backend
          if (postToDelete) {
            await logActivity({
              action: "deleted",
              entityType: "blog_post",
              entityId: postId,
              entityName: postToDelete.title,
            }).catch((err) => console.error("Failed to log activity:", err));
          }

          setShowDeleteModal(false);
          // Redirect to blog posts list
          window.location.href = "/admin/blog_posts";
        } catch (e) {
          console.error("Failed to delete post", e);
          alert("Failed to delete post. Please try again.");
          setShowDeleteModal(false);
        }
      }
    }
  };

  const setLink = () => {
    // Check if there's selected text
    const { from, to } = editor!.state.selection;
    const selectedText = editor!.state.doc.textBetween(from, to, "");

    // Pre-fill with selected text if available
    setLinkText(selectedText);
    setLinkUrl("");
    setLinkType("external");
    setShowLinkModal(true);
  };

  const handleInsertLink = () => {
    if (!linkText || !linkUrl) return;

    // Auto-format URL only for external links
    let formattedUrl = linkUrl.trim();

    if (linkType === "external") {
      // If URL doesn't have a protocol, add https://
      if (!formattedUrl.match(/^[a-zA-Z]+:\/\//)) {
        // Check if it looks like a domain (has a dot)
        if (formattedUrl.includes(".")) {
          // Add www. if it doesn't start with www. or a subdomain
          if (!formattedUrl.match(/^(www\.|[a-zA-Z0-9-]+\.)/)) {
            formattedUrl = "www." + formattedUrl;
          }
          formattedUrl = "https://" + formattedUrl;
        } else {
          // Not a valid URL format
          formattedUrl = "https://" + formattedUrl;
        }
      }
    }
    // For internal links, formattedUrl is already set to the page slug (e.g., /about)

    // Check if there was originally selected text
    const { from, to } = editor!.state.selection;
    const selectedText = editor!.state.doc.textBetween(from, to, "");

    if (selectedText) {
      // Add link to selected text
      editor?.chain().focus().setLink({ href: formattedUrl }).run();
    } else {
      // Insert new text with link
      editor
        ?.chain()
        .focus()
        .insertContent({
          type: "text",
          text: linkText,
          marks: [{ type: "link", attrs: { href: formattedUrl } }],
        })
        .run();
    }

    // Reset modal
    setShowLinkModal(false);
    setLinkText("");
    setLinkUrl("");
  };

  const addImage = () => {
    setMediaUrl("");
    setMediaFile(null);
    setMediaPreview("");
    setMediaInputMode("upload");
    setShowMediaModal(true);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only accept images and videos
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setMediaFile(file);
        const objectUrl = URL.createObjectURL(file);
        setMediaPreview(objectUrl);
      } else {
        alert("Please select an image or video file.");
      }
    }
  };

  const handleInsertMedia = () => {
    let finalUrl = "";

    if (mediaInputMode === "url" && mediaUrl) {
      finalUrl = mediaUrl;
    } else if (mediaInputMode === "upload" && mediaPreview) {
      finalUrl = mediaPreview;
    } else if (mediaInputMode === "library" && mediaUrl) {
      finalUrl = mediaUrl;
    }

    if (finalUrl) {
      // Check if it's a video or image
      const isVideo =
        finalUrl.match(/\.(mp4|webm|ogg|mov)$/i) ||
        mediaFile?.type.startsWith("video/");

      if (isVideo) {
        // Insert video as HTML
        editor?.commands.insertContent(
          `<video controls src="${finalUrl}" style="max-width: 100%; border-radius: 0.5rem;"></video>`,
        );
      } else {
        // Insert as image
        editor?.chain().focus().setImage({ src: finalUrl }).run();
      }
    }

    // Reset and close modal
    setShowMediaModal(false);
    setMediaUrl("");
    setMediaFile(null);
    setMediaPreview("");
  };

  const addDocument = () => {
    setDocumentUrl("");
    setDocumentFile(null);
    setDocumentTitle("");
    setDocumentInputMode("upload");
    setShowDocumentModal(true);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentTitle(file.name);
    }
  };

  const handleInsertDocument = () => {
    let finalUrl = "";
    let finalTitle = documentTitle;

    if (documentInputMode === "url" && documentUrl) {
      finalUrl = documentUrl;
      if (!finalTitle) finalTitle = "Download Document";
    } else if (documentInputMode === "upload" && documentFile) {
      finalUrl = URL.createObjectURL(documentFile);
      if (!finalTitle) finalTitle = documentFile.name;
    } else if (documentInputMode === "library" && documentUrl) {
      finalUrl = documentUrl;
    }

    if (finalUrl && finalTitle) {
      // Insert document as a download link
      editor?.commands.insertContent(
        `<a href="${finalUrl}" download="${finalTitle}" class="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 no-underline" style="text-decoration: none;">📎 ${finalTitle}</a>`,
      );
    }

    // Reset and close modal
    setShowDocumentModal(false);
    setDocumentUrl("");
    setDocumentFile(null);
    setDocumentTitle("");
  };

  const addYoutubeVideo = () => {
    const url = window.prompt("Enter YouTube video URL:");
    if (url) {
      editor?.commands.setYoutubeVideo({ src: url });
    }
  };

  const addTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (window.location.href = "/admin/blog_posts")}
            className="inline-flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="Back to Blog Posts"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {postId ? "Edit Post" : "New Post"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {postId && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Publish
          </button>
          <button
            type="button"
            onClick={() => {
              if (!publishAt) {
                alert("Please set a publish date to schedule this post");
                return;
              }
              const publishDate = new Date(publishAt);
              const now = new Date();
              if (publishDate <= now) {
                alert("Publish date must be in the future");
                return;
              }
              handleSave("scheduled");
            }}
            disabled={isSaving}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-md hover:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Schedule
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Post metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-2 px-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Slug
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-url-slug"
            className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-2 px-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief description (optional, auto-generated if empty)..."
            rows={3}
            className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-2 px-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Banner Image
          </label>

          {/* Mode selector tabs */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setBannerInputMode("url")}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                bannerInputMode === "url"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Link2 className="w-4 h-4" />
              URL
            </button>
            <button
              type="button"
              onClick={() => setBannerInputMode("upload")}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                bannerInputMode === "upload"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setBannerInputMode("media");
                setShowMediaPicker(true);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                bannerInputMode === "media"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Media Library
            </button>
          </div>

          {/* URL input mode */}
          {bannerInputMode === "url" && (
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-2 px-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          )}

          {/* Upload mode */}
          {bannerInputMode === "upload" && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Upload a file
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Create a local URL for preview
                        const url = URL.createObjectURL(file);
                        setBannerImage(url);
                        // TODO: Upload to server and get permanent URL
                        alert(
                          "File upload will be implemented when backend is ready. Using temporary preview URL for now.",
                        );
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  or drag and drop
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          )}

          {/* Media library picker */}
          {bannerInputMode === "media" && showMediaPicker && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Select from Media Library
                </h4>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                Media library integration coming soon. For now, use URL or
                Upload options.
              </div>
            </div>
          )}

          {/* Preview */}
          {bannerImage && (
            <div className="mt-3 relative">
              <img
                src={bannerImage}
                alt="Banner preview"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setBannerImage("")}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Recommended size: 1920x1080px for optimal display
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Post
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Show this post on the landing page
          </p>
        </div>

        {/* Schedule Publishing */}
        <div>
          <label
            htmlFor="publishAt"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Schedule Publish Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="publishAt"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-2 px-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If set, the post will be automatically published at this date and
            time
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("code") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("highlight") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "left" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "center" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "right" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("heading", { level: 1 })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("bulletList")
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("orderedList")
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("blockquote")
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive("link") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Add Link"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addYoutubeVideo}
            className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Embed YouTube Video"
          >
            <YoutubeIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addTable}
            className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addDocument}
            className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Attach Document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Table Controls Bar - Only show when inside a table */}
        {editor.isActive("table") && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-indigo-900 dark:text-indigo-300">
                Table Controls:
              </span>

              {/* Column Controls */}
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400 text-xs mr-1">
                  Columns:
                </span>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Before
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add After
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

              {/* Row Controls */}
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400 text-xs mr-1">
                  Rows:
                </span>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Before
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add After
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

              {/* Delete Table */}
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="inline-flex items-center px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Table
              </button>
            </div>
          </div>
        )}

        {/* Editor content */}
        <EditorContent editor={editor} />

        {/* Footer stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
          {wordCount} words · {charCount} characters
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Link
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {/* Link Type Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setLinkType("external");
                    setLinkUrl("");
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    linkType === "external"
                      ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  External URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkType("internal");
                    setLinkUrl("");
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    linkType === "internal"
                      ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Internal Page
                </button>
              </div>

              {linkType === "external" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && linkText && linkUrl) {
                        handleInsertLink();
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Page
                  </label>
                  {pages.length > 0 ? (
                    <select
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select a page --</option>
                      {pages.map((page) => (
                        <option key={page.id} value={`/${page.slug}`}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No pages found. Create pages in the Pages collection
                      first.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkText("");
                    setLinkUrl("");
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  disabled={!linkText || !linkUrl}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Embed Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Media
            </h3>

            {/* Media Type Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMediaInputMode("upload");
                  setMediaUrl("");
                  setMediaPreview("");
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  mediaInputMode === "upload"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaInputMode("url");
                  setMediaFile(null);
                  setMediaPreview("");
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  mediaInputMode === "url"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaInputMode("library");
                  setMediaFile(null);
                  setMediaPreview("");
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  mediaInputMode === "library"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Media Library
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Tab */}
              {mediaInputMode === "upload" && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="media-upload"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="media-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Images or videos only (Max 10MB)
                      </span>
                    </label>
                  </div>
                  {mediaPreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Preview:
                      </p>
                      {mediaFile?.type.startsWith("image/") ? (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                      ) : mediaFile?.type.startsWith("video/") ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {mediaFile?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(mediaFile?.size || 0 / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* URL Tab */}
              {mediaInputMode === "url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {mediaUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Preview:
                      </p>
                      {mediaUrl.match(/\\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={mediaUrl}
                          alt="Preview"
                          className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : mediaUrl.match(/\\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={mediaUrl}
                          controls
                          className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No preview available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Media Library Tab */}
              {mediaInputMode === "library" && (
                <div>
                  {mediaItems.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {mediaItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMediaUrl(item.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                            mediaUrl === item.url
                              ? "border-indigo-600 dark:border-indigo-400"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          {item.type.startsWith("image") ? (
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : item.type.startsWith("video") ? (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-2">
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate">
                                {item.title}
                              </p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-8">
                      No media items found. Upload media to the Media collection
                      first.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaModal(false);
                    setMediaUrl("");
                    setMediaFile(null);
                    setMediaPreview("");
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertMedia}
                  disabled={!mediaUrl && !mediaPreview}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert Media
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Attach Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Attach Document
            </h3>

            {/* Document Type Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                type="button"
                onClick={() => {
                  setDocumentInputMode("upload");
                  setDocumentUrl("");
                  setDocumentFile(null);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  documentInputMode === "upload"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocumentInputMode("url");
                  setDocumentFile(null);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  documentInputMode === "url"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocumentInputMode("library");
                  setDocumentFile(null);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  documentInputMode === "library"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Documents Library
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Tab */}
              {documentInputMode === "upload" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Enter document title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="document-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Paperclip className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload document
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        PDF, Word, Excel, PowerPoint, Text, ZIP (Max 50MB)
                      </span>
                    </label>
                  </div>
                  {documentFile && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        📎 {documentFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* URL Tab */}
              {documentInputMode === "url" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Enter document title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document URL
                    </label>
                    <input
                      type="url"
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                      placeholder="https://example.com/document.pdf"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Documents Library Tab */}
              {documentInputMode === "library" && (
                <div>
                  {documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setDocumentUrl(doc.url);
                            setDocumentTitle(doc.title);
                          }}
                          className={`w-full p-4 rounded-lg border-2 text-left ${
                            documentUrl === doc.url
                              ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            📎 {doc.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {doc.filename}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-8">
                      No documents found. Upload documents to the Documents
                      collection first.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocumentModal(false);
                    setDocumentUrl("");
                    setDocumentFile(null);
                    setDocumentTitle("");
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertDocument}
                  disabled={!documentTitle || (!documentUrl && !documentFile)}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Attach Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Post
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{title || "this post"}"? It will
              be moved to trash and automatically deleted after 30 days.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
