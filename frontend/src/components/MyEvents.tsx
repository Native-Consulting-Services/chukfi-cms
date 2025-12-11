import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, AlertCircle, Trash2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  venue?: string;
  capacity?: number;
  status: "draft" | "published" | "cancelled";
}

interface Registration {
  id: string;
  event_id: string;
  status: string;
  name: string;
  email: string;
  notes?: string;
  registered_at: string;
  checked_in_at?: string;
}

export default function MyEvents() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Map<string, Event>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        setError("Please log in to view your events");
        setIsLoading(false);
        return;
      }

      // Get user's registrations from the backend
      const response = await fetch(
        "http://localhost:8080/api/v1/events/my-registrations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load your events");
      }

      const data = await response.json();
      setRegistrations(data || []);

      // Load event details from localStorage
      const storedEvents = localStorage.getItem("chukfi_events");
      if (storedEvents) {
        try {
          const eventsArray: Event[] = JSON.parse(storedEvents);
          const eventsMap = new Map<string, Event>();
          eventsArray.forEach((event) => {
            eventsMap.set(event.id, event);
          });
          setEvents(eventsMap);
        } catch (e) {
          console.error("Failed to parse events", e);
        }
      }
    } catch (err: any) {
      console.error("Failed to load events", err);
      setError(err.message || "Failed to load your registered events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Please log in");
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/events/${eventId}/registrations`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to unregister");
      }

      // Refresh the list
      loadMyEvents();
    } catch (err: any) {
      alert(err.message || "Failed to unregister from event");
    }
  };

  const getEventStatus = (event: Event, registration: Registration) => {
    if (event.status === "cancelled") {
      return { text: "Cancelled", color: "red" };
    }
    const eventDate = new Date(event.startDate);
    const now = new Date();
    if (eventDate < now) {
      return { text: "Past", color: "gray" };
    }
    if (registration.checked_in_at) {
      return { text: "Attended", color: "green" };
    }
    return { text: "Upcoming", color: "blue" };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Events
        </h2>
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Loading your events...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Events
        </h2>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Events
        </h2>
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No events yet
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You haven't registered for any events yet.
          </p>
          <a
            href="/admin/events"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Browse Events
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Events
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {registrations.length}{" "}
          {registrations.length === 1 ? "event" : "events"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {registrations.map((registration) => {
          const event = events.get(registration.event_id);
          if (!event) return null;

          const status = getEventStatus(event, registration);

          return (
            <div
              key={registration.id}
              className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    status.color === "red"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : status.color === "green"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : status.color === "blue"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {status.text}
                </span>
              </div>

              {event.description && (
                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {event.capacity}</span>
                  </div>
                )}
              </div>

              {registration.notes && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Your notes:
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {registration.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <a
                  href={`/admin/events/edit?id=${event.id}`}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  View Details
                </a>
                {status.text === "Upcoming" && (
                  <button
                    onClick={() => handleUnregister(event.id)}
                    className="rounded-md border border-red-300 bg-white p-2 text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    title="Unregister"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Registered{" "}
                {new Date(registration.registered_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
