import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Search,
  LogIn,
  UserPlus,
} from "lucide-react";
import EventRegistrationForm from "./EventRegistrationForm";
import UserMenu from "./UserMenu";

interface Event {
  id: string;
  title: string;
  description?: string;
  date?: string; // Legacy field
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

export default function PublicEventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadEvents();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("chukfi_auth_token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchTerm, events]);

  const loadEvents = async () => {
    try {
      // For now, load events from localStorage
      // TODO: When backend API is ready, fetch from http://localhost:8080/api/v1/events
      const storedEvents = localStorage.getItem("chukfi_events");
      console.log("Raw stored events:", storedEvents);

      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        console.log("Parsed events:", parsedEvents);

        // Filter to only show active, upcoming events
        const now = new Date();
        console.log("Current time:", now);

        const upcomingEvents = parsedEvents.filter((event: Event) => {
          const eventDate = new Date(event.startDate || event.date || "");
          console.log(
            `Event: ${event.title}, Status: ${event.status}, Date: ${eventDate}, Is Future: ${eventDate > now}`,
          );
          return (
            event.status !== "cancelled" &&
            event.status !== "draft" &&
            eventDate > now
          );
        });

        console.log("Filtered upcoming events:", upcomingEvents);
        setEvents(upcomingEvents);
        setFilteredEvents(upcomingEvents);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
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

  const getEventDate = (event: Event) => {
    return event.startDate || event.date || "";
  };

  const getSpotsRemaining = (event: Event) => {
    if (!event.capacity) return null;
    const currentRegs = event.registrations || event.current_registrations || 0;
    return event.capacity - currentRegs;
  };

  const isFull = (event: Event) => {
    if (!event.capacity) return false;
    const currentRegs = event.registrations || event.current_registrations || 0;
    return currentRegs >= event.capacity;
  };

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Upcoming Events
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Find and register for events that interest you
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <a
                    href="/dashboard"
                    className="hidden rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 sm:block dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                  >
                    My Dashboard
                  </a>
                  <UserMenu />
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="hidden items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:flex dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <LogIn className="h-4 w-4" />
                    Log In
                  </a>
                  <a
                    href="/signup"
                    className="hidden items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:flex"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white py-3 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const spotsRemaining = getSpotsRemaining(event);
              const eventIsFull = isFull(event);

              return (
                <div
                  key={event.id}
                  className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                >
                  {/* Event Header */}
                  <div className="flex-1 p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                    </div>

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
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      {event.capacity && (
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>
                            {event.current_registrations || 0} /{" "}
                            {event.capacity} registered
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Capacity Warning */}
                    {spotsRemaining !== null && spotsRemaining <= 10 && (
                      <div className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 dark:bg-yellow-900/20">
                        <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                          {eventIsFull
                            ? "Event is full"
                            : `Only ${spotsRemaining} spot${spotsRemaining !== 1 ? "s" : ""} remaining!`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                    <button
                      onClick={() => handleRegister(event)}
                      disabled={eventIsFull}
                      className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                      {eventIsFull ? (
                        "Event Full"
                      ) : (
                        <>
                          Register Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {searchTerm ? "No events found" : "No upcoming events"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Check back later for new events"}
            </p>
          </div>
        )}
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && selectedEvent && (
        <EventRegistrationForm
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          eventDate={getEventDate(selectedEvent)}
          location={selectedEvent.location}
          capacity={selectedEvent.capacity}
          currentRegistrations={
            selectedEvent.registrations || selectedEvent.current_registrations
          }
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setShowRegistrationForm(false);
            setSelectedEvent(null);
            loadEvents(); // Reload to update registration counts
          }}
        />
      )}
    </div>
  );
}
