import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
  UserPlus,
} from "lucide-react";
import EventRegistrationForm from "./EventRegistrationForm";

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
  status: "draft" | "published" | "cancelled";
  featured?: boolean;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published" | "cancelled"
  >("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const loadEvents = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_events");
      if (stored) {
        try {
          const parsedEvents: Event[] = JSON.parse(stored);
          const activeEvents = parsedEvents.filter((event) => !event.deletedAt);
          setEvents(activeEvents);
        } catch (e) {
          console.error("Failed to parse stored events", e);
          setEvents([]);
        }
      } else {
        // Initialize with sample data
        const sampleEvents: Event[] = [
          {
            id: "1",
            title: "Summer Tech Conference 2025",
            slug: "summer-tech-conference-2025",
            description:
              "Join us for a day of innovative tech talks and networking",
            content: "<p>Full event details here...</p>",
            startDate: "2025-07-15T09:00:00Z",
            endDate: "2025-07-15T17:00:00Z",
            location: "San Francisco, CA",
            venue: "Tech Hub Convention Center",
            capacity: 500,
            registrations: 234,
            status: "published",
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem("chukfi_events", JSON.stringify(sampleEvents));
        setEvents(sampleEvents);
      }
    }
  };

  useEffect(() => {
    loadEvents();

    const handleUpdate = () => {
      loadEvents();
    };

    window.addEventListener("eventsUpdated" as any, handleUpdate);

    return () => {
      window.removeEventListener("eventsUpdated" as any, handleUpdate);
    };
  }, []);

  const handleDelete = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!eventToDelete) return;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_events");
      if (stored) {
        try {
          const parsedEvents: Event[] = JSON.parse(stored);
          const updatedEvents = parsedEvents.map((e) =>
            e.id === eventToDelete.id
              ? { ...e, deletedAt: new Date().toISOString() }
              : e,
          );
          localStorage.setItem("chukfi_events", JSON.stringify(updatedEvents));
          setEvents(updatedEvents.filter((e) => !e.deletedAt));
          window.dispatchEvent(new CustomEvent("eventsUpdated"));
        } catch (e) {
          console.error("Failed to delete event", e);
        }
      }
    }

    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

  const upcomingCount = events.filter(
    (e) => new Date(e.startDate) > new Date(),
  ).length;
  const pastCount = events.filter(
    (e) => new Date(e.startDate) <= new Date(),
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Events
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your events and workshops
          </p>
        </div>
        <a
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Event
        </a>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Events
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {events.length}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Upcoming
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {upcomingCount}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Past
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {pastCount}
            </dd>
          </div>
        </dl>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg flex-1">
          <input
            type="search"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 bg-white py-2 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              statusFilter === "published"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              statusFilter === "draft"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Events table */}
      {filteredEvents.length > 0 ? (
        <div className="ring-opacity-5 overflow-hidden bg-white ring-1 shadow ring-black sm:rounded-lg dark:bg-gray-800 dark:ring-gray-700">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100"
                >
                  Event
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Date & Location
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Registrations
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {event.title}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {event.description.length > 60
                            ? event.description.substring(0, 60) + "..."
                            : event.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {event.capacity ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.registrations || 0} / {event.capacity}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                        event.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : event.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {event.status === "published" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowRegistrationForm(true);
                          }}
                          className="rounded-md p-2 text-green-600 hover:bg-green-50 hover:text-green-900 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                          title="Register"
                        >
                          <UserPlus className="h-5 w-5" />
                        </button>
                      )}
                      <a
                        href={`/admin/events/edit?id=${event.id}`}
                        className="rounded-md p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                        title="Edit"
                      >
                        <Pencil className="h-5 w-5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(event)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-900">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No events found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first event."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <div className="mt-6">
              <a
                href="/admin/events/new"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                New Event
              </a>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-85"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:p-6 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-medium text-gray-900 sm:mb-4 dark:text-white">
              Delete Event
            </h3>
            <p className="mb-4 text-sm text-gray-500 sm:mb-6 dark:text-gray-400">
              Are you sure you want to delete "{eventToDelete?.title}"? This
              action can be undone from the trash.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-4 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 sm:px-4"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration form modal */}
      {showRegistrationForm && selectedEvent && (
        <EventRegistrationForm
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          eventDate={selectedEvent.startDate}
          location={selectedEvent.location}
          capacity={selectedEvent.capacity}
          currentRegistrations={selectedEvent.registrations || 0}
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            loadEvents();
          }}
        />
      )}
    </div>
  );
}
