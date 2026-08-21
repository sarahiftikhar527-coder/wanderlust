import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Compass,
} from "lucide-react";

import { authService } from "../../api/services";
import ExperienceCard from "../../components/ExperienceCard";
import SkeletonGrid from "../../components/SkeletonGrid";
import EmptyState from "../../components/EmptyState";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const extractFavorites = useCallback((response) => {
    const data = response?.data;

    if (Array.isArray(data?.data?.favorites)) {
      return data.data.favorites;
    }

    if (Array.isArray(data?.data?.experiences)) {
      return data.data.experiences;
    }

    if (Array.isArray(data?.favorites)) {
      return data.favorites;
    }

    if (Array.isArray(data?.experiences)) {
      return data.experiences;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, []);

  const fetchFavorites = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await authService.getFavorites();

        const favoriteData =
          extractFavorites(response);

        setFavorites(
          Array.isArray(favoriteData)
            ? favoriteData
            : []
        );
      } catch (err) {
        console.error(
          "Favorites fetch error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load your favorites. Please try again."
        );

        setFavorites([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [extractFavorites]
  );

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = () => {
    fetchFavorites(true);
  };

  const handleRetry = () => {
    fetchFavorites();
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-error-50 text-error-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>

            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900">
                Your Favorites
              </h1>

              <p className="text-gray-500 mt-1">
                {loading
                  ? "Loading your saved experiences..."
                  : `${favorites.length} saved ${
                      favorites.length === 1
                        ? "experience"
                        : "experiences"
                    }`}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
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
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-red-800">
                  Unable to load favorites
                </p>

                <p className="text-sm text-red-600 mt-1 break-words">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50 flex-shrink-0"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading &&
        !error &&
        favorites.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex items-center gap-2 text-sm text-primary-600"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />

            <span>
              Your saved experiences are
              synced with your account.
            </span>
          </motion.div>
        )}

      {loading ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
        >
          <SkeletonGrid count={6} />
        </motion.div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            message="Tap the heart icon on any experience to save it here."
            actionLabel="Browse Experiences"
            actionTo="/experiences"
          />
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {favorites.map(
            (experience, index) => {
              const experienceId =
                experience?._id ||
                experience?.id ||
                experience?.experience?._id ||
                experience?.experience?.id ||
                index;

              const experienceData =
                experience?.experience ||
                experience;

              return (
                <motion.div
                  key={experienceId}
                  layout
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="h-full"
                >
                  <ExperienceCard
                    experience={experienceData}
                    index={index}
                  />
                </motion.div>
              );
            }
          )}
        </motion.div>
      )}

      {!loading &&
        !error &&
        favorites.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl bg-primary-50 border border-primary-100 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-primary-100 flex items-center justify-center flex-shrink-0">
                <Compass className="w-5 h-5 text-primary-600" />
              </div>

              <div>
                <p className="font-semibold text-primary-900">
                  Keep exploring
                </p>

                <p className="text-sm text-primary-700 mt-1">
                  Found another experience
                  you love? Save it to your
                  favorites and come back
                  anytime.
                </p>
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default Favorites;