import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  capacity?: number;
  current_registrations?: number;
  registration_mode?: string;
  status?: string;
}

interface Registration {
  id: string;
  event_id: string;
  status: string;
  name: string;
  email: string;
  notes?: string;
  registered_at: string;
}

export default function UserEventsDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Map<string, Event>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        setError("Please log in to view your events");
        setLoading(false);
        return;
      }

      // For now, use localStorage for both events and registrations
      // until backend API is fully implemented
      const storedEvents = localStorage.getItem("chukfi_events");
      const storedRegistrations = localStorage.getItem("chukfi_registrations");

      let allEvents = [];
      let userRegistrations = [];

      if (storedEvents) {
        allEvents = JSON.parse(storedEvents);
      }

      if (storedRegistrations) {
        const allRegistrations = JSON.parse(storedRegistrations);
        // Filter registrations for current user
        const userEmail = localStorage.getItem("chukfi_user_email");
        userRegistrations = allRegistrations.filter(
          (reg: any) => reg.user_email === userEmail || reg.email === userEmail,
        );
      }

      setRegistrations(userRegistrations);

      // Map event details
      const eventMap = new Map();
      userRegistrations.forEach((reg: Registration) => {
        const event = allEvents.find((e: Event) => e.id === reg.event_id);
        if (event) {
          eventMap.set(reg.event_id, event);
        }
      });
      setEvents(eventMap);
    } catch (err: any) {
      console.error("Failed to load registrations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Please log in to unregister");
      }

      // Remove from localStorage
      const storedRegistrations = localStorage.getItem("chukfi_registrations");
      if (storedRegistrations) {
        const allRegistrations = JSON.parse(storedRegistrations);
        const userEmail = localStorage.getItem("chukfi_user_email");
        const updatedRegistrations = allRegistrations.filter(
          (reg: any) =>
            !(
              reg.event_id === eventId &&
              (reg.user_email === userEmail || reg.email === userEmail)
            ),
        );
        localStorage.setItem(
          "chukfi_registrations",
          JSON.stringify(updatedRegistrations),
        );
      }

      // Reload registrations
      await loadRegistrations();
    } catch (err: any) {
      console.error("Unregister error:", err);
      alert(err.message || "Failed to unregister");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (event.status === "cancelled") return "Cancelled";
    if (eventDate < now) return "Past";
    return "Upcoming";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Upcoming: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: CheckCircle,
      },
      Past: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        icon: Clock,
      },
      Cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: XCircle,
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.Past;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.color}`}
      >
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </span>
    );
  };

  // Group events by status
  const upcomingEvents = registrations
    .filter((reg) => {
      const event = events.get(reg.event_id);
      return event && getEventStatus(event) === "Upcoming";
    })
    .sort((a, b) => {
      const eventA = events.get(a.event_id);
      const eventB = events.get(b.event_id);
      return (
        new Date(eventA!.date).getTime() - new Date(eventB!.date).getTime()
      );
    });

  const pastEvents = registrations
    .filter((reg) => {
      const event = events.get(reg.event_id);
      return event && getEventStatus(event) === "Past";
    })
    .sort((a, b) => {
      const eventA = events.get(a.event_id);
      const eventB = events.get(b.event_id);
      return (
        new Date(eventB!.date).getTime() - new Date(eventA!.date).getTime()
      );
    });

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="ml-3 text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Events
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage your event registrations
          </p>
        </div>
        <a
          href="/dashboard/browse-events"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Browse Events
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Upcoming Events
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingEvents.map((registration) => {
              const event = events.get(registration.event_id);
              if (!event) return null;

              return (
                <div
                  key={registration.id}
                  className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                >
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      {getStatusBadge(getEventStatus(event))}
                    </div>

                    {event.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {formatDate(event.date)} at {formatTime(event.date)}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.capacity && (
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span>
                            {event.current_registrations || 0} /{" "}
                            {event.capacity} registered
                          </span>
                        </div>
                      )}
                    </div>

                    {registration.notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Your Notes:
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {registration.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleUnregister(event.id)}
                        className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Unregister
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Past Events
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pastEvents.map((registration) => {
              const event = events.get(registration.event_id);
              if (!event) return null;

              return (
                <div
                  key={registration.id}
                  className="overflow-hidden rounded-lg bg-white opacity-75 shadow-md dark:bg-gray-800"
                >
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      {getStatusBadge(getEventStatus(event))}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {formatDate(event.date)} at {formatTime(event.date)}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {registrations.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No Events Yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You haven't registered for any events. Browse our events to find
            something interesting!
          </p>
          <a
            href="/dashboard/browse-events"
            className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Browse Events
          </a>
        </div>
      )}
    </div>
  );
}
