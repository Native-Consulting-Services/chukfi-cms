import { useState, useEffect } from "react";
import {
  Calendar,
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  ArrowRight,
} from "lucide-react";

interface Stats {
  upcomingEvents: number;
  recentOrders: number;
  totalSpent: number;
  activeSubscriptions: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location?: string;
  status: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items_count?: number;
}

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    upcomingEvents: 0,
    recentOrders: 0,
    totalSpent: 0,
    activeSubscriptions: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("chukfi_user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    // Load stats and data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Use localStorage for events and registrations until backend is ready
      const storedEvents = localStorage.getItem("chukfi_events");
      const storedRegistrations = localStorage.getItem("chukfi_registrations");

      let allEvents = [];
      let userRegistrations = [];

      if (storedEvents) {
        allEvents = JSON.parse(storedEvents);
      }

      if (storedRegistrations) {
        const allRegistrations = JSON.parse(storedRegistrations);
        const userEmail = localStorage.getItem("chukfi_user_email");
        userRegistrations = allRegistrations.filter(
          (reg: any) => reg.user_email === userEmail || reg.email === userEmail,
        );
      }

      if (userRegistrations.length > 0) {
        // Load event details and filter upcoming events
        const now = new Date();
        const eventsWithDetails = userRegistrations
          .map((reg: any) => {
            const event = allEvents.find((e: any) => e.id === reg.event_id);
            if (event) {
              return {
                ...event,
                registrationStatus: reg.status,
              };
            }
            return null;
          })
          .filter((e: any) => e !== null);

        const upcoming = eventsWithDetails.filter((event: any) => {
          const eventDate = new Date(event.startDate || event.date);
          return eventDate > now && event.registrationStatus === "confirmed";
        });

        const past = eventsWithDetails.filter((event: any) => {
          const eventDate = new Date(event.startDate || event.date);
          return eventDate <= now && event.registrationStatus === "confirmed";
        });

        setUpcomingEvents(upcoming.slice(0, 3)); // Show top 3
        setPastEvents(past.slice(0, 5)); // Show top 5 past events
        setStats((prev) => ({ ...prev, upcomingEvents: upcoming.length }));
      }

      // TODO: Fetch orders when orders endpoint is ready
      // For now, use placeholder data
      setStats((prev) => ({
        ...prev,
        recentOrders: 0,
        totalSpent: 0,
        activeSubscriptions: 0,
      }));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">
          Welcome back, {user?.display_name || user?.name || "User"}!
        </h1>
        <p className="text-indigo-100">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Upcoming Events */}
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Upcoming Events
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.upcomingEvents}
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
              <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <a
            href="/dashboard/events"
            className="mt-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            View all events
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Recent Orders
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.recentOrders}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <a
            href="/dashboard/orders"
            className="mt-4 flex items-center text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400"
          >
            View all orders
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {/* Total Spent */}
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Spent
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Lifetime purchases
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Subscriptions
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.activeSubscriptions}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Active subscriptions
          </p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Upcoming Events
            </h2>
            <a
              href="/dashboard/events"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View all
            </a>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900">
                  <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDate(event.startDate || event.date)} at{" "}
                      {formatTime(event.startDate || event.date)}
                    </span>
                    {event.location && (
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`/event-details?id=${event.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Details
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Past Events
            </h2>
            <a
              href="/dashboard/events"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View all
            </a>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Event
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {pastEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(event.startDate || event.date)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {event.location || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/dashboard/events"
            className="flex items-center space-x-3 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
          >
            <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Browse Events
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find and register for events
              </p>
            </div>
          </a>

          <a
            href="/dashboard/browse-products"
            className="flex items-center space-x-3 rounded-lg border-2 border-green-200 bg-green-50 p-4 transition-colors hover:border-green-300 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50"
          >
            <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Shop Products
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse our catalog
              </p>
            </div>
          </a>

          <a
            href="/dashboard/profile"
            className="flex items-center space-x-3 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 transition-colors hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
          >
            <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Manage Profile
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your information
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* No Events CTA */}
      {upcomingEvents.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No Upcoming Events
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You haven't registered for any events yet. Browse our events to get
            started!
          </p>
          <a
            href="/dashboard/events"
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
