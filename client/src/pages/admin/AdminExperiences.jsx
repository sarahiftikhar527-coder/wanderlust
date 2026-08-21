import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Check,
  Loader2,
  Users,
  Compass,
  CalendarDays,
  Image as ImageIcon,
  Upload,
  User,
  ListChecks,
  Ban,
} from "lucide-react";

import {
  experienceService,
  categoryService,
} from "../../api/services";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80";

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EMPTY_FORM = {
  title: "",
  shortDescription: "",
  description: "",
  city: "",
  country: "",
  address: "",
  duration: "",
  price: "",
  minGroupSize: "1",
  maxGroupSize: "10",
  category: "",
  coverImage: "",
  images: "",
  highlights: "",
  included: "",
  excluded: "",
  itinerary: "",
  availableDates: "",
  featured: false,
  status: "DRAFT",
  hostName: "",
  hostBio: "",
  hostAvatar: "",
};

const getLocationText = (location) => {
  if (!location) return "";

  if (typeof location === "string") {
    return location;
  }

  if (typeof location === "object") {
    const parts = [
      location.city,
      location.country,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(", ");
    }

    return location.address || "";
  }

  return "";
};

const normalizeReview = (review) => {
  if (!review) return null;

  const user =
    typeof review.user === "object"
      ? review.user
      : null;

  return {
    ...review,
    user,
    reviewerName:
      user?.name ||
      user?.fullName ||
      review?.userName ||
      review?.name ||
      "Anonymous Traveler",
    reviewerAvatar:
      user?.avatar ||
      user?.profileImage ||
      review?.userAvatar ||
      review?.avatar ||
      "",
    rating:
      Number(
        review?.rating ??
          review?.stars ??
          0
      ) || 0,
    text:
      review?.comment ||
      review?.review ||
      review?.text ||
      review?.content ||
      "",
    createdAt:
      review?.createdAt ||
      review?.date ||
      review?.updatedAt ||
      null,
  };
};

const normalizeExperience = (experience) => {
  const images = Array.isArray(experience?.images)
    ? experience.images.filter(Boolean)
    : [];

  const coverImage =
    experience?.coverImage ||
    experience?.image ||
    images[0] ||
    FALLBACK_IMAGE;

  const reviews = Array.isArray(
    experience?.reviews
  )
    ? experience.reviews
        .filter(Boolean)
        .map(normalizeReview)
        .filter(Boolean)
    : [];

  return {
    ...experience,
    coverImage,
    images: images.length
      ? images
      : experience?.coverImage
      ? [experience.coverImage]
      : [],
    location:
      typeof experience?.location === "object"
        ? experience.location
        : {
            city: experience?.location || "",
            country: "",
            address: "",
          },
    groupSize:
      experience?.groupSize || {
        min: 1,
        max: 10,
      },
    rating:
      typeof experience?.rating === "number"
        ? experience.rating
        : Number(experience?.rating || 0),
    numReviews:
      Number(
        experience?.numReviews ??
          experience?.reviewsCount ??
          experience?.reviews?.length ??
          0
      ) || reviews.length,
    reviews,
    status: experience?.status || "DRAFT",
    featured: Boolean(experience?.featured),
    host: experience?.host || {
      name: "",
      bio: "",
      avatar: "",
    },
  };
};

const normalizeCategory = (category) => ({
  ...category,
  _id:
    category?._id ||
    category?.id ||
    category?.slug,
  name:
    category?.name ||
    category?.title ||
    category?.slug ||
    "Category",
  slug:
    category?.slug ||
    category?.name
      ?.toLowerCase()
      .replace(/\s+/g, "-") ||
    "",
});

const getStatusClasses = (status) => {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-50 text-green-700 border-green-200";

    case "ARCHIVED":
      return "bg-gray-100 text-gray-600 border-gray-200";

    case "DRAFT":
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const uploadToCloudinary = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "VITE_CLOUDINARY_CLOUD_NAME is missing from your .env file."
    );
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "VITE_CLOUDINARY_UPLOAD_PRESET is missing from your .env file."
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Cloudinary upload failed."
    );
  }

  return data.secure_url;
};

const AdminExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        experienceResponse,
        categoryResponse,
      ] = await Promise.all([
        experienceService.getAll({
          limit: 100,
        }),
        categoryService.getAll(),
      ]);

      const experienceData =
        experienceResponse?.data?.data?.experiences ||
        experienceResponse?.data?.experiences ||
        experienceResponse?.data?.data ||
        [];

      const categoryData =
        categoryResponse?.data?.data?.categories ||
        categoryResponse?.data?.categories ||
        categoryResponse?.data?.data ||
        [];

      const normalizedExperiences =
        Array.isArray(experienceData)
          ? experienceData
              .filter(Boolean)
              .map(normalizeExperience)
          : [];

      const normalizedCategories =
        Array.isArray(categoryData)
          ? categoryData
              .filter(Boolean)
              .map(normalizeCategory)
          : [];

      setExperiences(normalizedExperiences);
      setCategories(normalizedCategories);
    } catch (err) {
      console.error(
        "Admin experiences error:",
        err
      );

      setExperiences([]);
      setCategories([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load experiences and categories."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredExperiences = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return experiences;
    }

    return experiences.filter((experience) => {
      const title =
        experience?.title?.toLowerCase() || "";

      const location = getLocationText(
        experience?.location
      ).toLowerCase();

      const slug =
        experience?.slug?.toLowerCase() || "";

      const category =
        experience?.category?.name?.toLowerCase() ||
        (typeof experience?.category === "string"
          ? experience.category.toLowerCase()
          : "");

      const description =
        experience?.description?.toLowerCase() || "";

      const shortDescription =
        experience?.shortDescription?.toLowerCase() ||
        "";

      const status =
        experience?.status?.toLowerCase() || "";

      const hostName =
        experience?.host?.name?.toLowerCase() || "";

      return (
        title.includes(query) ||
        location.includes(query) ||
        slug.includes(query) ||
        category.includes(query) ||
        description.includes(query) ||
        shortDescription.includes(query) ||
        status.includes(query) ||
        hostName.includes(query)
      );
    });
  }, [experiences, search]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (experience) => {
    setEditingId(experience?._id);

    const categoryValue =
      typeof experience?.category === "object"
        ? experience.category?._id ||
          experience.category?.slug ||
          ""
        : experience?.category || "";

    const experienceImages =
      Array.isArray(experience?.images)
        ? experience.images.filter(Boolean)
        : [];

    const highlights = Array.isArray(
      experience?.highlights
    )
      ? experience.highlights
      : [];

    const included = Array.isArray(
      experience?.included
    )
      ? experience.included
      : [];

    const excluded = Array.isArray(
      experience?.excluded
    )
      ? experience.excluded
      : [];

    const itinerary = Array.isArray(
      experience?.itinerary
    )
      ? experience.itinerary
          .map(
            (item) =>
              `${item?.day || ""}|${item?.title || ""}|${
                item?.description || ""
              }`
          )
          .join("\n")
      : "";

    const availableDates = Array.isArray(
      experience?.availableDates
    )
      ? experience.availableDates
          .filter(Boolean)
          .map((date) => {
            const parsedDate = new Date(date);

            if (
              Number.isNaN(
                parsedDate.getTime()
              )
            ) {
              return "";
            }

            return parsedDate
              .toISOString()
              .split("T")[0];
          })
          .filter(Boolean)
          .join("\n")
      : "";

    setForm({
      title: experience?.title || "",
      shortDescription:
        experience?.shortDescription || "",
      description:
        experience?.description || "",
      city:
        experience?.location?.city || "",
      country:
        experience?.location?.country || "",
      address:
        experience?.location?.address || "",
      duration:
        experience?.duration || "",
      price:
        experience?.price ?? "",
      minGroupSize:
        experience?.groupSize?.min ?? "1",
      maxGroupSize:
        experience?.groupSize?.max ?? "10",
      category: categoryValue,
      coverImage:
        experience?.coverImage ||
        experienceImages[0] ||
        "",
      images: experienceImages.join("\n"),
      highlights: highlights.join("\n"),
      included: included.join("\n"),
      excluded: excluded.join("\n"),
      itinerary,
      availableDates,
      featured: Boolean(
        experience?.featured
      ),
      status:
        experience?.status || "DRAFT",
      hostName:
        experience?.host?.name || "",
      hostBio:
        experience?.host?.bio || "",
      hostAvatar:
        experience?.host?.avatar || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeFormModal = () => {
    if (saving || uploading) return;

    setShowModal(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
  };

  const getCategoryId = () => {
    if (!form.category) {
      return undefined;
    }

    const found = categories.find(
      (category) =>
        category?._id === form.category ||
        category?.slug === form.category
    );

    return found?._id || form.category;
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setError("");
    setUploading(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(
            `${file.name} is not a valid image.`
          );
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(
            `${file.name} is larger than 10MB.`
          );
        }

        const url =
          await uploadToCloudinary(file);

        uploadedUrls.push(url);
      }

      setForm((previous) => {
        const currentImages =
          previous.images
            .split("\n")
            .map((image) => image.trim())
            .filter(Boolean);

        const allImages = [
          ...currentImages,
          ...uploadedUrls,
        ];

        return {
          ...previous,
          coverImage:
            previous.coverImage ||
            uploadedUrls[0] ||
            "",
          images: allImages.join("\n"),
        };
      });
    } catch (err) {
      console.error(
        "Cloudinary upload error:",
        err
      );

      setError(
        err?.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (url) => {
    setForm((previous) => {
      const images = previous.images
        .split("\n")
        .map((image) => image.trim())
        .filter(Boolean)
        .filter(
          (image) => image !== url
        );

      return {
        ...previous,
        images: images.join("\n"),
        coverImage:
          previous.coverImage === url
            ? images[0] || ""
            : previous.coverImage,
      };
    });
  };

  const setCoverImage = (url) => {
    setForm((previous) => ({
      ...previous,
      coverImage: url,
    }));
  };

  const parseLines = (value) => {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const parseItinerary = (value) => {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|");

        return {
          day: Number(parts[0]?.trim()),
          title: parts[1]?.trim() || "",
          description:
            parts.slice(2).join("|").trim() ||
            "",
        };
      });
  };

  const parseDates = (value) => {
    return value
      .split("\n")
      .map((date) => date.trim())
      .filter(Boolean)
      .map((date) => new Date(date))
      .filter(
        (date) =>
          !Number.isNaN(
            date.getTime()
          )
      );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const description =
      form.description.trim();
    const city = form.city.trim();
    const country =
      form.country.trim();
    const duration =
      form.duration.trim();
    const hostName =
      form.hostName.trim();

    if (!title) {
      setError(
        "Experience title is required."
      );
      return;
    }

    if (title.length < 5) {
      setError(
        "Title must be at least 5 characters."
      );
      return;
    }

    if (!description) {
      setError(
        "Description is required."
      );
      return;
    }

    if (description.length < 20) {
      setError(
        "Description must be at least 20 characters."
      );
      return;
    }

    if (!city) {
      setError("City is required.");
      return;
    }

    if (!country) {
      setError(
        "Country is required."
      );
      return;
    }

    if (!duration) {
      setError(
        "Duration is required."
      );
      return;
    }

    if (form.price === "") {
      setError("Price is required.");
      return;
    }

    if (
      Number.isNaN(
        Number(form.price)
      )
    ) {
      setError(
        "Price must be a valid number."
      );
      return;
    }

    if (Number(form.price) < 0) {
      setError(
        "Price cannot be negative."
      );
      return;
    }

    const minGroupSize =
      Number(form.minGroupSize);

    const maxGroupSize =
      Number(form.maxGroupSize);

    if (
      !Number.isFinite(
        minGroupSize
      ) ||
      minGroupSize < 1
    ) {
      setError(
        "Minimum group size must be at least 1."
      );
      return;
    }

    if (
      !Number.isFinite(
        maxGroupSize
      ) ||
      maxGroupSize < 1
    ) {
      setError(
        "Maximum group size must be at least 1."
      );
      return;
    }

    if (
      minGroupSize >
      maxGroupSize
    ) {
      setError(
        "Minimum group size cannot exceed maximum group size."
      );
      return;
    }

    if (!hostName) {
      setError(
        "Host name is required."
      );
      return;
    }

    const categoryId =
      getCategoryId();

    if (!categoryId) {
      setError(
        "Please select a category."
      );
      return;
    }

    const imageList = form.images
      .split("\n")
      .map((image) => image.trim())
      .filter(Boolean);

    const coverImage =
      form.coverImage.trim() ||
      imageList[0] ||
      "";

    const highlights =
      parseLines(form.highlights);

    const included =
      parseLines(form.included);

    const excluded =
      parseLines(form.excluded);

    const itinerary =
      parseItinerary(
        form.itinerary
      );

    const availableDates =
      parseDates(
        form.availableDates
      );

    if (itinerary.length) {
      const invalidItinerary =
        itinerary.some(
          (item) =>
            !Number.isFinite(
              item.day
            ) ||
            item.day < 1 ||
            !item.title ||
            !item.description
        );

      if (invalidItinerary) {
        setError(
          "Each itinerary line must be: Day|Title|Description"
        );
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        title,
        shortDescription:
          form.shortDescription.trim(),
        description,
        location: {
          city,
          country,
          address:
            form.address.trim(),
        },
        price:
          Number(form.price),
        duration,
        groupSize: {
          min: minGroupSize,
          max: maxGroupSize,
        },
        category: categoryId,
        coverImage,
        images: imageList.length
          ? imageList
          : coverImage
          ? [coverImage]
          : [],
        highlights,
        included,
        excluded,
        itinerary,
        availableDates,
        featured:
          Boolean(form.featured),
        status:
          form.status,
        host: {
          name: hostName,
          bio:
            form.hostBio.trim(),
          avatar:
            form.hostAvatar.trim(),
        },
      };

      if (editingId) {
        await experienceService.update(
          editingId,
          payload
        );
      } else {
        await experienceService.create(
          payload
        );
      }

      setShowModal(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setError("");

      await loadData();
    } catch (err) {
      console.error(
        "Save experience error:",
        err
      );

      const backendErrors =
        err?.response?.data?.errors;

      let message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to save experience. Please try again.";

      if (
        Array.isArray(
          backendErrors
        )
      ) {
        message = backendErrors
          .map(
            (item) =>
              item?.message ||
              item
          )
          .join(", ");
      }

      if (
        backendErrors &&
        typeof backendErrors ===
          "object" &&
        !Array.isArray(
          backendErrors
        )
      ) {
        message = Object.values(
          backendErrors
        )
          .map(
            (item) =>
              item?.message ||
              String(item)
          )
          .join(", ");
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    const experience =
      experiences.find(
        (item) =>
          item?._id === id
      );

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${
          experience?.title ||
          "this experience"
        }?`
      );

    if (!confirmed) return;

    setDeleting(id);

    try {
      await experienceService.delete(
        id
      );

      setExperiences(
        (previous) =>
          previous.filter(
            (item) =>
              item?._id !== id
          )
      );

      if (
        viewing?._id === id
      ) {
        setViewing(null);
      }
    } catch (err) {
      console.error(
        "Delete experience error:",
        err
      );

      window.alert(
        err?.response?.data?.message ||
          "Failed to delete experience."
      );
    } finally {
      setDeleting(null);
    }
  };

  const getImage = (
    experience
  ) =>
    experience?.coverImage ||
    experience?.images?.[0] ||
    FALLBACK_IMAGE;

  const getCategoryName = (
    category
  ) => {
    if (!category) {
      return "Experience";
    }

    if (
      typeof category ===
      "object"
    ) {
      return (
        category?.name ||
        "Experience"
      );
    }

    return (
      categories.find(
        (item) =>
          item?._id === category ||
          item?.slug === category
      )?.name || category
    );
  };

  const formatReviewDate = (date) => {
    if (!date) return "";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const getReviewCount = (
    experience
  ) => {
    const reviews = Array.isArray(
      experience?.reviews
    )
      ? experience.reviews
      : [];

    return Math.max(
      Number(
        experience?.numReviews || 0
      ),
      reviews.length
    );
  };

  const totalExperiences =
    experiences.length;

  const featuredExperiences =
    experiences.filter(
      (experience) =>
        experience?.featured
    ).length;

  const publishedExperiences =
    experiences.filter(
      (experience) =>
        experience?.status ===
        "PUBLISHED"
    ).length;

  const availableCategories =
    categories.length;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 mb-2">
            <Compass className="w-5 h-5" />

            <span className="text-sm font-semibold">
              Travel Management
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl">
            Experiences
          </h1>

          <p className="text-gray-500 mt-1">
            Create, manage and organize travel
            experiences.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreateModal
          }
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-5 h-5" />
          Add Experience
        </button>
      </div>

      {error && !showModal && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Experiences"
          value={
            totalExperiences
          }
          icon={
            <Compass className="w-5 h-5 text-primary-600" />
          }
          iconClass="bg-primary-50"
        />

        <StatCard
          label="Published"
          value={
            publishedExperiences
          }
          icon={
            <Check className="w-5 h-5 text-green-600" />
          }
          iconClass="bg-green-50"
        />

        <StatCard
          label="Featured"
          value={
            featuredExperiences
          }
          icon={
            <Star className="w-5 h-5 text-accent-600" />
          }
          iconClass="bg-accent-50"
        />

        <StatCard
          label="Categories"
          value={
            availableCategories
          }
          icon={
            <CalendarDays className="w-5 h-5 text-secondary-600" />
          }
          iconClass="bg-secondary-50"
        />
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search experiences..."
            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-white outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {search && (
          <p className="text-xs text-gray-500 mt-3">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {
                filteredExperiences.length
              }
            </span>{" "}
            result
            {filteredExperiences.length !==
            1
              ? "s"
              : ""}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({
            length: 6,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-96 rounded-2xl skeleton"
              />
            )
          )}
        </div>
      ) : filteredExperiences.length ===
        0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
            <Compass className="w-7 h-7 text-primary-600" />
          </div>

          <h2 className="font-display font-bold text-xl">
            {search
              ? "No experiences found"
              : "No experiences yet"}
          </h2>

          <p className="text-gray-500 mt-2">
            {search
              ? "Try a different search term."
              : "Create your first travel experience to get started."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExperiences.map(
            (
              experience,
              index
            ) => {
              const image =
                getImage(
                  experience
                );

              const locationText =
                getLocationText(
                  experience?.location
                );

              const reviewCount =
                getReviewCount(
                  experience
                );

              return (
                <motion.div
                  key={
                    experience?._id ||
                    experience?.slug ||
                    index
                  }
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                  className="card overflow-hidden group"
                >
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={
                        experience?.title ||
                        "Experience"
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(
                        event
                      ) => {
                        event.currentTarget.src =
                          FALLBACK_IMAGE;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                    {experience?.featured && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/95 text-primary-700 text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Featured
                      </span>
                    )}

                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[10px] font-bold backdrop-blur ${getStatusClasses(
                        experience?.status
                      )}`}
                    >
                      {experience?.status ||
                        "DRAFT"}
                    </span>

                    <span className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-medium">
                      {getCategoryName(
                        experience?.category
                      )}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg line-clamp-1">
                      {
                        experience?.title
                      }
                    </h3>

                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                      <MapPin className="w-4 h-4 shrink-0" />

                      <span className="truncate">
                        {locationText ||
                          "Location unavailable"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mt-3">
                      {experience?.shortDescription ||
                        experience?.description ||
                        "Discover an unforgettable experience."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-primary-500 shrink-0" />

                        <span className="truncate">
                          {experience?.duration ||
                            "Flexible"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-primary-500 shrink-0" />

                        <span>
                          $
                          {Number(
                            experience?.price ||
                              0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" />

                        <span className="font-semibold">
                          {experience?.rating
                            ? Number(
                                experience.rating
                              ).toFixed(1)
                            : "New"}
                        </span>

                        <span className="text-gray-400 text-xs">
                          (
                          {
                            reviewCount
                          }
                          )
                        </span>
                      </div>

                      <span className="text-xs text-gray-500">
                        {experience?.groupSize
                          ? `${experience.groupSize.min || 1}-${experience.groupSize.max || 10} people`
                          : "Group"}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-5">
                      <button
                        type="button"
                        onClick={() =>
                          setViewing(
                            experience
                          )
                        }
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            experience
                          )
                        }
                        className="px-3 py-2.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            experience?._id
                          )
                        }
                        disabled={
                          deleting ===
                          experience?._id
                        }
                        className="px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {deleting ===
                        experience?._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeFormModal();
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl">
                    {editingId
                      ? "Edit Experience"
                      : "Create Experience"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-0.5">
                    {editingId
                      ? "Update experience information."
                      : "Add a new experience to your platform."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeFormModal
                  }
                  disabled={
                    saving ||
                    uploading
                  }
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="p-6 space-y-6"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Basic Information
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Field
                      label="Title"
                      name="title"
                      value={
                        form.title
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Hunza Valley Adventure"
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>

                      <select
                        name="category"
                        value={
                          form.category
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="">
                          Select category
                        </option>

                        {categories.map(
                          (
                            category
                          ) => (
                            <option
                              key={
                                category?._id ||
                                category?.slug
                              }
                              value={
                                category?._id ||
                                category?.slug
                              }
                            >
                              {
                                category?.name
                              }
                            </option>
                          )
                        )}
                      </select>

                      {!categories.length && (
                        <p className="text-xs text-red-500 mt-2">
                          No categories found in the database.
                        </p>
                      )}
                    </div>

                    <Field
                      label="Short Description"
                      name="shortDescription"
                      value={
                        form.shortDescription
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="A short description..."
                      textarea
                      rows={3}
                    />

                    <Field
                      label="Duration"
                      name="duration"
                      value={
                        form.duration
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="3 Days / 2 Nights"
                      required
                    />

                    <Field
                      label="Price"
                      name="price"
                      type="number"
                      value={
                        form.price
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="299"
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>

                      <select
                        name="status"
                        value={
                          form.status
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="DRAFT">
                          Draft
                        </option>

                        <option value="PUBLISHED">
                          Published
                        </option>

                        <option value="ARCHIVED">
                          Archived
                        </option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Location
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Field
                      label="City"
                      name="city"
                      value={
                        form.city
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Hunza"
                      required
                    />

                    <Field
                      label="Country"
                      name="country"
                      value={
                        form.country
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Pakistan"
                      required
                    />

                    <div className="md:col-span-2">
                      <Field
                        label="Address"
                        name="address"
                        value={
                          form.address
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Karimabad, Hunza, Gilgit-Baltistan"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Group Size
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Field
                      label="Minimum Group Size"
                      name="minGroupSize"
                      type="number"
                      value={
                        form.minGroupSize
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="1"
                      required
                    />

                    <Field
                      label="Maximum Group Size"
                      name="maxGroupSize"
                      type="number"
                      value={
                        form.maxGroupSize
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="10"
                      required
                    />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Host Information
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Field
                      label="Host Name"
                      name="hostName"
                      value={
                        form.hostName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Sarah Khan"
                      required
                    />

                    <Field
                      label="Host Avatar URL"
                      name="hostAvatar"
                      value={
                        form.hostAvatar
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Cloudinary avatar URL"
                    />

                    <div className="md:col-span-2">
                      <Field
                        label="Host Bio"
                        name="hostBio"
                        value={
                          form.hostBio
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Tell guests about the host..."
                        textarea
                        rows={3}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Experience Images
                    </h3>
                  </div>

                  <label className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition">
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />

                        <p className="mt-2 text-sm font-semibold text-gray-700">
                          Uploading to Cloudinary...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-primary-600" />

                        <p className="mt-2 text-sm font-semibold text-gray-700">
                          Click to upload images
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleImageUpload
                      }
                      disabled={
                        uploading
                      }
                      className="hidden"
                    />
                  </label>

                  <div className="mt-4">
                    <Field
                      label="Cover Image URL"
                      name="coverImage"
                      value={
                        form.coverImage
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Cloudinary image URL"
                    />
                  </div>

                  {form.coverImage && (
                    <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 mt-4">
                      <img
                        src={
                          form.coverImage
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGE;
                        }}
                      />

                      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur text-white text-xs">
                        Cover Image
                      </div>
                    </div>
                  )}

                  {form.images && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {form.images
                          .split("\n")
                          .map(
                            (
                              image
                            ) =>
                              image.trim()
                          )
                          .filter(
                            Boolean
                          )
                          .map(
                            (
                              image,
                              index
                            ) => (
                              <div
                                key={`${image}-${index}`}
                                className="relative h-28 rounded-xl overflow-hidden border border-gray-200 group"
                              >
                                <img
                                  src={
                                    image
                                  }
                                  alt={`Uploaded ${
                                    index +
                                    1
                                  }`}
                                  className="w-full h-full object-cover"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.src =
                                      FALLBACK_IMAGE;
                                  }}
                                />

                                {form.coverImage ===
                                  image && (
                                  <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary-600 text-white text-[10px] font-bold">
                                    Cover
                                  </span>
                                )}

                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  {form.coverImage !==
                                    image && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCoverImage(
                                          image
                                        )
                                      }
                                      className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center"
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImage(
                                        image
                                      )
                                    }
                                    className="w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Field
                      label="Additional Image URLs"
                      name="images"
                      value={
                        form.images
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="One image URL per line"
                      textarea
                      rows={4}
                    />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Experience Details
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <Field
                      label="Highlights"
                      name="highlights"
                      value={
                        form.highlights
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={`Mountain views
Local cultural experiences
Professional guide`}
                      textarea
                      rows={4}
                    />

                    <Field
                      label="Included"
                      name="included"
                      value={
                        form.included
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={`Professional guide
Transportation
Breakfast`}
                      textarea
                      rows={4}
                    />

                    <Field
                      label="Excluded"
                      name="excluded"
                      value={
                        form.excluded
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={`Personal expenses
Travel insurance
Lunch`}
                      textarea
                      rows={4}
                    />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Available Dates
                    </h3>
                  </div>

                  <Field
                    label="Available Dates"
                    name="availableDates"
                    value={
                      form.availableDates
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={`2026-09-01
2026-09-10
2026-09-20`}
                    textarea
                    rows={4}
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Enter one date per line using YYYY-MM-DD format.
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="w-5 h-5 text-primary-600" />

                    <h3 className="font-display font-bold text-lg">
                      Itinerary
                    </h3>
                  </div>

                  <Field
                    label="Daily Itinerary"
                    name="itinerary"
                    value={
                      form.itinerary
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={`1|Arrival in Hunza|Arrive in Hunza and check into the hotel.
2|Hunza Valley Tour|Explore Karimabad and nearby attractions.
3|Departure|Enjoy breakfast and depart.`}
                    textarea
                    rows={7}
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Format: Day|Title|Description
                  </p>
                </section>

                <section>
                  <Field
                    label="Description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe this experience in detail..."
                    textarea
                    rows={7}
                    required
                  />
                </section>

                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={
                      form.featured
                    }
                    onChange={
                      handleChange
                    }
                    className="w-4 h-4 rounded accent-primary-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Mark as featured experience
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Featured experiences can appear in highlighted sections.
                    </p>
                  </div>
                </label>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={
                      closeFormModal
                    }
                    disabled={
                      saving ||
                      uploading
                    }
                    className="px-5 py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      uploading ||
                      !categories.length
                    }
                    className="px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />

                        {editingId
                          ? "Update Experience"
                          : "Create Experience"}
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
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setViewing(null);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              <div className="relative h-64 sm:h-80">
                <img
                  src={getImage(
                    viewing
                  )}
                  alt={
                    viewing?.title ||
                    "Experience"
                  }
                  className="w-full h-full object-cover"
                  onError={(
                    event
                  ) => {
                    event.currentTarget.src =
                      FALLBACK_IMAGE;
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <button
                  type="button"
                  onClick={() =>
                    setViewing(null)
                  }
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-white text-primary-700 text-xs font-bold">
                      {getCategoryName(
                        viewing?.category
                      )}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusClasses(
                        viewing?.status
                      )}`}
                    >
                      {viewing?.status ||
                        "DRAFT"}
                    </span>

                    {viewing?.featured && (
                      <span className="px-3 py-1 rounded-full bg-white text-primary-700 text-xs font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className="text-white font-display font-extrabold text-2xl sm:text-3xl">
                    {viewing?.title}
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 shrink-0" />

                  <span>
                    {getLocationText(
                      viewing?.location
                    ) ||
                      "Location unavailable"}
                  </span>
                </div>

                {viewing?.location
                  ?.address && (
                  <p className="text-sm text-gray-400 mt-1 ml-6">
                    {
                      viewing
                        .location
                        .address
                    }
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <InfoBox
                    icon={
                      <DollarSign className="w-4 h-4" />
                    }
                    label="Price"
                    value={`$${Number(
                      viewing?.price ||
                        0
                    ).toLocaleString()}`}
                  />

                  <InfoBox
                    icon={
                      <Clock className="w-4 h-4" />
                    }
                    label="Duration"
                    value={
                      viewing?.duration ||
                      "Flexible"
                    }
                  />

                  <InfoBox
                    icon={
                      <Users className="w-4 h-4" />
                    }
                    label="Group"
                    value={
                      viewing?.groupSize
                        ? `${viewing.groupSize.min || 1}-${viewing.groupSize.max || 10}`
                        : "1-10"
                    }
                  />

                  <InfoBox
                    icon={
                      <Star className="w-4 h-4" />
                    }
                    label="Rating"
                    value={
                      viewing?.rating
                        ? `${Number(
                            viewing.rating
                          ).toFixed(
                            1
                          )} (${getReviewCount(viewing)})`
                        : "New"
                    }
                  />
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg">
                        Reviews
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {getReviewCount(
                          viewing
                        )}{" "}
                        review
                        {getReviewCount(
                          viewing
                        ) !== 1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />

                      <span className="font-bold text-gray-800">
                        {viewing?.rating
                          ? Number(
                              viewing.rating
                            ).toFixed(1)
                          : "New"}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(
                    viewing?.reviews
                  ) &&
                  viewing.reviews.length >
                    0 ? (
                    <div className="space-y-4">
                      {viewing.reviews.map(
                        (
                          review,
                          index
                        ) => {
                          const normalizedReview =
                            normalizeReview(
                              review
                            );

                          const reviewerName =
                            normalizedReview?.reviewerName ||
                            "Anonymous Traveler";

                          const reviewerAvatar =
                            normalizedReview?.reviewerAvatar ||
                            "";

                          const reviewRating =
                            normalizedReview?.rating ||
                            0;

                          const reviewText =
                            normalizedReview?.text ||
                            "No review text available.";

                          const reviewDate =
                            formatReviewDate(
                              normalizedReview?.createdAt
                            );

                          return (
                            <div
                              key={
                                review?._id ||
                                review?.id ||
                                index
                              }
                              className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  {reviewerAvatar ? (
                                    <img
                                      src={
                                        reviewerAvatar
                                      }
                                      alt={
                                        reviewerName
                                      }
                                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                                      onError={(
                                        event
                                      ) => {
                                        event.currentTarget.style.display =
                                          "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
                                      {reviewerName
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()}
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">
                                      {
                                        reviewerName
                                      }
                                    </p>

                                    {reviewDate && (
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {
                                          reviewDate
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {reviewRating >
                                  0 && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-100 shrink-0">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />

                                    <span className="text-xs font-bold text-gray-700">
                                      {reviewRating.toFixed(
                                        1
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <p className="text-sm text-gray-600 leading-6 mt-3 whitespace-pre-line">
                                {
                                  reviewText
                                }
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                      <Star className="w-8 h-8 mx-auto text-gray-300 mb-3" />

                      <h4 className="font-semibold text-gray-700">
                        No reviews yet
                      </h4>

                      <p className="text-sm text-gray-400 mt-1">
                        Reviews from travelers will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {viewing?.host?.name && (
                  <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      {viewing?.host
                        ?.avatar ? (
                        <img
                          src={
                            viewing.host
                              .avatar
                          }
                          alt={
                            viewing.host
                              .name
                          }
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              FALLBACK_IMAGE;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-400">
                          Hosted by
                        </p>

                        <p className="font-bold text-gray-800">
                          {
                            viewing
                              .host
                              .name
                          }
                        </p>
                      </div>
                    </div>

                    {viewing?.host
                      ?.bio && (
                      <p className="text-sm text-gray-600 mt-3 leading-6">
                        {
                          viewing
                            .host
                            .bio
                        }
                      </p>
                    )}
                  </div>
                )}

                {viewing?.shortDescription && (
                  <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
                    <p className="text-primary-800 text-sm leading-6 font-medium">
                      {
                        viewing.shortDescription
                      }
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-display font-bold text-lg mb-2">
                    Description
                  </h3>

                  <p className="text-gray-600 leading-7 whitespace-pre-line">
                    {viewing?.description ||
                      "No description available."}
                  </p>
                </div>

                {Array.isArray(
                  viewing?.highlights
                ) &&
                  viewing
                    .highlights
                    .length >
                    0 && (
                    <div className="mt-6">
                      <h3 className="font-display font-bold text-lg mb-3">
                        Highlights
                      </h3>

                      <div className="space-y-2">
                        {viewing.highlights.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <Check className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />

                              <span>
                                {
                                  item
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {Array.isArray(
                  viewing?.included
                ) &&
                  viewing
                    .included
                    .length >
                    0 && (
                    <div className="mt-6">
                      <h3 className="font-display font-bold text-lg mb-3">
                        Included
                      </h3>

                      <div className="space-y-2">
                        {viewing.included.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />

                              <span>
                                {
                                  item
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {Array.isArray(
                  viewing?.excluded
                ) &&
                  viewing
                    .excluded
                    .length >
                    0 && (
                    <div className="mt-6">
                      <h3 className="font-display font-bold text-lg mb-3">
                        Not Included
                      </h3>

                      <div className="space-y-2">
                        {viewing.excluded.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <Ban className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />

                              <span>
                                {
                                  item
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {Array.isArray(
                  viewing?.itinerary
                ) &&
                  viewing
                    .itinerary
                    .length >
                    0 && (
                    <div className="mt-6">
                      <h3 className="font-display font-bold text-lg mb-3">
                        Itinerary
                      </h3>

                      <div className="space-y-4">
                        {viewing.itinerary.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex gap-4"
                            >
                              <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {
                                  item.day
                                }
                              </div>

                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {
                                    item.title
                                  }
                                </h4>

                                <p className="text-sm text-gray-600 mt-1 leading-6">
                                  {
                                    item.description
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {Array.isArray(
                  viewing?.images
                ) &&
                  viewing.images
                    .length >
                    0 && (
                    <div className="mt-6">
                      <h3 className="font-display font-bold text-lg mb-3">
                        Experience Images
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {viewing.images.map(
                          (
                            image,
                            index
                          ) => (
                            <img
                              key={`${image}-${index}`}
                              src={
                                image
                              }
                              alt={`${viewing?.title} ${
                                index +
                                1
                              }`}
                              className="w-full h-32 object-cover rounded-xl border border-gray-100"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  FALLBACK_IMAGE;
                              }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex flex-col sm:flex-row gap-3 mt-7">
                  <button
                    type="button"
                    onClick={() => {
                      const experience =
                        viewing;

                      setViewing(
                        null
                      );

                      openEditModal(
                        experience
                      );
                    }}
                    className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 flex items-center justify-center gap-2 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Experience
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewing(
                        null
                      )
                    }
                    className="px-6 py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition"
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
  label,
  value,
  icon,
  iconClass,
}) => (
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
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">
          {label}
        </p>

        <p className="font-display font-extrabold text-2xl mt-1">
          {value}
        </p>
      </div>

      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>
    </div>
  </motion.div>
);

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
  rows = 4,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}

      {required && (
        <span className="text-red-500 ml-1">
          *
        </span>
      )}
    </label>

    {textarea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
      />
    )}
  </div>
);

const InfoBox = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
    <div className="flex items-center gap-1.5 text-primary-600 mb-1">
      {icon}

      <span className="text-xs font-semibold">
        {label}
      </span>
    </div>

    <p className="text-sm font-bold text-gray-800 truncate">
      {value}
    </p>
  </div>
);

export default AdminExperiences;