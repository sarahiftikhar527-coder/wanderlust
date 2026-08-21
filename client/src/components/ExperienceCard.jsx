import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatCurrency, cn } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/services";
import toast from "react-hot-toast";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const CLOUDINARY_IMAGES = [
  "https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg",
  "https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Murree_Hiking_ehjn85.jpg",
  "https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Hunza_Valley_fc9vgo.jpg",
  "https://res.cloudinary.com/yefsnq3c/image/upload/v1787035829/Skardu_Adventure_wyjwrt.jpg",
  "https://res.cloudinary.com/yefsnq3c/image/upload/v1787035828/Cholistan_Desert_Pakistan_krrsmv.jpg",
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    const value = image.trim();

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("//")
    ) {
      return value;
    }

    return null;
  }

  if (typeof image === "object") {
    const url =
      image.secure_url ||
      image.secureUrl ||
      image.url ||
      image.src ||
      image.path ||
      image.image ||
      image.location ||
      image.fileUrl ||
      image.fileURL ||
      null;

    if (typeof url === "string" && url.trim()) {
      return url.trim();
    }
  }

  return null;
};

const getExperienceImage = (experience) => {
  if (!experience) {
    return null;
  }

  const directImage = [
    experience.coverImage,
    experience.image,
    experience.thumbnail,
    experience.cover,
    experience.photo,
  ]
    .map(getImageUrl)
    .find(Boolean);

  if (directImage) {
    return directImage;
  }

  if (
    Array.isArray(experience.images) &&
    experience.images.length > 0
  ) {
    const image = experience.images
      .map(getImageUrl)
      .find(Boolean);

    if (image) {
      return image;
    }
  }

  if (
    Array.isArray(experience.gallery) &&
    experience.gallery.length > 0
  ) {
    const image = experience.gallery
      .map(getImageUrl)
      .find(Boolean);

    if (image) {
      return image;
    }
  }

  return null;
};

const getFallbackImage = (index = 0) => {
  if (!CLOUDINARY_IMAGES.length) {
    return FALLBACK_IMAGE;
  }

  return (
    CLOUDINARY_IMAGES[
      index % CLOUDINARY_IMAGES.length
    ] || FALLBACK_IMAGE
  );
};

