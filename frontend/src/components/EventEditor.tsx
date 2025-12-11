import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  startDate: string;
  endDate?: string;
  location?: string;
  venue?: string;
  capacity?: number;
  registrations?: number;
  registrationMode?: "internal" | "external" | "disabled";
  externalUrl?: string;
  status: "draft" | "published" | "cancelled";
  featured?: boolean;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface EventEditorProps {
  eventId?: string;
}

export default function EventEditor({
  eventId: eventIdProp,
}: EventEditorProps) {
  const [eventId, setEventId] = useState<string | undefined>(eventIdProp);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [registrationMode, setRegistrationMode] = useState<
    "internal" | "external" | "disabled"
  >("internal");
  const [externalUrl, setExternalUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "cancelled">(
    "draft",
  );
  const [featured, setFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get event ID from URL if not provided as prop
  useEffect(() => {
    if (!eventIdProp && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get("id");
      if (idFromUrl) {
        setEventId(idFromUrl);
      }
    }
  }, [eventIdProp]);

  // Load existing event data
  useEffect(() => {
    if (eventId && typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_events");
      if (stored) {
        try {
          const events: Event[] = JSON.parse(stored);
          const event = events.find((e) => e.id === eventId);
          if (event) {
            setTitle(event.title);
            setSlug(event.slug);
            setDescription(event.description);
            setContent(event.content);
            setStartDate(
              event.startDate.split("T")[0] +
                "T" +
                event.startDate.split("T")[1].substring(0, 5),
            );
            if (event.endDate) {
              setEndDate(
                event.endDate.split("T")[0] +
                  "T" +
                  event.endDate.split("T")[1].substring(0, 5),
              );
            }
            setLocation(event.location || "");
            setVenue(event.venue || "");
            setCapacity(event.capacity?.toString() || "");
            setRegistrationMode(event.registrationMode || "internal");
            setExternalUrl(event.externalUrl || "");
            setStatus(event.status);
            setFeatured(event.featured || false);
          }
        } catch (e) {
          console.error("Failed to load event", e);
        }
      }
    }
  }, [eventId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!eventId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, eventId]);

  const handleSave = (saveStatus: "draft" | "published") => {
    if (!title.trim()) {
      alert("Please enter an event title");
      return;
    }

    if (!startDate) {
      alert("Please select a start date");
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();

    const event: Event = {
      id: eventId || Date.now().toString(),
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description.trim(),
      content: content.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      location: location.trim() || undefined,
      venue: venue.trim() || undefined,
      capacity: capacity ? parseInt(capacity) : undefined,
      registrations: eventId ? undefined : 0,
      registrationMode,
      externalUrl: externalUrl.trim() || undefined,
      status: saveStatus,
      featured,
      createdAt: eventId ? (undefined as any) : now,
      updatedAt: now,
    };

    // Save to localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_events");
      let events: Event[] = [];
      if (stored) {
        try {
          events = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored events", e);
        }
      }

      if (eventId) {
        // Update existing event
        events = events.map((e) => (e.id === eventId ? { ...e, ...event } : e));
      } else {
        // Add new event
        events.push(event);
      }

      localStorage.setItem("chukfi_events", JSON.stringify(events));
      window.dispatchEvent(new CustomEvent("eventsUpdated"));

      // Redirect to events list after successful save
      setTimeout(() => {
        window.location.href = "/admin/events";
      }, 500);
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/admin/events"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {eventId ? "Edit Event" : "New Event"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Event details */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Event Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Tech Conference 2025"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="slug"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              URL Slug
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="summer-tech-conference-2025"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Short Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A brief description of the event"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              End Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, CA"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="venue"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Venue
            </label>
            <input
              type="text"
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Convention Center"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="capacity"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Capacity (Optional)
            </label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="500"
              min="0"
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="registrationMode"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Registration Mode
            </label>
            <select
              id="registrationMode"
              value={registrationMode}
              onChange={(e) =>
                setRegistrationMode(
                  e.target.value as "internal" | "external" | "disabled",
                )
              }
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            >
              <option value="internal">Internal Registration</option>
              <option value="external">External Link</option>
              <option value="disabled">Registration Disabled</option>
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {registrationMode === "internal" &&
                "Users can register directly through your CMS"}
              {registrationMode === "external" &&
                "Link to external registration (Eventbrite, etc.)"}
              {registrationMode === "disabled" &&
                "Registration is not available for this event"}
            </p>
          </div>

          {registrationMode === "external" && (
            <div className="md:col-span-2">
              <label
                htmlFor="externalUrl"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                External Registration URL
              </label>
              <input
                type="url"
                id="externalUrl"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://eventbrite.com/your-event"
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published" | "cancelled")
              }
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Event
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="content"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Event Details
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Full event description, schedule, speakers, etc."
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
