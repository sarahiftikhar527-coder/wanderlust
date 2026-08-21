import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  MessageSquare,
  User,
  Calendar,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("wanderlust_access_token") ||
      localStorage.getItem("wanderlust_token") ||
      localStorage.getItem("authToken")
    );
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const parseJson = async (response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  const extractPayload = (responseData) => {
    if (!responseData) {
      return {};
    }

    if (
      responseData.data &&
      typeof responseData.data === "object" &&
      !Array.isArray(responseData.data)
    ) {
      return responseData.data;
    }

    return responseData;
  };

  const normalizeContacts = (responseData) => {
    if (!responseData) {
      return [];
    }

    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData.contacts)) {
      return responseData.contacts;
    }

    if (Array.isArray(responseData.messages)) {
      return responseData.messages;
    }

    if (Array.isArray(responseData.results)) {
      return responseData.results;
    }

    if (
      responseData.data &&
      typeof responseData.data === "object"
    ) {
      return normalizeContacts(responseData.data);
    }

    return [];
  };

  const extractSingleContact = (responseData) => {
    if (!responseData) {
      return null;
    }

    if (
      responseData.contact &&
      typeof responseData.contact === "object"
    ) {
      return responseData.contact;
    }

    if (
      responseData.messageData &&
      typeof responseData.messageData === "object"
    ) {
      return responseData.messageData;
    }

    if (
      responseData.data &&
      typeof responseData.data === "object"
    ) {
      return extractSingleContact(responseData.data);
    }

    if (
      responseData._id &&
      typeof responseData === "object"
    ) {
      return responseData;
    }

    return null;
  };

  const fetchContacts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin authentication token not found. Please login again."
        );
      }

      const response = await fetch(`${API_URL}/contacts`, {
        method: "GET",
        headers: getHeaders(),
      });

      const responseData = await parseJson(response);

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            responseData?.data?.message ||
            "Unable to load contact messages"
        );
      }

      const payload = extractPayload(responseData);
      const normalizedContacts = normalizeContacts(payload);

      setContacts(normalizedContacts);

      if (showRefresh) {
        toast.success("Messages refreshed");
      }
    } catch (error) {
      console.error("Contacts fetch error:", error);

      setContacts([]);

      toast.error(
        error?.message || "Unable to load contact messages"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      const name = String(contact?.name || "").toLowerCase();
      const email = String(contact?.email || "").toLowerCase();
      const subject = String(
        contact?.subject || ""
      ).toLowerCase();
      const message = String(
        contact?.message || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        subject.includes(query) ||
        message.includes(query);

      const status = String(
        contact?.status || "NEW"
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter(
        (item) =>
          String(item?.status || "NEW").toUpperCase() ===
          "NEW"
      ).length,
      read: contacts.filter(
        (item) =>
          String(item?.status || "").toUpperCase() ===
          "READ"
      ).length,
      replied: contacts.filter(
        (item) =>
          String(item?.status || "").toUpperCase() ===
          "REPLIED"
      ).length,
    };
  }, [contacts]);

  const updateStatus = async (id, status) => {
    if (!id || updatingStatus) {
      return;
    }

    try {
      setUpdatingStatus(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/contacts/${id}/status`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            status,
          }),
        }
      );

      const responseData = await parseJson(response);

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            responseData?.data?.message ||
            "Unable to update message status"
        );
      }

      const updatedContact =
        extractSingleContact(responseData);

      setContacts((previousContacts) =>
        previousContacts.map((contact) => {
          if (contact._id !== id) {
            return contact;
          }

          return {
            ...contact,
            status,
            ...(updatedContact || {}),
          };
        })
      );

      setSelectedContact((previousContact) => {
        if (
          !previousContact ||
          previousContact._id !== id
        ) {
          return previousContact;
        }

        return {
          ...previousContact,
          status,
          ...(updatedContact || {}),
        };
      });

      toast.success(
        `Message marked as ${status.toLowerCase()}`
      );
    } catch (error) {
      console.error("Status update error:", error);

      toast.error(
        error?.message ||
          "Unable to update message status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteContact = async (id) => {
    if (!id || deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/contacts/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const responseData = await parseJson(response);

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            responseData?.data?.message ||
            "Unable to delete message"
        );
      }

      setContacts((previousContacts) =>
        previousContacts.filter(
          (contact) => contact._id !== id
        )
      );

      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }

      toast.success(
        "Message deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete contact error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to delete message"
      );
    } finally {
      setDeleting(false);
    }
  };

  const openContact = async (contact) => {
    if (!contact) {
      return;
    }

    setSelectedContact(contact);

    const status = String(
      contact.status || "NEW"
    ).toUpperCase();

    if (status === "NEW") {
      await updateStatus(
        contact._id,
        "READ"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getStatusClasses = (status) => {
    const currentStatus = String(
      status || "NEW"
    ).toUpperCase();

    if (currentStatus === "NEW") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (currentStatus === "READ") {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }

    if (currentStatus === "REPLIED") {
      return "bg-purple-50 text-purple-700 border-purple-100";
    }

    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const currentStatus = String(
      status || "NEW"
    ).toUpperCase();

    if (currentStatus === "NEW") {
      return (
        <Clock3 className="h-3.5 w-3.5" />
      );
    }

    if (currentStatus === "READ") {
      return (
        <Eye className="h-3.5 w-3.5" />
      );
    }

    if (currentStatus === "REPLIED") {
      return (
        <CheckCircle2 className="h-3.5 w-3.5" />
      );
    }

    return (
      <MessageSquare className="h-3.5 w-3.5" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <MessageSquare className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">
                Contact Messages
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage messages submitted from your website.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchContacts(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Messages"
            value={stats.total}
            icon={MessageSquare}
          />

          <StatCard
            title="New"
            value={stats.new}
            icon={Mail}
          />

          <StatCard
            title="Read"
            value={stats.read}
            icon={Eye}
          />

          <StatCard
            title="Replied"
            value={stats.replied}
            icon={CheckCircle2}
          />
        </div>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email, subject or message..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="relative">
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white md:min-w-[150px]"
              >
                <option value="ALL">
                  All Status
                </option>
                <option value="NEW">
                  New
                </option>
                <option value="READ">
                  Read
                </option>
                <option value="REPLIED">
                  Replied
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />

                <p className="text-sm text-gray-500">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Mail className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No messages found
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                {contacts.length === 0
                  ? "Messages submitted through the contact form will appear here."
                  : "Try changing your search or status filter."}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchContacts(true)
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Messages
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      Sender
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      Subject
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      Message
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredContacts.map(
                    (contact) => {
                      const status =
                        String(
                          contact?.status ||
                            "NEW"
                        ).toUpperCase();

                      return (
                        <motion.tr
                          key={contact._id}
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          className="transition hover:bg-gray-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                                {contact.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "?"}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900">
                                  {contact.name ||
                                    "Unknown"}
                                </p>

                                <p className="truncate text-xs text-gray-500">
                                  {contact.email ||
                                    "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="max-w-[220px] px-6 py-5">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {contact.subject ||
                                "No subject"}
                            </p>
                          </td>

                          <td className="max-w-[280px] px-6 py-5">
                            <p className="truncate text-sm text-gray-500">
                              {contact.message ||
                                "No message"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                            {formatDate(
                              contact.createdAt
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                                status
                              )}`}
                            >
                              {getStatusIcon(
                                status
                              )}
                              {status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openContact(
                                    contact
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                title="View message"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteContact(
                                    contact._id
                                  )
                                }
                                disabled={deleting}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete message"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedContact && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedContact(null);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Contact Message
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-gray-950">
                    Message Details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedContact(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <User className="h-4 w-4" />
                      Sender
                    </div>

                    <p className="mt-2 font-bold text-gray-900">
                      {selectedContact.name ||
                        "Unknown"}
                    </p>

                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="mt-1 block break-all text-sm text-emerald-600 hover:underline"
                    >
                      {selectedContact.email ||
                        "No email"}
                    </a>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Received
                    </div>

                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {formatDate(
                        selectedContact.createdAt
                      )}
                    </p>

                    <span
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                        selectedContact.status
                      )}`}
                    >
                      {getStatusIcon(
                        selectedContact.status
                      )}
                      {selectedContact.status ||
                        "NEW"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Subject
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-gray-900">
                    {selectedContact.subject ||
                      "No subject"}
                  </h3>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Message
                  </p>

                  <div className="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                      {selectedContact.message ||
                        "No message"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedContact._id,
                        "READ"
                      )
                    }
                    disabled={
                      updatingStatus ||
                      selectedContact.status ===
                        "READ"
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4" />
                    Mark Read
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedContact._id,
                        "REPLIED"
                      )
                    }
                    disabled={
                      updatingStatus ||
                      selectedContact.status ===
                        "REPLIED"
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Replied
                  </button>

                  <a
                    href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(
                      `Re: ${
                        selectedContact.subject ||
                        "Your message"
                      }`
                    )}`}
                    onClick={() => {
                      updateStatus(
                        selectedContact._id,
                        "REPLIED"
                      );
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Mail className="h-4 w-4" />
                    Reply
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      deleteContact(
                        selectedContact._id
                      )
                    }
                    disabled={deleting}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />

                    <span className="sm:hidden">
                      Delete
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-gray-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;