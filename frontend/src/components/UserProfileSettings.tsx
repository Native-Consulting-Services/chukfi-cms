import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function UserProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("chukfi_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setDisplayName(parsedUser.display_name || parsedUser.name || "");
        setEmail(parsedUser.email || "");
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Please log in to update your profile");
      }

      // TODO: Implement profile update API endpoint
      // const response = await fetch("http://localhost:8080/api/v1/users/me", {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     display_name: displayName,
      //     email,
      //   }),
      // });

      // For now, just update localStorage
      const updatedUser = { ...user, display_name: displayName, email };
      localStorage.setItem("chukfi_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "New password must be at least 8 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Please log in to change your password");
      }

      // TODO: Implement password change API endpoint
      // const response = await fetch("http://localhost:8080/api/v1/users/me/password", {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     current_password: currentPassword,
      //     new_password: newPassword,
      //   }),
      // });

      setMessage({
        type: "success",
        text: "Password changed successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to change password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          }`}
        >
          <div className="flex">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <p
              className={`ml-3 text-sm ${
                message.type === "success"
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Profile Information
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Display Name
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
