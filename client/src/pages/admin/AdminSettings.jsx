import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Save,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Check,
} from "lucide-react";

const STORAGE_KEY = "wanderlust_admin_settings";

const DEFAULT_SETTINGS = {
  siteName: "Wanderlust",
  siteEmail: "admin@wanderlust.com",
  siteDescription:
    "Discover unforgettable experiences and adventures around the world.",
  maintenanceMode: false,
  emailNotifications: true,
  bookingNotifications: true,
  reviewNotifications: true,
  registrationEnabled: true,
  requireEmailVerification: false,
  allowReviews: true,
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);

      if (!storedSettings) {
        setSettings(DEFAULT_SETTINGS);
        return;
      }

      const parsedSettings = JSON.parse(storedSettings);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
      });
    } catch (err) {
      console.error("Settings load error:", err);
      setSettings(DEFAULT_SETTINGS);
      setError("Unable to load settings.");
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSaved(false);
    setError("");

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3500);
    } catch (err) {
      console.error("Settings save error:", err);
      setError(
        "Unable to save settings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings to their default values?"
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
      setSaved(true);
      setError("");

      setTimeout(() => {
        setSaved(false);
      }, 3500);
    } catch (err) {
      console.error("Settings reset error:", err);
      setError(
        "Unable to reset settings. Please try again."
      );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>

          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl">
              Admin Settings
            </h1>

            <p className="text-gray-500 mt-1">
              Manage your platform configuration and preferences.
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {saved && (
          <motion.div
            key="success"
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div>
              <p className="font-semibold text-sm">
                Settings saved successfully
              </p>

              <p className="text-xs mt-0.5 text-emerald-600">
                Your platform preferences have been updated.
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />

            <p className="text-sm font-medium">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSave}
        className="space-y-6"
      >
        <SettingsSection
          icon={Globe}
          title="General Settings"
          description="Basic information about your platform."
        >
          <div className="grid md:grid-cols-2 gap-5">
            <InputField
              label="Website Name"
              value={settings.siteName}
              onChange={(value) =>
                handleChange("siteName", value)
              }
              placeholder="Wanderlust"
            />

            <InputField
              label="Website Email"
              type="email"
              value={settings.siteEmail}
              onChange={(value) =>
                handleChange("siteEmail", value)
              }
              placeholder="admin@example.com"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website Description
              </label>

              <textarea
                rows={4}
                value={settings.siteDescription}
                onChange={(e) =>
                  handleChange(
                    "siteDescription",
                    e.target.value
                  )
                }
                placeholder="Describe your website..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none resize-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />

              <p className="text-xs text-gray-400 mt-1.5">
                This description can be used throughout your public platform.
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Choose which notifications the admin should receive."
        >
          <div className="divide-y divide-gray-100">
            <ToggleRow
              title="Email Notifications"
              description="Receive important platform notifications by email."
              checked={settings.emailNotifications}
              onChange={(value) =>
                handleChange(
                  "emailNotifications",
                  value
                )
              }
            />

            <ToggleRow
              title="Booking Notifications"
              description="Get notified whenever a new booking is created."
              checked={settings.bookingNotifications}
              onChange={(value) =>
                handleChange(
                  "bookingNotifications",
                  value
                )
              }
            />

            <ToggleRow
              title="Review Notifications"
              description="Receive notifications when users submit reviews."
              checked={settings.reviewNotifications}
              onChange={(value) =>
                handleChange(
                  "reviewNotifications",
                  value
                )
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Shield}
          title="Security & Access"
          description="Control account registration and platform access."
        >
          <div className="divide-y divide-gray-100">
            <ToggleRow
              title="Allow New Registrations"
              description="Allow new users to create accounts on the platform."
              checked={settings.registrationEnabled}
              onChange={(value) =>
                handleChange(
                  "registrationEnabled",
                  value
                )
              }
            />

            <ToggleRow
              title="Require Email Verification"
              description="Require users to verify their email address before accessing the platform."
              checked={
                settings.requireEmailVerification
              }
              onChange={(value) =>
                handleChange(
                  "requireEmailVerification",
                  value
                )
              }
            />

            <ToggleRow
              title="Allow Reviews"
              description="Allow authenticated users to submit reviews for experiences."
              checked={settings.allowReviews}
              onChange={(value) =>
                handleChange(
                  "allowReviews",
                  value
                )
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Database}
          title="Platform Status"
          description="Control the availability of the public website."
        >
          <div
            className={`rounded-xl border p-4 transition ${
              settings.maintenanceMode
                ? "border-yellow-300 bg-yellow-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  settings.maintenanceMode
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">
                  Maintenance Mode
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  When enabled, visitors may see a maintenance
                  message instead of the normal website.
                </p>

                {settings.maintenanceMode && (
                  <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-yellow-700">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Maintenance mode is active
                  </span>
                )}
              </div>

              <Toggle
                checked={settings.maintenanceMode}
                onChange={(value) =>
                  handleChange(
                    "maintenanceMode",
                    value
                  )
                }
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Mail}
          title="System Information"
          description="Current application information."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard
              icon={Globe}
              title="Platform"
              value={settings.siteName || "Wanderlust"}
            />

            <InfoCard
              icon={Database}
              title="Database"
              value="MongoDB Atlas"
            />

            <InfoCard
              icon={Lock}
              title="Authentication"
              value="JWT"
            />
          </div>
        </SettingsSection>

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card p-5"
        >
          <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold">
                Save your changes
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Your settings will be stored for this application.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-5 py-3 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-primary-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

const SettingsSection = ({
  icon: Icon,
  title,
  description,
  children,
}) => {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="card overflow-hidden"
    >
      <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h2 className="font-display font-bold text-lg">
            {title}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </motion.section>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
  );
};

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-5">
      <div className="min-w-0">
        <p className="font-semibold text-sm text-gray-800">
          {title}
        </p>

        <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-6">
          {description}
        </p>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};

const Toggle = ({
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={
        checked
          ? "Disable setting"
          : "Enable setting"
      }
      onClick={() =>
        onChange(!checked)
      }
      className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-all duration-300 ${
        checked
          ? "bg-primary-600 shadow-md shadow-primary-600/20"
          : "bg-gray-300"
      }`}
    >
      <motion.span
        animate={{
          x: checked ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center"
      >
        {checked && (
          <Check className="w-3 h-3 text-primary-600" />
        )}
      </motion.span>
    </button>
  );
};

const InfoCard = ({
  icon: Icon,
  title,
  value,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition"
    >
      <div className="flex items-center gap-2 text-gray-400 mb-3">
        <Icon className="w-4 h-4" />

        <span className="text-xs font-semibold uppercase tracking-wide">
          {title}
        </span>
      </div>

      <p className="font-bold text-gray-800 truncate">
        {value}
      </p>
    </motion.div>
  );
};

export default AdminSettings;