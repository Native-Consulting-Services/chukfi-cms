import React, { useState } from "react";

interface SettingsTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SettingsData {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: string;
    passwordMinLength: string;
    maxLoginAttempts: string;
    lockoutDuration: string;
  };
  api: {
    rateLimit: string;
    enableCors: boolean;
    corsOrigins: string;
    apiVersion: string;
  };
  storage: {
    provider: string;
    maxFileSize: string;
    allowedTypes: string;
    autoBackup: boolean;
    backupFrequency: string;
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    allowedIps: string;
  };
}

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      siteName: "Chukfi CMS",
      siteDescription: "A modern, flexible content management system",
      siteUrl: "https://cms.example.com",
      adminEmail: "admin@example.com",
      timezone: "UTC",
      language: "en",
    },
    email: {
      smtpHost: "smtp.example.com",
      smtpPort: "587",
      smtpUsername: "noreply@example.com",
      smtpPassword: "",
      fromEmail: "noreply@example.com",
      fromName: "Chukfi CMS",
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "24",
      passwordMinLength: "8",
      maxLoginAttempts: "5",
      lockoutDuration: "30",
    },
    api: {
      rateLimit: "100",
      enableCors: true,
      corsOrigins: "*",
      apiVersion: "v1",
    },
    storage: {
      provider: "local",
      maxFileSize: "10",
      allowedTypes: "jpg,jpeg,png,gif,pdf,doc,docx",
      autoBackup: true,
      backupFrequency: "daily",
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage:
        "System maintenance in progress. Please check back later.",
      allowedIps: "127.0.0.1",
    },
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const tabs: SettingsTab[] = [
    {
      id: "general",
      name: "General",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      ),
    },
    {
      id: "email",
      name: "Email",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "security",
      name: "Security",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      id: "api",
      name: "API",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "storage",
      name: "Storage",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7m0 0c0 2.21-3.582 4-8 4S4 9.21 4 7m0 0c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
    {
      id: "maintenance",
      name: "Maintenance",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const handleInputChange = (
    section: keyof SettingsData,
    field: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    // Save settings logic here
    console.log("Saving settings:", settings);
    setUnsavedChanges(false);
  };

  const handleReset = () => {
    // Reset to original values
    setUnsavedChanges(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="siteName"
            className="block text-sm font-medium text-gray-700"
          >
            Site Name
          </label>
          <input
            type="text"
            id="siteName"
            value={settings.general.siteName}
            onChange={(e) =>
              handleInputChange("general", "siteName", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="siteUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Site URL
          </label>
          <input
            type="url"
            id="siteUrl"
            value={settings.general.siteUrl}
            onChange={(e) =>
              handleInputChange("general", "siteUrl", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="siteDescription"
          className="block text-sm font-medium text-gray-700"
        >
          Site Description
        </label>
        <textarea
          id="siteDescription"
          rows={3}
          value={settings.general.siteDescription}
          onChange={(e) =>
            handleInputChange("general", "siteDescription", e.target.value)
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="adminEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Admin Email
          </label>
          <input
            type="email"
            id="adminEmail"
            value={settings.general.adminEmail}
            onChange={(e) =>
              handleInputChange("general", "adminEmail", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="timezone"
            className="block text-sm font-medium text-gray-700"
          >
            Timezone
          </label>
          <select
            id="timezone"
            value={settings.general.timezone}
            onChange={(e) =>
              handleInputChange("general", "timezone", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="smtpHost"
            className="block text-sm font-medium text-gray-700"
          >
            SMTP Host
          </label>
          <input
            type="text"
            id="smtpHost"
            value={settings.email.smtpHost}
            onChange={(e) =>
              handleInputChange("email", "smtpHost", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="smtpPort"
            className="block text-sm font-medium text-gray-700"
          >
            SMTP Port
          </label>
          <input
            type="number"
            id="smtpPort"
            value={settings.email.smtpPort}
            onChange={(e) =>
              handleInputChange("email", "smtpPort", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fromEmail"
            className="block text-sm font-medium text-gray-700"
          >
            From Email
          </label>
          <input
            type="email"
            id="fromEmail"
            value={settings.email.fromEmail}
            onChange={(e) =>
              handleInputChange("email", "fromEmail", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="fromName"
            className="block text-sm font-medium text-gray-700"
          >
            From Name
          </label>
          <input
            type="text"
            id="fromName"
            value={settings.email.fromName}
            onChange={(e) =>
              handleInputChange("email", "fromName", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          id="twoFactorAuth"
          type="checkbox"
          checked={settings.security.twoFactorAuth}
          onChange={(e) =>
            handleInputChange("security", "twoFactorAuth", e.target.checked)
          }
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <div className="ml-3">
          <label
            htmlFor="twoFactorAuth"
            className="text-sm font-medium text-gray-700"
          >
            Enable Two-Factor Authentication
          </label>
          <p className="text-sm text-gray-500">
            Require 2FA for all admin accounts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="sessionTimeout"
            className="block text-sm font-medium text-gray-700"
          >
            Session Timeout (hours)
          </label>
          <input
            type="number"
            id="sessionTimeout"
            value={settings.security.sessionTimeout}
            onChange={(e) =>
              handleInputChange("security", "sessionTimeout", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="passwordMinLength"
            className="block text-sm font-medium text-gray-700"
          >
            Min Password Length
          </label>
          <input
            type="number"
            id="passwordMinLength"
            value={settings.security.passwordMinLength}
            onChange={(e) =>
              handleInputChange("security", "passwordMinLength", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="maxLoginAttempts"
            className="block text-sm font-medium text-gray-700"
          >
            Max Login Attempts
          </label>
          <input
            type="number"
            id="maxLoginAttempts"
            value={settings.security.maxLoginAttempts}
            onChange={(e) =>
              handleInputChange("security", "maxLoginAttempts", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="rateLimit"
            className="block text-sm font-medium text-gray-700"
          >
            Rate Limit (requests/minute)
          </label>
          <input
            type="number"
            id="rateLimit"
            value={settings.api.rateLimit}
            onChange={(e) =>
              handleInputChange("api", "rateLimit", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="apiVersion"
            className="block text-sm font-medium text-gray-700"
          >
            API Version
          </label>
          <input
            type="text"
            id="apiVersion"
            value={settings.api.apiVersion}
            onChange={(e) =>
              handleInputChange("api", "apiVersion", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="enableCors"
          type="checkbox"
          checked={settings.api.enableCors}
          onChange={(e) =>
            handleInputChange("api", "enableCors", e.target.checked)
          }
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <div className="ml-3">
          <label
            htmlFor="enableCors"
            className="text-sm font-medium text-gray-700"
          >
            Enable CORS
          </label>
          <p className="text-sm text-gray-500">Allow cross-origin requests</p>
        </div>
      </div>

      <div>
        <label
          htmlFor="corsOrigins"
          className="block text-sm font-medium text-gray-700"
        >
          Allowed Origins
        </label>
        <input
          type="text"
          id="corsOrigins"
          value={settings.api.corsOrigins}
          onChange={(e) =>
            handleInputChange("api", "corsOrigins", e.target.value)
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="*.example.com, https://app.example.com"
        />
      </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="provider"
            className="block text-sm font-medium text-gray-700"
          >
            Storage Provider
          </label>
          <select
            id="provider"
            value={settings.storage.provider}
            onChange={(e) =>
              handleInputChange("storage", "provider", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="local">Local Storage</option>
            <option value="s3">Amazon S3</option>
            <option value="gcs">Google Cloud Storage</option>
            <option value="azure">Azure Blob Storage</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="maxFileSize"
            className="block text-sm font-medium text-gray-700"
          >
            Max File Size (MB)
          </label>
          <input
            type="number"
            id="maxFileSize"
            value={settings.storage.maxFileSize}
            onChange={(e) =>
              handleInputChange("storage", "maxFileSize", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="allowedTypes"
          className="block text-sm font-medium text-gray-700"
        >
          Allowed File Types
        </label>
        <input
          type="text"
          id="allowedTypes"
          value={settings.storage.allowedTypes}
          onChange={(e) =>
            handleInputChange("storage", "allowedTypes", e.target.value)
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="jpg,png,pdf,doc"
        />
      </div>

      <div className="flex items-center">
        <input
          id="autoBackup"
          type="checkbox"
          checked={settings.storage.autoBackup}
          onChange={(e) =>
            handleInputChange("storage", "autoBackup", e.target.checked)
          }
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <div className="ml-3">
          <label
            htmlFor="autoBackup"
            className="text-sm font-medium text-gray-700"
          >
            Enable Auto Backup
          </label>
          <p className="text-sm text-gray-500">
            Automatically backup database and files
          </p>
        </div>
      </div>
    </div>
  );

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          id="maintenanceMode"
          type="checkbox"
          checked={settings.maintenance.maintenanceMode}
          onChange={(e) =>
            handleInputChange(
              "maintenance",
              "maintenanceMode",
              e.target.checked
            )
          }
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <div className="ml-3">
          <label
            htmlFor="maintenanceMode"
            className="text-sm font-medium text-gray-700"
          >
            Enable Maintenance Mode
          </label>
          <p className="text-sm text-gray-500">
            Temporarily disable public access to the site
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="maintenanceMessage"
          className="block text-sm font-medium text-gray-700"
        >
          Maintenance Message
        </label>
        <textarea
          id="maintenanceMessage"
          rows={3}
          value={settings.maintenance.maintenanceMessage}
          onChange={(e) =>
            handleInputChange(
              "maintenance",
              "maintenanceMessage",
              e.target.value
            )
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="allowedIps"
          className="block text-sm font-medium text-gray-700"
        >
          Allowed IPs (during maintenance)
        </label>
        <input
          type="text"
          id="allowedIps"
          value={settings.maintenance.allowedIps}
          onChange={(e) =>
            handleInputChange("maintenance", "allowedIps", e.target.value)
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="127.0.0.1, 192.168.1.0/24"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "email":
        return renderEmailSettings();
      case "security":
        return renderSecuritySettings();
      case "api":
        return renderApiSettings();
      case "storage":
        return renderStorageSettings();
      case "maintenance":
        return renderMaintenanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Unsaved changes notification */}
      {unsavedChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Unsaved Changes
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                You have unsaved changes. Make sure to save your settings before
                leaving this page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="max-w-3xl">{renderTabContent()}</div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
