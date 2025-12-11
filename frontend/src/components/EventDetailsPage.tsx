import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
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
}

export default function EventDetailsPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = () => {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");

    if (!eventId) {
      setError(true);
      setLoading(false);
      return;
    }

    // Load events from localStorage
    const storedEvents = localStorage.getItem("chukfi_events");
    if (!storedEvents) {
      setError(true);
      setLoading(false);
      return;
    }

    const allEvents: Event[] = JSON.parse(storedEvents);
    const storedRegistrations = localStorage.getItem("chukfi_registrations");
    const allRegistrations = storedRegistrations
      ? JSON.parse(storedRegistrations)
      : [];

    // Update registration counts
    const registrationCounts = new Map<string, number>();
    allRegistrations.forEach((reg: any) => {
      const count = registrationCounts.get(reg.event_id) || 0;
      registrationCounts.set(reg.event_id, count + 1);
    });

    const events = allEvents.map((evt) => ({
      ...evt,
      registrations: registrationCounts.get(evt.id) || 0,
      current_registrations: registrationCounts.get(evt.id) || 0,
    }));

    const foundEvent = events.find((e) => e.id === eventId);

    if (!foundEvent) {
      setError(true);
      setLoading(false);
      return;
    }

    // Check if user is registered
    const userEmail = localStorage.getItem("chukfi_user_email");
    const userRegistrations = allRegistrations.filter(
      (reg: any) =>
        (reg.user_email === userEmail || reg.email === userEmail) &&
        reg.event_id === eventId,
    );

    setEvent(foundEvent);
    setRegistered(userRegistrations.length > 0);
    setLoading(false);
  };

  const handleUnregister = async () => {
    if (
      !event ||
      !confirm("Are you sure you want to unregister from this event?")
    ) {
      return;
    }

    const userEmail = localStorage.getItem("chukfi_user_email");
    const storedRegistrations = localStorage.getItem("chukfi_registrations");

    if (storedRegistrations) {
      const allRegistrations = JSON.parse(storedRegistrations);
      const updatedRegistrations = allRegistrations.filter(
        (reg: any) =>
          !(
            reg.event_id === event.id &&
            (reg.user_email === userEmail || reg.email === userEmail)
          ),
      );
      localStorage.setItem(
        "chukfi_registrations",
        JSON.stringify(updatedRegistrations),
      );
      loadEventData();
    }
  };

  const getEventDate = (evt: Event): string => {
    return evt.startDate || evt.date || "";
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (evt: Event): string => {
    const eventDate = new Date(getEventDate(evt));
    const now = new Date();

    if (eventDate < now) return "Past";
    const registrationCount =
      evt.registrations || evt.current_registrations || 0;
    if (evt.capacity && registrationCount >= evt.capacity) return "Full";
    return "Open";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading event details...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Event Not Found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <a
          href="/dashboard/events"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Browse Events
        </a>
      </div>
    );
  }

  const status = getEventStatus(event);
  const spotsRemaining = event.capacity
    ? event.capacity - (event.registrations || 0)
    : null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {event.title}
        </h1>
        {registered && (
          <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            You're Registered
          </span>
        )}
      </div>

      {/* Event Details Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <Calendar className="mt-0.5 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Date & Time
            </p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {formatDate(getEventDate(event))}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(getEventDate(event))}
            </p>
          </div>
        </div>

        {event.location && (
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <MapPin className="mt-0.5 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Location
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {event.location}
              </p>
            </div>
          </div>
        )}

        {event.capacity && (
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <Users className="mt-0.5 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Capacity
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {status === "Full"
                  ? "Event Full"
                  : `${spotsRemaining} spots remaining`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {event.registrations || 0} / {event.capacity} registered
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <Clock className="mt-0.5 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </p>
            <p
              className={`mt-1 font-semibold ${
                status === "Past"
                  ? "text-gray-500"
                  : status === "Full"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
              }`}
            >
              {status}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
            About This Event
          </h2>
          <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
            {event.description}
          </p>
        </div>
      )}

      {/* Registration Button */}
      <div>
        {registered && status !== "Past" ? (
          <button
            onClick={handleUnregister}
            className="w-full rounded-lg border-2 border-red-600 px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50 sm:w-auto dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20"
          >
            Unregister from Event
          </button>
        ) : registered && status === "Past" ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-500 sm:w-auto dark:bg-gray-700 dark:text-gray-400"
          >
            Event Ended
          </button>
        ) : status === "Past" ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-500 sm:w-auto dark:bg-gray-700 dark:text-gray-400"
          >
            Event Ended
          </button>
        ) : status === "Full" ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-500 sm:w-auto dark:bg-gray-700 dark:text-gray-400"
          >
            Event Full
          </button>
        ) : (
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            Register for Event
          </button>
        )}
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && event && (
        <EventRegistrationForm
          event={event}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={() => {
            setShowRegistrationForm(false);
            loadEventData();
          }}
        />
      )}
    </div>
  );
}
