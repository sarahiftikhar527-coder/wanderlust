import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  FolderOpen,
  Loader2,
  Check,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Link2,
  FileText,
  Upload,
  Layers3,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { categoryService } from "../../api/services";

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

const createSlug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");

const getCategoryImage = (category) => {
  if (category?.image) return category.image;

  if (Array.isArray(category?.images) && category.images.length > 0) {
    return category.images[0];
  }

  return null;
};

const getCategoryName = (category) =>
  category?.name || "Unnamed Category";

const getCategorySlug = (category) =>
  category?.slug || createSlug(category?.name || "category");

const getCategoryDescription = (category) =>
  category?.description || "No description available for this category.";

const uploadToCloudinary = async (file) => {
  if (!file) {
    throw new Error("Please select an image.");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration is missing. Please check your frontend .env file."
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "wanderlust/categories");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Cloudinary image upload failed."
    );
  }

  return data.secure_url;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (modalOpen && !saving && !uploading) {
        closeModal();
        return;
      }

      if (viewing) {
        setViewing(null);
      }
    };

    if (modalOpen || viewing) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [modalOpen, viewing, saving, uploading]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchCategories = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await categoryService.getAll();

      const responseData = response?.data;

      const data =
        responseData?.data?.categories ||
        responseData?.categories ||
        responseData?.data ||
        [];

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categories error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load categories."
      );

      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return categories;

    return categories.filter((category) => {
      const name = getCategoryName(category).toLowerCase();
      const slug = getCategorySlug(category).toLowerCase();
      const description =
        getCategoryDescription(category).toLowerCase();

      return (
        name.includes(query) ||
        slug.includes(query) ||
        description.includes(query)
      );
    });
  }, [categories, search]);

  const openCreate = () => {
    setViewing(null);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (category) => {
    if (!category) return;

    const image = getCategoryImage(category) || "";

    setViewing(null);
    setEditingId(category._id);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image,
    });

    setSelectedFile(null);
    setPreviewUrl(image);
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;

    setModalOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
  };

  const handleNameChange = (event) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      name: value,
      slug: editingId ? previous.slug : createSlug(value),
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setError("");
    setSelectedFile(file);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
  };

  const removeSelectedImage = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(form.image || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    const slug = form.slug.trim() || createSlug(name);

    if (!slug) {
      setError("Please enter a valid category name.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = form.image.trim();

      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(selectedFile);
        setUploading(false);
      }

      const payload = {
        name,
        slug,
        description: form.description.trim(),
        image: imageUrl,
      };

      if (editingId) {
        await categoryService.update(editingId, payload);
      } else {
        await categoryService.create(payload);
      }

      setModalOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setSelectedFile(null);
      setPreviewUrl("");

      await fetchCategories();
    } catch (err) {
      console.error("Save category error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!category?._id) return;

    const categoryName = getCategoryName(category);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?`
    );

    if (!confirmed) return;

    setDeletingId(category._id);

    try {
      await categoryService.delete(category._id);

      setCategories((previous) =>
        previous.filter((item) => item._id !== category._id)
      );

      if (viewing?._id === category._id) {
        setViewing(null);
      }
    } catch (err) {
      console.error("Delete category error:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const copyCategoryId = async (id) => {
    if (!id) return;

    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);

      setTimeout(() => {
        setCopiedId(false);
      }, 1600);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="min-h-full space-y-7 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-500 p-6 sm:p-8 text-white shadow-xl shadow-primary-900/10"
      >
        <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Layers3 className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold mb-3">
                Wanderlust Management
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
                Categories
              </h1>

              <p className="text-white/75 mt-2 max-w-2xl text-sm sm:text-base">
                Organize your travel experiences with beautiful, searchable
                and easy-to-manage categories.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => fetchCategories(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-semibold transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-gray-50 transition shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>
        </div>
      </motion.div>

      {error && !modalOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>

            <div className="flex-1">
              <p className="font-bold text-red-800">
                Unable to load categories
              </p>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={FolderOpen}
          label="Total Categories"
          value={categories.length}
          iconClass="bg-primary-50 text-primary-600"
        />

        <StatCard
          icon={Search}
          label="Showing"
          value={filteredCategories.length}
          iconClass="bg-blue-50 text-blue-600"
          delay={0.05}
        />

        <StatCard
          icon={CheckCircle2}
          label="Platform"
          value="Travel Experiences"
          iconClass="bg-emerald-50 text-emerald-600"
          delay={0.1}
          fullWidthOnMobile
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories by name, slug or description..."
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/70 text-sm outline-none transition focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-bold">
              {filteredCategories.length}
            </span>

            <span className="text-gray-500">
              {filteredCategories.length === 1
                ? "category"
                : "categories"}
            </span>
          </div>
        </div>

        {search && (
          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-800">
                {filteredCategories.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {categories.length}
              </span>{" "}
              categories
            </p>

            <button
              type="button"
              onClick={clearSearch}
              className="text-sm font-bold text-primary-600 hover:text-primary-700"
            >
              Clear search
            </button>
          </div>
        )}
      </motion.div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[355px] rounded-2xl skeleton"
            />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-100 flex items-center justify-center">
            {search ? (
              <Search className="w-8 h-8 text-primary-600" />
            ) : (
              <FolderOpen className="w-8 h-8 text-primary-600" />
            )}
          </div>

          <h2 className="font-display font-extrabold text-2xl mt-6">
            {search ? "No categories found" : "No categories yet"}
          </h2>

          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            {search
              ? "We couldn't find any category matching your search. Try another keyword."
              : "Create your first category to start organizing travel experiences."}
          </p>

          {search ? (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 transition"
            >
              <X className="w-4 h-4" />
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
            >
              <Plus className="w-4 h-4" />
              Create Category
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCategories.map((category, index) => {
            const image = getCategoryImage(category);
            const name = getCategoryName(category);
            const slug = getCategorySlug(category);
            const description = getCategoryDescription(category);

            return (
              <motion.div
                key={category._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.04,
                  duration: 0.35,
                }}
                whileHover={{ y: -5 }}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-emerald-50">
                  {image && (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";

                        const fallback =
                          event.currentTarget.nextElementSibling;

                        if (fallback) {
                          fallback.classList.remove("hidden");
                        }
                      }}
                    />
                  )}

                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      image ? "hidden" : ""
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur border border-white flex items-center justify-center shadow-sm">
                      <ImageIcon className="w-8 h-8 text-primary-300" />
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-gray-700 shadow-sm">
                      <FolderOpen className="w-3.5 h-3.5 text-primary-600" />
                      Category
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="w-9 h-9 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display font-extrabold text-lg line-clamp-1 text-gray-900">
                    {name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Link2 className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />

                    <p className="text-xs text-primary-600 font-semibold truncate">
                      /{slug}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 mt-3 line-clamp-2 min-h-[40px] leading-5">
                    {description}
                  </p>

                  <div className="flex gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() => setViewing(category)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-sm font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition flex items-center justify-center"
                      aria-label="Edit category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category._id}
                      className="w-11 h-11 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center disabled:opacity-50"
                      aria-label="Delete category"
                    >
                      {deletingId === category._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 sm:px-7 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    {editingId ? (
                      <Edit3 className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h2 className="font-display font-extrabold text-xl">
                      {editingId
                        ? "Edit Category"
                        : "Create Category"}
                    </h2>

                    <p className="text-sm text-gray-500 mt-0.5">
                      {editingId
                        ? "Update your category details."
                        : "Add a new travel experience category."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center disabled:opacity-50 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-7 space-y-6"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

                    <p className="text-sm font-medium text-red-700">
                      {error}
                    </p>
                  </motion.div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={handleNameChange}
                      placeholder="e.g. Adventure"
                      required
                      autoFocus
                      disabled={saving || uploading}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-gray-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Slug
                    </label>

                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                      <input
                        type="text"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        placeholder="adventure"
                        disabled={saving || uploading}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-gray-100 transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">
                      Category Image
                    </label>

                    <span className="text-xs text-gray-400">
                      Max 5MB
                    </span>
                  </div>

                  <label
                    className={`relative block w-full h-56 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-primary-50 hover:border-primary-400 transition cursor-pointer overflow-hidden ${
                      saving || uploading
                        ? "pointer-events-none opacity-60"
                        : ""
                    }`}
                  >
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Category preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6" />
                          </div>

                          <span className="font-bold">
                            Change Image
                          </span>

                          {selectedFile && (
                            <span className="text-xs mt-1 opacity-90 max-w-[80%] truncate">
                              {selectedFile.name}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                          <Upload className="w-6 h-6" />
                        </div>

                        <p className="font-bold text-gray-800">
                          Upload Category Image
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG or WEBP up to 5MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageChange}
                      disabled={saving || uploading}
                      className="hidden"
                    />
                  </label>

                  {selectedFile && (
                    <div className="flex items-center justify-between mt-3 p-3.5 rounded-xl bg-primary-50 border border-primary-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon className="w-4 h-4 text-primary-600 flex-shrink-0" />

                        <span className="text-sm font-semibold text-gray-700 truncate">
                          {selectedFile.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        disabled={saving || uploading}
                        className="w-8 h-8 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {form.image && !selectedFile && (
                    <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-emerald-600">
                      <Check className="w-4 h-4" />
                      Cloudinary image connected
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>

                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe this category..."
                      rows={5}
                      disabled={saving || uploading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 resize-none outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-gray-100 transition"
                    />
                  </div>

                  <div className="flex justify-end mt-1.5">
                    <p className="text-xs text-gray-400">
                      {form.description.length} characters
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving || uploading}
                    className="px-5 py-3.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 text-white font-bold hover:from-primary-700 hover:to-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2 transition shadow-lg shadow-primary-600/20"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading Image...
                      </>
                    ) : saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingId
                          ? "Update Category"
                          : "Create Category"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setViewing(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="relative h-64 bg-gradient-to-br from-primary-50 to-emerald-50">
                {getCategoryImage(viewing) ? (
                  <img
                    src={getCategoryImage(viewing)}
                    alt={getCategoryName(viewing)}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/70 backdrop-blur border border-white flex items-center justify-center">
                      <FolderOpen className="w-10 h-10 text-primary-300" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-5 left-6 right-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-gray-700 text-xs font-bold">
                    <FolderOpen className="w-3.5 h-3.5 text-primary-600" />
                    Category
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900">
                  {getCategoryName(viewing)}
                </h2>

                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-primary-50">
                  <Link2 className="w-4 h-4 text-primary-500" />

                  <p className="text-sm text-primary-700 font-bold">
                    /{getCategorySlug(viewing)}
                  </p>
                </div>

                <div className="mt-7">
                  <p className="text-xs uppercase tracking-wider font-extrabold text-gray-400 mb-2">
                    Description
                  </p>

                  <p className="text-gray-600 leading-7">
                    {getCategoryDescription(viewing)}
                  </p>
                </div>

                {viewing?._id && (
                  <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs uppercase tracking-wider font-extrabold text-gray-400">
                        Category ID
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          copyCategoryId(viewing._id)
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
                      >
                        {copiedId ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm font-mono text-gray-700 break-all">
                      {viewing._id}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-7">
                  <button
                    type="button"
                    onClick={() => {
                      const category = viewing;
                      setViewing(null);
                      openEdit(category);
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 text-white font-bold hover:from-primary-700 hover:to-emerald-600 flex items-center justify-center gap-2 transition shadow-lg shadow-primary-600/20"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Category
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewing(null)}
                    className="px-6 py-3.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Close
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
  icon: Icon,
  label,
  value,
  iconClass,
  delay = 0,
  fullWidthOnMobile = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${
        fullWidthOnMobile
          ? "col-span-2 lg:col-span-1"
          : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-display font-extrabold mt-1.5 truncate text-gray-900">
            {value}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminCategories;