import { useState, useEffect } from "react";
import { Users, Search, Mail, Calendar, CheckCircle } from "lucide-react";

interface Registration {
  id: string;
  event_id: string;
  user_id?: string;
  status: string;
  name: string;
  email: string;
  notes?: string;
  registered_at: string;
  checked_in_at?: string;
  user_display_name?: string;
}

interface AttendeeManagementProps {
  eventId: string;
  eventTitle: string;
}

export default function AttendeeManagement({
  eventId,
  eventTitle,
}: AttendeeManagementProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState({
    total_registrations: 0,
    checked_in_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRegistrations();
    fetchStats();
  }, [eventId]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/events/${eventId}/registrations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch registrations");
      }

      const data = await response.json();
      setRegistrations(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load registrations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) return;

      const response = await fetch(
        `http://localhost:8080/api/v1/events/${eventId}/registrations/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const query = searchQuery.toLowerCase();
    return (
      reg.name.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      (reg.user_display_name &&
        reg.user_display_name.toLowerCase().includes(query))
    );
  });

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "User Account",
      "Registered At",
      "Checked In",
      "Notes",
    ];
    const rows = registrations.map((reg) => [
      reg.name,
      reg.email,
      reg.user_display_name || "Guest",
      new Date(reg.registered_at).toLocaleString(),
      reg.checked_in_at ? "Yes" : "No",
      reg.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]/gi, "-")}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendee Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {eventTitle}
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={registrations.length === 0}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Registered
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total_registrations}
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Checked In
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.checked_in_count}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Not Checked In
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total_registrations - stats.checked_in_count}
              </p>
            </div>
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-700">
              <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-0 bg-gray-50 py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Loading registrations...
          </p>
        </div>
      )}

      {/* Registrations List */}
      {!isLoading && filteredRegistrations.length === 0 && (
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No registrations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? "No attendees match your search"
              : "When people register, they'll appear here"}
          </p>
        </div>
      )}

      {!isLoading && filteredRegistrations.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Attendee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {filteredRegistrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {reg.name}
                        </div>
                        {reg.user_display_name && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Account: {reg.user_display_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {reg.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reg.checked_in_at ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3" />
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Registered
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {reg.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
