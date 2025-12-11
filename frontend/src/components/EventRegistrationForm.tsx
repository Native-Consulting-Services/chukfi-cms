import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Users, CheckCircle } from "lucide-react";

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

interface EventRegistrationFormProps {
  event: Event;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EventRegistrationForm({
  event,
  onClose,
  onSuccess,
}: EventRegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper to get event date
  const getEventDate = (evt: Event): string => {
    return evt.startDate || evt.date || "";
  };

  const eventId = event.id;
  const eventTitle = event.title;
  const eventDate = getEventDate(event);
  const location = event.location;
  const capacity = event.capacity;
  const currentRegistrations =
    event.registrations || event.current_registrations || 0;

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("chukfi_auth_token");
    setIsLoggedIn(!!token);
  }, []);

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) return;

      const userEmail = localStorage.getItem("chukfi_user_email");
      if (!userEmail) return;

      try {
        // Check localStorage for registration
        const storedRegistrations = localStorage.getItem(
          "chukfi_registrations",
        );
        if (storedRegistrations) {
          const registrations = JSON.parse(storedRegistrations);
          const existingRegistration = registrations.find(
            (reg: any) =>
              reg.event_id === eventId &&
              (reg.email === userEmail || reg.user_email === userEmail),
          );

          if (existingRegistration) {
            setIsRegistered(true);
            setRegistrationData(existingRegistration);
          }
        }
      } catch (err) {
        console.debug("Could not check registration status", err);
      }
    };

    checkRegistration();
  }, [eventId]);

  // Pre-fill user info if logged in
  useEffect(() => {
    const user = localStorage.getItem("chukfi_user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setName(userData.display_name || userData.name || "");
        setEmail(userData.email || "");
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      console.log("Auth token exists:", !!token);

      if (!token) {
        throw new Error("Please log in to register for events");
      }

      // For now, store registration in localStorage
      // TODO: Use backend API when event registration endpoints are ready
      const registration = {
        id: crypto.randomUUID(),
        event_id: eventId,
        user_email: email.trim(),
        email: email.trim(),
        name: name.trim(),
        notes: notes.trim() || undefined,
        status: "confirmed",
        registered_at: new Date().toISOString(),
      };

      // Get existing registrations
      const storedRegistrations = localStorage.getItem("chukfi_registrations");
      const registrations = storedRegistrations
        ? JSON.parse(storedRegistrations)
        : [];

      // Check if already registered
      const existingRegistration = registrations.find(
        (reg: any) => reg.event_id === eventId && reg.email === email.trim(),
      );

      if (existingRegistration) {
        throw new Error("You are already registered for this event");
      }

      // Add new registration
      registrations.push(registration);
      localStorage.setItem(
        "chukfi_registrations",
        JSON.stringify(registrations),
      );

      // Success
      setIsRegistered(true);
      setRegistrationData(registration);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Please log in to unregister");
      }

      const userEmail = localStorage.getItem("chukfi_user_email");

      // Remove from localStorage
      const storedRegistrations = localStorage.getItem("chukfi_registrations");
      if (storedRegistrations) {
        const registrations = JSON.parse(storedRegistrations);
        const updatedRegistrations = registrations.filter(
          (reg: any) =>
            !(
              reg.event_id === eventId &&
              (reg.email === userEmail || reg.user_email === userEmail)
            ),
        );
        localStorage.setItem(
          "chukfi_registrations",
          JSON.stringify(updatedRegistrations),
        );
      }

      setIsRegistered(false);
      setRegistrationData(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Unregister error:", err);
      setError(err.message || "Failed to unregister. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const spotsRemaining = capacity ? capacity - currentRegistrations : null;
  const isFull = capacity ? currentRegistrations >= capacity : false;

  // Show login prompt if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
        <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Login Required
            </h2>

            <div className="mb-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {eventTitle}
              </h3>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{new Date(eventDate).toLocaleString()}</span>
              </div>

              {location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Please create an account or log in to register for this event.
                This allows you to manage your registrations and receive event
                updates.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href="/signup"
                className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Account
              </a>
              <a
                href="/login"
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistered && registrationData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
        <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                You're Registered!
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {eventTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{new Date(eventDate).toLocaleString()}</span>
              </div>

              {location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confirmation sent to:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {registrationData.email}
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleUnregister}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
                >
                  {isSubmitting ? "Processing..." : "Unregister"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Register for Event
          </h2>

          <div className="mb-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {eventTitle}
            </h3>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{new Date(eventDate).toLocaleString()}</span>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}

            {capacity && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>
                  {spotsRemaining !== null && spotsRemaining > 0
                    ? `${spotsRemaining} spots remaining`
                    : isFull
                      ? "Event is full"
                      : `${currentRegistrations} registered`}
                </span>
              </div>
            )}
          </div>

          {isFull ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-center dark:bg-yellow-900/20">
              <p className="font-medium text-yellow-800 dark:text-yellow-400">
                This event is currently at full capacity
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Dietary restrictions, accessibility needs, etc."
                  className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
