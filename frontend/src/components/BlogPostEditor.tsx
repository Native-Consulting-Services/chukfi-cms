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
  author?: string;
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
  postId: postIdProp,
  onSave,
  onCancel,
}: BlogPostEditorProps) {
  // Get post ID from prop or URL query parameter
  const [postId, setPostId] = useState<string | undefined>(postIdProp);

  useEffect(() => {
    if (!postIdProp && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get("id");
      if (idFromUrl) {
        setPostId(idFromUrl);
      }
    }
  }, [postIdProp]);

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
            className="inline-flex items-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Back to Blog Posts"
          >
            <ArrowLeft className="h-5 w-5" />
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
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Save className="mr-2 h-4 w-4" />
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
            className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Save className="mr-2 h-4 w-4" />
            Schedule
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

      {/* Post metadata */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/50">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
        </div>

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
            placeholder="post-url-slug"
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief description (optional, auto-generated if empty)..."
            rows={3}
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Banner Image
          </label>

          {/* Mode selector tabs */}
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setBannerInputMode("url")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                bannerInputMode === "url"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <Link2 className="h-4 w-4" />
              URL
            </button>
            <button
              type="button"
              onClick={() => setBannerInputMode("upload")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                bannerInputMode === "upload"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setBannerInputMode("media");
                setShowMediaPicker(true);
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                bannerInputMode === "media"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
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
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
            />
          )}

          {/* Upload mode */}
          {bannerInputMode === "upload" && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
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
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  or drag and drop
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          )}

          {/* Media library picker */}
          {bannerInputMode === "media" && showMediaPicker && (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Select from Media Library
                </h4>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Media library integration coming soon. For now, use URL or
                Upload options.
              </div>
            </div>
          )}

          {/* Preview */}
          {bannerImage && (
            <div className="relative mt-3">
              <img
                src={bannerImage}
                alt="Banner preview"
                className="h-32 w-full rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setBannerImage("")}
                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Recommended size: 1920x1080px for optimal display
          </p>
        </div>

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
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Schedule Publish Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="publishAt"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If set, the post will be automatically published at this date and
            time
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/50">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2 dark:border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("code") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Code"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("highlight") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </button>

          <div className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "left" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "center" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "right" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </button>

          <div className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("heading", { level: 1 })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("bulletList")
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("orderedList")
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("blockquote")
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>

          <div className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={setLink}
            className={`rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              editor.isActive("link") ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            title="Add Link"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={addYoutubeVideo}
            className="rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Embed YouTube Video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-youtube-icon lucide-youtube"
            >
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
              <path d="m10 15 5-3-5-3z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={addTable}
            className="rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Insert Table"
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={addDocument}
            className="rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Attach Document"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <div className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="rounded p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="rounded p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Table Controls Bar - Only show when inside a table */}
        {editor.isActive("table") && (
          <div className="border-t border-gray-200 bg-indigo-50 px-4 py-2 dark:border-gray-700 dark:bg-indigo-900/20">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-indigo-900 dark:text-indigo-300">
                Table Controls:
              </span>

              {/* Column Controls */}
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs text-gray-600 dark:text-gray-400">
                  Columns:
                </span>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Before
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add After
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Minus className="mr-1 h-3 w-3" />
                  Delete
                </button>
              </div>

              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

              {/* Row Controls */}
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs text-gray-600 dark:text-gray-400">
                  Rows:
                </span>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Before
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add After
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Minus className="mr-1 h-3 w-3" />
                  Delete
                </button>
              </div>

              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

              {/* Delete Table */}
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="inline-flex items-center rounded border border-red-300 bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete Table
              </button>
            </div>
          </div>
        )}

        {/* Editor content */}
        <EditorContent editor={editor} />

        {/* Footer stats */}
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {wordCount} words · {charCount} characters
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Add Link
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                      ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                      ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Internal Page
                </button>
              </div>

              {linkType === "external" ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && linkText && linkUrl) {
                        handleInsertLink();
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Page
                  </label>
                  {pages.length > 0 ? (
                    <select
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">-- Select a page --</option>
                      {pages.map((page) => (
                        <option key={page.id} value={`/${page.slug}`}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 italic dark:text-gray-400">
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
                  className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  disabled={!linkText || !linkUrl}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Insert Media
            </h3>

            {/* Media Type Tabs */}
            <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setMediaInputMode("upload");
                  setMediaUrl("");
                  setMediaPreview("");
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  mediaInputMode === "upload"
                    ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                    ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                    ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Media Library
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Tab */}
              {mediaInputMode === "upload" && (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                    <input
                      type="file"
                      id="media-upload"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="media-upload"
                      className="flex cursor-pointer flex-col items-center"
                    >
                      <Upload className="mb-2 h-12 w-12 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload or drag and drop
                      </span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Images or videos only (Max 10MB)
                      </span>
                    </label>
                  </div>
                  {mediaPreview && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        Preview:
                      </p>
                      {mediaFile?.type.startsWith("image/") ? (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="h-auto max-w-full rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                      ) : mediaFile?.type.startsWith("video/") ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="h-auto max-w-full rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
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
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {mediaUrl && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        Preview:
                      </p>
                      {mediaUrl.match(/\\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={mediaUrl}
                          alt="Preview"
                          className="h-auto max-w-full rounded-lg border border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : mediaUrl.match(/\\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={mediaUrl}
                          controls
                          className="h-auto max-w-full rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <p className="text-sm text-gray-500 italic dark:text-gray-400">
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
                          className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                            mediaUrl === item.url
                              ? "border-indigo-600 dark:border-indigo-400"
                              : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                          }`}
                        >
                          {item.type.startsWith("image") ? (
                            <img
                              src={item.url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : item.type.startsWith("video") ? (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <Upload className="h-8 w-8 text-gray-400" />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 p-2 dark:bg-gray-700">
                              <p className="truncate text-center text-xs text-gray-600 dark:text-gray-400">
                                {item.title}
                              </p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-500 italic dark:text-gray-400">
                      No media items found. Upload media to the Media collection
                      first.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaModal(false);
                    setMediaUrl("");
                    setMediaFile(null);
                    setMediaPreview("");
                  }}
                  className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertMedia}
                  disabled={!mediaUrl && !mediaPreview}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Attach Document
            </h3>

            {/* Document Type Tabs */}
            <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setDocumentInputMode("upload");
                  setDocumentUrl("");
                  setDocumentFile(null);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  documentInputMode === "upload"
                    ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                    ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                    ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Enter document title"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                    <input
                      type="file"
                      id="document-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex cursor-pointer flex-col items-center"
                    >
                      <Paperclip className="mb-2 h-12 w-12 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload document
                      </span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        PDF, Word, Excel, PowerPoint, Text, ZIP (Max 50MB)
                      </span>
                    </label>
                  </div>
                  {documentFile && (
                    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        📎 {documentFile.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Enter document title"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document URL
                    </label>
                    <input
                      type="url"
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                      placeholder="https://example.com/document.pdf"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                          className={`w-full rounded-lg border-2 p-4 text-left ${
                            documentUrl === doc.url
                              ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20"
                              : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            📎 {doc.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {doc.filename}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-500 italic dark:text-gray-400">
                      No documents found. Upload documents to the Documents
                      collection first.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocumentModal(false);
                    setDocumentUrl("");
                    setDocumentFile(null);
                    setDocumentTitle("");
                  }}
                  className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertDocument}
                  disabled={!documentTitle || (!documentUrl && !documentFile)}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Post
              </h3>
            </div>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete "{title || "this post"}"? It will
              be moved to trash and automatically deleted after 30 days.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