const ExperienceCard = ({
  experience,
  index = 0,
}) => {
  const { isAuthenticated } = useAuth();

  const [favorite, setFavorite] = useState(
    Boolean(experience?.isFavorited)
  );

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [imageIndex, setImageIndex] =
    useState(index);

  const [imageFailed, setImageFailed] =
    useState(false);

  const databaseImage =
    getExperienceImage(experience);

  const [imageSrc, setImageSrc] = useState(
    databaseImage || getFallbackImage(index)
  );

  useEffect(() => {
    const nextImage =
      getExperienceImage(experience);

    setImageIndex(index);
    setImageFailed(false);
    setImageSrc(
      nextImage || getFallbackImage(index)
    );
  }, [
    experience?._id,
    experience?.id,
    experience?.image,
    experience?.coverImage,
    experience?.thumbnail,
    experience?.cover,
    experience?.photo,
    index,
  ]);

  useEffect(() => {
    setFavorite(
      Boolean(experience?.isFavorited)
    );
  }, [experience?.isFavorited]);

  const title =
    experience?.title ||
    "Amazing Travel Experience";

  const slug =
    experience?.slug ||
    experience?._id ||
    experience?.id ||
    "";

  const price =
    Number(experience?.price) || 0;

  const rating =
    Number(
      experience?.rating ??
        experience?.averageRating ??
        experience?.ratingsAverage ??
        0
    ) || 0;

  const reviews =
    Number(
      experience?.numReviews ??
        experience?.reviewsCount ??
        experience?.reviewCount ??
        0
    ) ||
    (Array.isArray(experience?.reviews)
      ? experience.reviews.length
      : 0);

  const duration =
    experience?.duration ||
    "Flexible duration";

  const city =
    experience?.location?.city ||
    experience?.city ||
    "";

  const country =
    experience?.location?.country ||
    experience?.country ||
    "";

  const location = city
    ? `${city}${country ? `, ${country}` : ""}`
    : "Amazing destination";

  const category =
    typeof experience?.category === "object"
      ? experience?.category?.name
      : experience?.category;

  const handleImageError = () => {
    if (!databaseImage) {
      const nextIndex = imageIndex + 1;

      if (
        nextIndex < CLOUDINARY_IMAGES.length
      ) {
        setImageIndex(nextIndex);
        setImageSrc(
          getFallbackImage(nextIndex)
        );
        return;
      }
    }

    if (!imageFailed) {
      setImageFailed(true);
      setImageSrc(FALLBACK_IMAGE);
    }
  };

  const handleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error(
        "Please log in to save experiences"
      );
      return;
    }

    if (
      !experience?._id ||
      favoriteLoading
    ) {
      return;
    }

    setFavoriteLoading(true);

    try {
      const response =
        await authService.toggleFavorite(
          experience._id
        );

      const data =
        response?.data?.data ||
        response?.data ||
        {};

      const nextFavorite =
        typeof data?.isFavorited === "boolean"
          ? data.isFavorited
          : !favorite;

      setFavorite(nextFavorite);

      toast.success(
        nextFavorite
          ? "Added to your favorites"
          : "Removed from your favorites"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to update favorite"
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        delay: index * 0.06,
      }}
      whileHover={{
        y: -8,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
      className="group h-full min-w-0"
    >
      <Link
        to={`/experiences/${slug}`}
        className="block h-full"
      >
        <motion.div
          whileHover={{
            boxShadow:
              "0 24px 55px rgba(0, 0, 0, 0.12)",
          }}
          className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500"
        >
          <div className="relative h-64 w-full overflow-hidden">
            <motion.img
              src={imageSrc}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              initial={{
                scale: 1.06,
              }}
              whileInView={{
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              whileHover={{
                scale: 1.09,
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" />

            <motion.div
              initial={{
                opacity: 0,
              }}
              whileHover={{
                opacity: 1,
              }}
              transition={{
                duration: 0.3,
              }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-900/45 via-transparent to-transparent"
            />

            {category && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: -12,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay:
                    0.15 +
                    index * 0.05,
                  duration: 0.4,
                }}
                className="absolute left-4 top-4 max-w-[65%]"
              >
                <span className="inline-flex max-w-full items-center truncate rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-md backdrop-blur-md">
                  {category}
                </span>
              </motion.div>
            )}

            <motion.button
              type="button"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.92,
              }}
              aria-label={
                favorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              className={cn(
                "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300",
                favorite
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-white/30 bg-white/90 text-gray-600 hover:border-red-200 hover:text-red-500",
                favoriteLoading &&
                  "cursor-not-allowed opacity-60"
              )}
            >
              <motion.div
                animate={
                  favorite
                    ? {
                        scale: [
                          1,
                          1.22,
                          1,
                        ],
                      }
                    : {
                        scale: 1,
                      }
                }
                transition={{
                  duration: 0.35,
                }}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    favorite &&
                      "fill-current"
                  )}
                />
              </motion.div>
            </motion.button>

            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.25,
              }}
              className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
            >
              <Star className="h-3.5 w-3.5 fill-secondary-400 text-secondary-400" />

              <span>
                {rating > 0
                  ? rating.toFixed(1)
                  : "New"}
              </span>

              {reviews > 0 && (
                <span className="text-white/70">
                  ({reviews})
                </span>
              )}
            </motion.div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-5">
            <motion.div
              initial={{
                opacity: 0,
                x: -8,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.12,
              }}
              className="mb-2 flex min-w-0 items-center gap-1.5 text-xs text-gray-400"
            >
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary-500" />

              <span className="truncate">
                {location}
              </span>
            </motion.div>

            <motion.h3
              initial={{
                opacity: 0,
                y: 8,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.17,
              }}
              className="min-h-[56px] line-clamp-2 font-display text-lg font-bold leading-7 text-gray-900 transition-colors duration-300 group-hover:text-primary-600"
            >
              {title}
            </motion.h3>

            <motion.div
              initial={{
                opacity: 0,
                x: -8,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.22,
              }}
              className="mt-3 flex min-w-0 items-center gap-1.5 text-xs text-gray-400"
            >
              <Clock className="h-3.5 w-3.5 flex-shrink-0 text-primary-500" />

              <span className="truncate">
                {duration}
              </span>
            </motion.div>

            <motion.div
              initial={{
                scaleX: 0,
              }}
              whileInView={{
                scaleX: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.27,
                duration: 0.45,
              }}
              className="my-4 origin-left border-t border-gray-100"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.32,
              }}
              className="mt-auto flex items-end justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">
                  Starting from
                </p>

                <p className="truncate font-display text-xl font-extrabold text-primary-600">
                  {formatCurrency(price)}
                </p>
              </div>

              <span className="mb-1 flex-shrink-0 text-xs text-gray-400">
                / person
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{
              scaleX: 0,
            }}
            whileHover={{
              scaleX: 1,
            }}
            transition={{
              duration: 0.4,
            }}
            className="absolute bottom-0 left-0 right-0 h-1 origin-left bg-gradient-to-r from-primary-500 via-blue-500 to-purple-500"
          />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ExperienceCard;