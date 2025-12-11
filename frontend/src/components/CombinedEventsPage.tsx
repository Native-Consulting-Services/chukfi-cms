import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import EventRegistrationForm from "./EventRegistrationForm";

interface Event {
  id: string;
  title: string;
  description?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  current_registrations?: number;
  registrations?: number;
  registration_mode?: string;
  registrationMode?: string;
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

export default function CombinedEventsPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "registered">("browse");
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registeredEventsMap, setRegisteredEventsMap] = useState<
    Map<string, Event>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "full">(
    "all",
  );

  // My Registrations filters
  const [regSearchTerm, setRegSearchTerm] = useState("");
  const [regLocationFilter, setRegLocationFilter] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState<
    "all" | "confirmed" | "pending" | "cancelled"
  >("all");
  const [showPastRegistrations, setShowPastRegistrations] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "browse") {
      const now = new Date();
      let filtered = allEvents;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      // Filter by past events
      if (!showPastEvents) {
        filtered = filtered.filter((event) => {
          const eventDate = new Date(getEventDate(event));
          return eventDate > now;
        });
      }

      // Filter by location
      if (locationFilter) {
        filtered = filtered.filter((event) =>
          event.location?.toLowerCase().includes(locationFilter.toLowerCase()),
        );
      }

      // Filter by status
      if (statusFilter !== "all") {
        filtered = filtered.filter((event) => {
          const eventStatus = getEventStatus(event);
          if (statusFilter === "open") return eventStatus === "Open";
          if (statusFilter === "full") return eventStatus === "Full";
          return true;
        });
      }

      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(allEvents);
    }
  }, [
    searchTerm,
    allEvents,
    activeTab,
    showPastEvents,
    locationFilter,
    statusFilter,
  ]);

  const loadData = async () => {
    try {
      // Load all events
      const storedEvents = localStorage.getItem("chukfi_events");
      let events: Event[] = [];

      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);

        events = parsedEvents.filter((event: Event) => {
          return event.status !== "cancelled" && event.status !== "draft";
        });
      }

      // Update registration counts from localStorage
      const storedRegistrations = localStorage.getItem("chukfi_registrations");
      if (storedRegistrations) {
        const allRegistrations = JSON.parse(storedRegistrations);

        // Count registrations per event
        const registrationCounts = new Map<string, number>();
        allRegistrations.forEach((reg: any) => {
          const count = registrationCounts.get(reg.event_id) || 0;
          registrationCounts.set(reg.event_id, count + 1);
        });

        // Update events with actual registration counts
        events = events.map((event) => ({
          ...event,
          registrations: registrationCounts.get(event.id) || 0,
          current_registrations: registrationCounts.get(event.id) || 0,
        }));
      }

      setAllEvents(events);
      setFilteredEvents(events);

      // Load user registrations
      const token = localStorage.getItem("chukfi_auth_token");
      if (token) {
        const storedRegistrations = localStorage.getItem(
          "chukfi_registrations",
        );
        if (storedRegistrations) {
          const allRegistrations = JSON.parse(storedRegistrations);
          const userEmail = localStorage.getItem("chukfi_user_email");

          // Get all stored events (including past ones) to build complete event map
          const allStoredEvents = storedEvents ? JSON.parse(storedEvents) : [];

          const userRegs = allRegistrations.filter(
            (reg: any) =>
              reg.user_email === userEmail || reg.email === userEmail,
          );

          setRegistrations(userRegs);

          // Map registered events - use all events, not just upcoming
          const eventMap = new Map();
          userRegs.forEach((reg: Registration) => {
            const event = allStoredEvents.find(
              (e: Event) => e.id === reg.event_id,
            );
            if (event) {
              eventMap.set(reg.event_id, event);
            }
          });
          setRegisteredEventsMap(eventMap);
        }
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventDate = (event: Event): string => {
    return event.startDate || event.date || "";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getSpotsRemaining = (event: Event): number => {
    if (!event.capacity) return Infinity;
    const registered = event.registrations || event.current_registrations || 0;
    return event.capacity - registered;
  };

  const isFull = (event: Event): boolean => {
    if (!event.capacity) return false;
    const registered = event.registrations || event.current_registrations || 0;
    return registered >= event.capacity;
  };

  const isUserRegistered = (eventId: string): boolean => {
    return registrations.some((reg) => reg.event_id === eventId);
  };

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleUnregister = async (eventId: string) => {
    if (!confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    try {
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

      await loadData();
    } catch (err: any) {
      console.error("Failed to unregister:", err);
    }
  };

  const getEventStatus = (event: Event): string => {
    const eventDate = new Date(getEventDate(event));
    const now = new Date();

    if (eventDate < now) return "Past";
    if (isFull(event)) return "Full";
    return "Open";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: {
        icon: CheckCircle,
        text: "Confirmed",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      pending: {
        icon: Clock,
        text: "Pending",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      cancelled: {
        icon: XCircle,
        text: "Cancelled",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
      >
        <Icon className="mr-1 h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const upcomingRegistrations = registrations.filter((reg) => {
    const event = registeredEventsMap.get(reg.event_id);
    return event && getEventStatus(event) !== "Past";
  });

  const pastRegistrations = registrations.filter((reg) => {
    const event = registeredEventsMap.get(reg.event_id);
    return event && getEventStatus(event) === "Past";
  });

  // Apply filters to registrations
  const getFilteredRegistrations = () => {
    let filtered = showPastRegistrations
      ? [...upcomingRegistrations, ...pastRegistrations]
      : upcomingRegistrations;

    // Filter by search term
    if (regSearchTerm) {
      filtered = filtered.filter((reg) => {
        const event = registeredEventsMap.get(reg.event_id);
        if (!event) return false;
        return (
          event.title.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
          event.description
            ?.toLowerCase()
            .includes(regSearchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(regSearchTerm.toLowerCase())
        );
      });
    }

    // Filter by location
    if (regLocationFilter) {
      filtered = filtered.filter((reg) => {
        const event = registeredEventsMap.get(reg.event_id);
        return event?.location
          ?.toLowerCase()
          .includes(regLocationFilter.toLowerCase());
      });
    }

    // Filter by registration status
    if (regStatusFilter !== "all") {
      filtered = filtered.filter((reg) => reg.status === regStatusFilter);
    }

    return filtered;
  };

  const filteredRegistrations = getFilteredRegistrations();
  const filteredUpcomingRegistrations = filteredRegistrations.filter((reg) => {
    const event = registeredEventsMap.get(reg.event_id);
    return event && getEventStatus(event) !== "Past";
  });
  const filteredPastRegistrations = filteredRegistrations.filter((reg) => {
    const event = registeredEventsMap.get(reg.event_id);
    return event && getEventStatus(event) === "Past";
  });

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Events
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse upcoming events and manage your registrations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("browse")}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "browse"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Browse Events
          </button>
          <button
            onClick={() => setActiveTab("registered")}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "registered"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            My Registrations{" "}
            {upcomingRegistrations.length + pastRegistrations.length > 0 &&
              `(${upcomingRegistrations.length + pastRegistrations.length})`}
          </button>
        </nav>
      </div>

      {/* Browse Events Tab */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Location Filter */}
              <div className="min-w-[200px] flex-1">
                <label
                  htmlFor="locationFilter"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Location
                </label>
                <input
                  id="locationFilter"
                  type="text"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <div className="min-w-[200px] flex-1">
                <label
                  htmlFor="statusFilter"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "all" | "open" | "full")
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Events</option>
                  <option value="open">Open for Registration</option>
                  <option value="full">Full Events</option>
                </select>
              </div>

              {/* Show Past Events Checkbox */}
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center space-x-2 pb-2">
                  <input
                    type="checkbox"
                    checked={showPastEvents}
                    onChange={(e) => setShowPastEvents(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Past Events
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No Events Found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "There are no upcoming events at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const registered = isUserRegistered(event.id);
                const status = getEventStatus(event);
                const spotsRemaining = getSpotsRemaining(event);

                return (
                  <div
                    key={event.id}
                    className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                  >
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {event.title}
                        </h3>
                        {registered && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Registered
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>
                            {formatDate(getEventDate(event))} at{" "}
                            {formatTime(getEventDate(event))}
                          </span>
                        </div>

                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}

                        {event.capacity && (
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>
                              {status === "Full"
                                ? "Event Full"
                                : `${spotsRemaining} spots remaining`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto space-y-2 pt-4">
                        <a
                          href={`/event-details?id=${event.id}`}
                          className="block w-full rounded-lg border-2 border-indigo-600 px-4 py-2 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                        >
                          View Details
                        </a>
                        {registered && status !== "Past" ? (
                          <button
                            onClick={() => handleUnregister(event.id)}
                            className="w-full rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20"
                          >
                            Unregister
                          </button>
                        ) : registered && status === "Past" ? (
                          <button
                            disabled
                            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          >
                            Event Ended
                          </button>
                        ) : status === "Past" ? (
                          <button
                            disabled
                            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          >
                            Event Ended
                          </button>
                        ) : status === "Full" ? (
                          <button
                            disabled
                            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          >
                            Event Full
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(event)}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                          >
                            Register Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Registrations Tab */}
      {activeTab === "registered" && (
        <div className="space-y-6">
          {registrations.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No Registrations Yet
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You haven't registered for any events. Browse events to find
                something interesting!
              </p>
              <button
                onClick={() => setActiveTab("browse")}
                className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Browse Events
              </button>
            </div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your registrations..."
                    value={regSearchTerm}
                    onChange={(e) => setRegSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  {/* Location Filter */}
                  <div className="min-w-[200px] flex-1">
                    <label
                      htmlFor="regLocationFilter"
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Location
                    </label>
                    <input
                      id="regLocationFilter"
                      type="text"
                      placeholder="Filter by location..."
                      value={regLocationFilter}
                      onChange={(e) => setRegLocationFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="min-w-[200px] flex-1">
                    <label
                      htmlFor="regStatusFilter"
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Registration Status
                    </label>
                    <select
                      id="regStatusFilter"
                      value={regStatusFilter}
                      onChange={(e) =>
                        setRegStatusFilter(
                          e.target.value as
                            | "all"
                            | "confirmed"
                            | "pending"
                            | "cancelled",
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Show Past Registrations Checkbox */}
                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center space-x-2 pb-2">
                      <input
                        type="checkbox"
                        checked={showPastRegistrations}
                        onChange={(e) =>
                          setShowPastRegistrations(e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Past Events
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* All Registrations */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredUpcomingRegistrations.map((registration) => {
                  const event = registeredEventsMap.get(registration.event_id);
                  if (!event) return null;

                  return (
                    <div
                      key={registration.id}
                      className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
                    >
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          {getStatusBadge(registration.status)}
                        </div>

                        {event.description && (
                          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>
                              {formatDate(getEventDate(event))} at{" "}
                              {formatTime(getEventDate(event))}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto space-y-2 pt-4">
                          <a
                            href={`/event-details?id=${event.id}`}
                            className="block w-full rounded-lg border-2 border-indigo-600 px-4 py-2 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                          >
                            View Details
                          </a>
                          <button
                            onClick={() => handleUnregister(event.id)}
                            className="w-full rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20"
                          >
                            Unregister
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredPastRegistrations.map((registration) => {
                  const event = registeredEventsMap.get(registration.event_id);
                  if (!event) return null;

                  return (
                    <div
                      key={registration.id}
                      className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
                    >
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          {getStatusBadge(registration.status)}
                        </div>

                        {event.description && (
                          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>
                              {formatDate(getEventDate(event))} at{" "}
                              {formatTime(getEventDate(event))}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto space-y-2 pt-4">
                          <a
                            href={`/event-details?id=${event.id}`}
                            className="block w-full rounded-lg border-2 border-indigo-600 px-4 py-2 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                          >
                            View Details
                          </a>
                          <button
                            disabled
                            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          >
                            Event Ended
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && selectedEvent && (
        <EventRegistrationForm
          event={selectedEvent}
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedEvent(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
