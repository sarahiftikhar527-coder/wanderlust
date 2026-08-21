import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  Users,
  Check,
  X,
  Heart,
  ArrowLeft,
  Calendar,
  Share2,
  ChevronRight,
  ShieldCheck,
  Award,
  Minus,
  Plus,
  Copy,
  CheckCircle2,
  ChevronLeft,
  Image as ImageIcon,
} from 'lucide-react';

import {
  experienceService,
  bookingService,
} from '../api/services';

import { useAuth } from '../context/AuthContext';

import {
  formatCurrency,
  formatDate,
  getErrorMessage,
  cn,
} from '../utils/helpers';

import ExperienceCard from '../components/ExperienceCard';
import Modal from '../components/Modal';

import toast from 'react-hot-toast';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeIn = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardReveal = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const slideLeft = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const getCloudinaryUrl = (image) => {
  if (!image) return null;

  if (typeof image === 'string') {
    return image.trim() || null;
  }

  if (typeof image === 'object') {
    return (
      image.secure_url ||
      image.secureUrl ||
      image.url ||
      image.src ||
      image.path ||
      null
    );
  }

  return null;
};

const getExperienceImages = (experience) => {
  if (!experience) {
    return FALLBACK_IMAGES;
  }

  const images = [];

  const possibleImages = [
    experience.coverImage,
    experience.image,
    experience.thumbnail,
    experience.cover,
  ];

  possibleImages.forEach((image) => {
    const url = getCloudinaryUrl(image);

    if (url) {
      images.push(url);
    }
  });

  if (Array.isArray(experience.images)) {
    experience.images.forEach((image) => {
      const url = getCloudinaryUrl(image);

      if (url) {
        images.push(url);
      }
    });
  }

  if (Array.isArray(experience.gallery)) {
    experience.gallery.forEach((image) => {
      const url = getCloudinaryUrl(image);

      if (url) {
        images.push(url);
      }
    });
  }

  const uniqueImages = [...new Set(images)];

  return uniqueImages.length > 0
    ? uniqueImages
    : FALLBACK_IMAGES;
};

const getHostImage = (host) => {
  if (!host) return null;

  return (
    getCloudinaryUrl(host.avatar) ||
    getCloudinaryUrl(host.image) ||
    getCloudinaryUrl(host.photo) ||
    null
  );
};

const getReviewImage = (review) => {
  if (!review) return null;

  return (
    getCloudinaryUrl(review.avatar) ||
    getCloudinaryUrl(review.image) ||
    getCloudinaryUrl(review.user?.avatar) ||
    getCloudinaryUrl(review.user?.image) ||
    null
  );
};

const getReviewList = (experience) => {
  if (!experience) return [];

  if (Array.isArray(experience.reviews)) {
    return experience.reviews;
  }

  if (Array.isArray(experience.review)) {
    return experience.review;
  }

  if (Array.isArray(experience.data?.reviews)) {
    return experience.data.reviews;
  }

  return [];
};

const extractExperience = (response) => {
  const responseData = response?.data;

  return (
    responseData?.data?.experience ||
    responseData?.experience ||
    responseData?.data ||
    null
  );
};

const extractRelated = (response) => {
  const responseData = response?.data;

  return (
    responseData?.data?.related ||
    responseData?.related ||
    responseData?.data?.relatedExperiences ||
    responseData?.relatedExperiences ||
    []
  );
};

const ExperienceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const [experience, setExperience] = useState(null);
  const [related, setRelated] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedImage, setSelectedImage] = useState(0);

  const [bookingModal, setBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const fetchExperience = async (showLoader = false) => {
    if (!slug) {
      setError('Experience slug is missing');
      setLoading(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    }

    try {
      const response =
        await experienceService.getBySlug(slug);

      const experienceData =
        extractExperience(response);

      const relatedData =
        extractRelated(response);

      if (!experienceData) {
        throw new Error(
          'Experience data was not returned by the server.'
        );
      }

      setExperience(experienceData);

      setRelated(
        Array.isArray(relatedData)
          ? relatedData
          : []
      );

      if (
        experienceData.isFavorited !==
        undefined
      ) {
        setFavorite(
          Boolean(
            experienceData.isFavorited
          )
        );
      } else if (
        experienceData.isFavorite !==
        undefined
      ) {
        setFavorite(
          Boolean(
            experienceData.isFavorite
          )
        );
      }

      setSelectedImage((current) =>
        current >=
        getExperienceImages(experienceData)
          .length
          ? 0
          : current
      );

      setError('');
    } catch (err) {
      console.error(
        'FETCH EXPERIENCE ERROR:',
        err
      );

      const message =
        getErrorMessage(err) ||
        'Unable to load this experience';

      setError(message);

      if (showLoader) {
        toast.error(message);
      }

      throw err;
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await fetchExperience(true);
      } catch {
        if (!mounted) return;
      }
    };

    load();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const images = useMemo(
    () => getExperienceImages(experience),
    [experience]
  );

  const currentImage =
    images[selectedImage] || images[0];

  const today = new Date()
    .toISOString()
    .split('T')[0];

  const maxGuests =
    Number(
      experience?.groupSize?.max
    ) || 10;

  const minGuests =
    Number(
      experience?.groupSize?.min
    ) || 1;

  const totalGuests =
    adults + children;

  const price =
    Number(experience?.price) || 0;

  const childPrice =
    price * 0.5;

  const totalPrice = useMemo(
    () =>
      price * adults +
      childPrice * children,
    [
      price,
      childPrice,
      adults,
      children,
    ]
  );

  const rating = Number(
    experience?.rating || 0
  ).toFixed(1);

  const reviews = getReviewList(
    experience
  );

  const reviewCount =
    Number(experience?.numReviews) ||
    reviews.length ||
    0;

  const highlights = Array.isArray(
    experience?.highlights
  )
    ? experience.highlights
    : [];

  const itinerary = Array.isArray(
    experience?.itinerary
  )
    ? experience.itinerary
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

  const categoryName =
    typeof experience?.category ===
    'object'
      ? experience.category?.name
      : experience?.category;

  const categoryColor =
    typeof experience?.category ===
    'object'
      ? experience.category?.color
      : null;

  const locationCity =
    experience?.location?.city ||
    experience?.city ||
    'Unknown location';

  const locationCountry =
    experience?.location?.country ||
    experience?.country ||
    '';

  const hostImage =
    getHostImage(
      experience?.host
    );

  const nextImage = () => {
    setSelectedImage(
      (current) =>
        current === images.length - 1
          ? 0
          : current + 1
    );
  };

  const previousImage = () => {
    setSelectedImage(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    );
  };

  const handleImageError = (event) => {
    if (
      event.currentTarget.src !==
      DEFAULT_IMAGE
    ) {
      event.currentTarget.src =
        DEFAULT_IMAGE;
    }
  };

  const handleAdultsChange = (amount) => {
    setAdults((current) => {
      const next =
        current + amount;

      if (next < 1) {
        return 1;
      }

      if (
        next + children >
        maxGuests
      ) {
        toast.error(
          `Maximum ${maxGuests} guests allowed`
        );

        return current;
      }

      return next;
    });
  };

  const handleChildrenChange = (amount) => {
    setChildren((current) => {
      const next =
        current + amount;

      if (next < 0) {
        return 0;
      }

      if (
        adults + next >
        maxGuests
      ) {
        toast.error(
          `Maximum ${maxGuests} guests allowed`
        );

        return current;
      }

      return next;
    });
  };

  const openBookingModal = () => {
    if (!isAuthenticated) {
      toast.error(
        'Please log in to book this experience'
      );

      navigate('/login');

      return;
    }

    setBookingModal(true);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error(
        'Please log in to book this experience'
      );

      navigate('/login');

      return;
    }

    if (!bookingDate) {
      toast.error(
        'Please select a booking date'
      );

      return;
    }

    if (totalGuests < minGuests) {
      toast.error(
        `Minimum ${minGuests} guest${
          minGuests > 1 ? 's' : ''
        } required`
      );

      return;
    }

    if (totalGuests > maxGuests) {
      toast.error(
        `Maximum ${maxGuests} guests allowed`
      );

      return;
    }

    if (!experience?._id) {
      toast.error(
        'Experience information is missing'
      );

      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      await bookingService.create({
        experience: experience._id,
        bookingDate,
        guests: {
          adults,
          children,
        },
      });

      toast.success(
        'Booking confirmed successfully!'
      );

      setBookingModal(false);
      setBookingDate('');
      setAdults(1);
      setChildren(0);

      navigate('/dashboard/bookings');
    } catch (err) {
      console.error(
        'BOOKING ERROR:',
        err
      );

      toast.error(
        getErrorMessage(err) ||
          'Unable to create booking'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(
        'Please log in to save experiences'
      );

      navigate('/login');

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
        await experienceService.toggleFavorite(
          experience._id
        );

      const isFavorited =
        response?.data?.data
          ?.isFavorited ??
        response?.data?.isFavorited ??
        !favorite;

      setFavorite(
        Boolean(isFavorited)
      );

      toast.success(
        isFavorited
          ? 'Added to your favorites'
          : 'Removed from your favorites'
      );
    } catch (err) {
      console.error(
        'FAVORITE ERROR:',
        err
      );

      toast.error(
        getErrorMessage(err) ||
          'Unable to update favorite'
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (!experience) return;

    const url =
      window.location.href;

    try {
      if (
        typeof navigator.share ===
        'function'
      ) {
        await navigator.share({
          title:
            experience.title ||
            'Wanderlust Experience',
          text:
            'Check out this amazing travel experience!',
          url,
        });

        return;
      }

      if (
        navigator.clipboard &&
        typeof navigator.clipboard
          .writeText === 'function'
      ) {
        await navigator.clipboard.writeText(
          url
        );

        setCopied(true);

        toast.success(
          'Experience link copied'
        );

        setTimeout(() => {
          setCopied(false);
        }, 2000);

        return;
      }

      toast.error(
        'Unable to copy experience link'
      );
    } catch (err) {
      if (
        err?.name ===
        'AbortError'
      ) {
        return;
      }

      console.error(
        'SHARE ERROR:',
        err
      );

      toast.error(
        'Unable to share this experience'
      );
    }
  };

  const handleReview = async () => {
    if (!isAuthenticated) {
      toast.error(
        'Please log in to write a review'
      );

      navigate('/login');

      return;
    }

    const comment =
      reviewComment.trim();

    if (!comment) {
      toast.error(
        'Please write your review'
      );

      return;
    }

    if (comment.length < 10) {
      toast.error(
        'Review must be at least 10 characters'
      );

      return;
    }

    if (comment.length > 500) {
      toast.error(
        'Review cannot exceed 500 characters'
      );

      return;
    }

    if (
      !experience?._id
    ) {
      toast.error(
        'Experience information is missing'
      );

      return;
    }

    if (reviewSubmitting) return;

    setReviewSubmitting(true);

    try {
      const payload = {
        rating: Number(reviewRating),
        comment,
      };

      console.log(
        'SUBMITTING REVIEW:',
        {
          experience:
            experience._id,
          ...payload,
        }
      );

      const response =
        await experienceService.addReview(
          experience._id,
          payload
        );

      console.log(
        'REVIEW RESPONSE:',
        response?.data
      );

      const returnedReview =
        response?.data?.data
          ?.review ||
        response?.data?.review ||
        null;

      const returnedExperience =
        response?.data?.data
          ?.experience ||
        response?.data?.experience ||
        null;

      if (returnedExperience) {
        setExperience(
          returnedExperience
        );
      } else if (returnedReview) {
        setExperience(
          (current) => {
            const currentReviews =
              getReviewList(
                current
              );

            return {
              ...current,
              reviews: [
                ...currentReviews,
                returnedReview,
              ],
              numReviews:
                Number(
                  current?.numReviews ||
                    currentReviews.length
                ) + 1,
            };
          }
        );
      }

      setReviewModal(false);
      setReviewComment('');
      setReviewRating(5);

      toast.success(
        'Your review has been added successfully!'
      );

      try {
        await fetchExperience(false);
      } catch {
      }
    } catch (err) {
      console.error(
        'REVIEW ERROR:',
        err
      );

      const message =
        getErrorMessage(err) ||
        'Unable to add review';

      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between mb-8">
            <div className="h-6 w-28 skeleton rounded-lg" />

            <div className="flex gap-2">
              <div className="w-10 h-10 skeleton rounded-xl" />
              <div className="w-10 h-10 skeleton rounded-xl" />
            </div>
          </div>

          <div className="h-5 w-80 skeleton rounded-lg mb-6" />

          <motion.div
            animate={{
              scale: [
                0.99,
                1,
                0.99,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="h-[300px] sm:h-[500px] skeleton rounded-[2rem]"
          />

          <div className="grid lg:grid-cols-3 gap-10 mt-10">
            <div className="lg:col-span-2 space-y-5">
              <div className="h-5 w-40 skeleton rounded" />
              <div className="h-12 w-3/4 skeleton rounded" />
              <div className="h-5 w-full skeleton rounded" />
              <div className="h-5 w-5/6 skeleton rounded" />
              <div className="h-32 skeleton rounded-2xl" />
            </div>

            <div className="h-80 skeleton rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !experience) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="font-display font-extrabold text-2xl mb-3">
            Experience Not Found
          </h1>

          <p className="text-gray-500 leading-7 mb-6">
            {error ||
              'We could not find this experience.'}
          </p>

          <Link
            to="/experiences"
            className="btn-primary inline-flex"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Experiences
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!experience) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0 overflow-hidden">
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5"
      >
        <div className="flex items-center justify-between gap-4">
          <motion.button
            whileHover={{
              x: -4,
            }}
            whileTap={{
              scale: 0.96,
            }}
            onClick={() =>
              navigate(-1)
            }
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{
                y: -2,
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.92,
              }}
              onClick={handleShare}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
              aria-label="Share experience"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-accent-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </motion.button>

            <motion.button
              whileHover={{
                y: -2,
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.88,
              }}
              onClick={handleFavorite}
              disabled={
                favoriteLoading
              }
              className={cn(
                'w-10 h-10 rounded-xl border flex items-center justify-center transition-all',
                favorite
                  ? 'bg-red-50 border-red-200 text-red-500 shadow-lg shadow-red-500/10'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10'
              )}
              aria-label="Save experience"
            >
              <Heart
                className={cn(
                  'w-4 h-4',
                  favorite &&
                    'fill-current'
                )}
              />
            </motion.button>
          </div>
        </div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2 text-sm text-gray-400 mt-5 overflow-hidden"
        >
          <Link
            to="/"
            className="hover:text-primary-600 transition-colors"
          >
            Home
          </Link>

          <ChevronRight className="w-4 h-4 flex-shrink-0" />

          <Link
            to="/experiences"
            className="hover:text-primary-600 transition-colors"
          >
            Experiences
          </Link>

          <ChevronRight className="w-4 h-4 flex-shrink-0" />

          <span className="text-gray-600 truncate">
            {experience.title}
          </span>
        </motion.div>
      </motion.div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.85,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="relative"
        >
          <div className="relative h-[300px] sm:h-[430px] lg:h-[540px] rounded-[2rem] overflow-hidden shadow-2xl group bg-gray-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={currentImage}
                alt={
                  experience.title ||
                  'Experience'
                }
                onError={
                  handleImageError
                }
                initial={{
                  opacity: 0,
                  scale: 1.08,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.03,
                }}
                transition={{
                  duration: 0.55,
                }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5 pointer-events-none" />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={
                    previousImage
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {selectedImage + 1}/
                  {images.length}
                </div>
              </>
            )}

            <div className="absolute bottom-6 left-5 right-5 sm:left-8 sm:right-8 text-white">
              <motion.div
                variants={
                  staggerContainer
                }
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap items-center gap-3 mb-3"
                >
                  {categoryName && (
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-white/15 border border-white/20 shadow-lg"
                      style={{
                        backgroundColor:
                          categoryColor
                            ? `${categoryColor}dd`
                            : undefined,
                      }}
                    >
                      {categoryName}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md text-xs font-medium border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-secondary-400 text-secondary-400" />
                    {rating}
                    <span className="text-white/70">
                      ({reviewCount})
                    </span>
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl max-w-4xl leading-tight drop-shadow-xl"
                >
                  {experience.title}
                </motion.h1>
              </motion.div>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {images.map(
                (
                  image,
                  index
                ) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(
                        index
                      )
                    }
                    className={cn(
                      'relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all',
                      selectedImage ===
                        index
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${experience.title} ${index + 1}`}
                      onError={
                        handleImageError
                      }
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              )}
            </div>
          )}
        </motion.div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-14">
            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  {locationCity}
                  {locationCountry &&
                    `, ${locationCountry}`}
                </span>

                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {experience.duration ||
                    'Flexible duration'}
                </span>

                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  Up to{' '}
                  {experience.groupSize
                    ?.max || 0}{' '}
                  people
                </span>
              </div>

              <motion.div
                variants={
                  staggerContainer
                }
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6"
              >
                {[
                  {
                    icon: Clock,
                    label: 'Duration',
                    value:
                      experience.duration ||
                      'Flexible',
                    color:
                      'text-primary-600',
                  },
                  {
                    icon: Users,
                    label: 'Group Size',
                    value: `${experience.groupSize?.min || 1}-${experience.groupSize?.max || 10}`,
                    color:
                      'text-primary-600',
                  },
                  {
                    icon: Star,
                    label: 'Rating',
                    value: `${rating}/5`,
                    color:
                      'text-secondary-500',
                    filled: true,
                  },
                  {
                    icon: Award,
                    label: 'Reviews',
                    value:
                      reviewCount,
                    color:
                      'text-accent-500',
                  },
                ].map(
                  (stat) => {
                    const Icon =
                      stat.icon;

                    return (
                      <motion.div
                        key={
                          stat.label
                        }
                        variants={
                          cardReveal
                        }
                        whileHover={{
                          y: -6,
                          scale: 1.02,
                        }}
                        className="group rounded-2xl bg-gray-50 border border-gray-100 p-4 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110',
                            stat.color,
                            stat.filled &&
                              'fill-current'
                          )}
                        />

                        <p className="text-xs text-gray-400">
                          {stat.label}
                        </p>

                        <p className="font-semibold text-sm mt-1">
                          {stat.value}
                        </p>
                      </motion.div>
                    );
                  }
                )}
              </motion.div>
            </motion.section>

            {experience.description && (
              <motion.section
                variants={slideLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 rounded-full bg-primary-500" />

                  <h2 className="font-display font-extrabold text-2xl">
                    About this experience
                  </h2>
                </div>

                <p className="text-gray-600 leading-8 whitespace-pre-line">
                  {experience.description}
                </p>
              </motion.section>
            )}

            {highlights.length > 0 && (
              <motion.section
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
              >
                <div className="mb-5">
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                    Why you'll love it
                  </span>

                  <h2 className="font-display font-extrabold text-2xl mt-1">
                    Experience Highlights
                  </h2>
                </div>

                <motion.div
                  variants={
                    staggerContainer
                  }
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                  }}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {highlights.map(
                    (
                      highlight,
                      index
                    ) => (
                      <motion.div
                        key={index}
                        variants={
                          cardReveal
                        }
                        whileHover={{
                          y: -5,
                          x: 2,
                        }}
                        className="group flex items-start gap-3 p-4 rounded-2xl bg-accent-50/60 border border-accent-100 hover:bg-accent-50 hover:shadow-lg hover:shadow-accent-500/10 transition-all duration-300"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-accent-600" />
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {highlight}
                        </p>
                      </motion.div>
                    )
                  )}
                </motion.div>
              </motion.section>
            )}

            {itinerary.length > 0 && (
              <motion.section
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                }}
              >
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>

                  <div>
                    <h2 className="font-display font-extrabold text-2xl">
                      Your Itinerary
                    </h2>

                    <p className="text-sm text-gray-400">
                      A journey designed around memorable moments
                    </p>
                  </div>
                </div>

                <div>
                  {itinerary.map(
                    (
                      item,
                      index
                    ) => (
                      <motion.div
                        key={
                          item._id ||
                          index
                        }
                        initial={{
                          opacity: 0,
                          x: -25,
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
                            index *
                            0.08,
                          duration:
                            0.5,
                        }}
                        className="flex gap-4 group"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary-600/20 relative z-10">
                            {item.day ||
                              index + 1}
                          </div>

                          {index <
                            itinerary.length -
                              1 && (
                            <div className="w-px flex-1 bg-primary-100 my-2" />
                          )}
                        </div>

                        <div className="pb-8">
                          <p className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1">
                            Day{' '}
                            {item.day ||
                              index + 1}
                          </p>

                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">
                            {item.title ||
                              `Day ${
                                item.day ||
                                index + 1
                              }`}
                          </h3>

                          <p className="text-sm text-gray-500 leading-7 max-w-2xl">
                            {
                              item.description
                            }
                          </p>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </motion.section>
            )}

            {(included.length > 0 ||
              excluded.length > 0) && (
              <motion.section
                variants={
                  staggerContainer
                }
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                }}
                className="grid sm:grid-cols-2 gap-5"
              >
                {included.length > 0 && (
                  <motion.div
                    variants={
                      cardReveal
                    }
                    className="rounded-3xl border border-accent-100 bg-accent-50/40 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-accent-600" />
                      </div>

                      <h3 className="font-display font-bold text-lg">
                        What's Included
                      </h3>
                    </div>

                    <ul className="space-y-3">
                      {included.map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={
                              index
                            }
                            className="flex items-start gap-3 text-sm text-gray-600"
                          >
                            <Check className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </motion.div>
                )}

                {excluded.length > 0 && (
                  <motion.div
                    variants={
                      cardReveal
                    }
                    className="rounded-3xl border border-red-100 bg-red-50/40 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <X className="w-5 h-5 text-red-500" />
                      </div>

                      <h3 className="font-display font-bold text-lg">
                        Not Included
                      </h3>
                    </div>

                    <ul className="space-y-3">
                      {excluded.map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={
                              index
                            }
                            className="flex items-start gap-3 text-sm text-gray-600"
                          >
                            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </motion.div>
                )}
              </motion.section>
            )}

            {experience.host && (
              <motion.section
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                }}
                className="rounded-3xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 p-6 sm:p-8 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-5">
                  <ShieldCheck className="w-4 h-4" />
                  Your Host
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0 shadow-lg">
                    {hostImage ? (
                      <img
                        src={
                          hostImage
                        }
                        alt={
                          experience
                            .host
                            .name ||
                          'Host'
                        }
                        onError={
                          handleImageError
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary-600">
                        {experience.host.name?.charAt(
                          0
                        ) || 'H'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-xl mb-1">
                      {experience.host.name ||
                        'Local Host'}
                    </h3>

                    {experience.host.bio && (
                      <p className="text-sm text-gray-500 leading-7">
                        {
                          experience
                            .host
                            .bio
                        }
                      </p>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                    Traveler feedback
                  </span>

                  <h2 className="font-display font-extrabold text-2xl mt-1">
                    Traveler Reviews
                  </h2>

                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-5 h-5 text-secondary-500 fill-secondary-500" />

                    <span className="font-bold">
                      {rating}
                    </span>

                    <span className="text-sm text-gray-400">
                      from{' '}
                      {reviewCount}{' '}
                      reviews
                    </span>
                  </div>
                </div>

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() =>
                      setReviewModal(
                        true
                      )
                    }
                    className="btn-outline"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {reviews.length > 0 ? (
                <motion.div
                  variants={
                    staggerContainer
                  }
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                  }}
                  className="space-y-4"
                >
                  {reviews.map(
                    (
                      review,
                      index
                    ) => {
                      const reviewImage =
                        getReviewImage(
                          review
                        );

                      const reviewerName =
                        review.name ||
                        review.user?.name ||
                        review.user?.fullName ||
                        'Traveler';

                      return (
                        <motion.div
                          key={
                            review._id ||
                            review.id ||
                            index
                          }
                          variants={
                            cardReveal
                          }
                          className="card p-5 sm:p-6"
                        >
                          <div className="flex gap-4">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                              {reviewImage ? (
                                <img
                                  src={
                                    reviewImage
                                  }
                                  alt={
                                    reviewerName
                                  }
                                  onError={
                                    handleImageError
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold">
                                  {reviewerName
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <p className="font-semibold">
                                  {
                                    reviewerName
                                  }
                                </p>

                                <span className="text-xs text-gray-400">
                                  {review.createdAt
                                    ? formatDate(
                                        review.createdAt
                                      )
                                    : ''}
                                </span>
                              </div>

                              <div className="flex gap-0.5 my-2">
                                {Array.from(
                                  {
                                    length: 5,
                                  }
                                ).map(
                                  (
                                    _,
                                    starIndex
                                  ) => (
                                    <Star
                                      key={
                                        starIndex
                                      }
                                      className={cn(
                                        'w-4 h-4',
                                        starIndex <
                                          Number(
                                            review.rating
                                          )
                                          ? 'text-secondary-500 fill-secondary-500'
                                          : 'text-gray-200'
                                      )}
                                    />
                                  )
                                )}
                              </div>

                              <p className="text-sm text-gray-600 leading-7">
                                {
                                  review.comment
                                }
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </motion.div>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-gray-300" />
                  </div>

                  <h3 className="font-semibold mb-1">
                    No reviews yet
                  </h3>

                  <p className="text-sm text-gray-400">
                    Be the first traveler to share your experience.
                  </p>

                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() =>
                        setReviewModal(
                          true
                        )
                      }
                      className="btn-primary mt-5"
                    >
                      Write the First Review
                    </button>
                  )}
                </div>
              )}
            </motion.section>
          </div>

          <aside>
            <motion.div
              initial={{
                opacity: 0,
                x: 35,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.35,
                duration: 0.7,
              }}
              className="card p-6 lg:sticky lg:top-24"
            >
              <div className="flex items-end gap-2 mb-6">
                <span className="font-display font-extrabold text-3xl text-primary-600">
                  {formatCurrency(
                    price
                  )}
                </span>

                <span className="text-sm text-gray-400 mb-1">
                  / person
                </span>
              </div>

              <div className="space-y-4 pb-6 border-b border-gray-100">
                {[
                  {
                    icon: Calendar,
                    label: 'Availability',
                    value:
                      'Flexible dates',
                  },
                  {
                    icon: Users,
                    label: 'Group size',
                    value: `${experience.groupSize?.min || 1}-${experience.groupSize?.max || 10} people`,
                  },
                  {
                    icon: MapPin,
                    label: 'Location',
                    value: `${locationCity}${
                      locationCountry
                        ? `, ${locationCountry}`
                        : ''
                    }`,
                  },
                ].map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <div
                        key={
                          item.label
                        }
                        className="flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary-600" />
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            {item.label}
                          </p>

                          <p className="text-sm font-semibold">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <button
                onClick={
                  openBookingModal
                }
                className="btn-primary w-full text-base py-3.5 mt-6"
              >
                <Calendar className="w-5 h-5" />
                Book This Experience
              </button>

              <div className="flex items-center justify-center gap-6 mt-5">
                <button
                  onClick={
                    handleFavorite
                  }
                  disabled={
                    favoriteLoading
                  }
                  className={cn(
                    'flex items-center gap-2 text-sm transition-colors',
                    favorite
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                  )}
                >
                  <Heart
                    className={cn(
                      'w-4 h-4',
                      favorite &&
                        'fill-current'
                    )}
                  />

                  {favorite
                    ? 'Saved'
                    : 'Save'}
                </button>

                <button
                  onClick={
                    handleShare
                  }
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"
                >
                  {copied ? (
                    <Copy className="w-4 h-4" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}

                  Share
                </button>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-accent-50 border border-accent-100">
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent-600 flex-shrink-0" />

                  <div>
                    <p className="text-sm font-semibold text-accent-800">
                      Secure booking
                    </p>

                    <p className="text-xs text-accent-700/70 mt-1 leading-5">
                      Your booking information is securely handled.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        {related.length > 0 && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            className="mt-20"
          >
            <div className="flex items-end justify-between gap-4 mb-7">
              <div>
                <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                  More adventures
                </span>

                <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">
                  You Might Also Like
                </h2>
              </div>

              <Link
                to="/experiences"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:gap-2 transition-all"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <motion.div
              variants={
                staggerContainer
              }
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {related.map(
                (
                  item,
                  index
                ) => (
                  <motion.div
                    key={
                      item._id ||
                      item.id ||
                      index
                    }
                    variants={
                      cardReveal
                    }
                    whileHover={{
                      y: -7,
                    }}
                  >
                    <ExperienceCard
                      experience={
                        item
                      }
                      index={index}
                    />
                  </motion.div>
                )
              )}
            </motion.div>
          </motion.section>
        )}
      </main>

      <AnimatePresence>
        <motion.div
          initial={{
            y: 100,
          }}
          animate={{
            y: 0,
          }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-400">
                Starting from
              </p>

              <p className="font-display font-extrabold text-xl text-primary-600">
                {formatCurrency(
                  price
                )}
              </p>
            </div>

            <button
              onClick={
                openBookingModal
              }
              className="btn-primary px-6 py-3"
            >
              Book Now
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Modal
        isOpen={bookingModal}
        onClose={() =>
          !submitting &&
          setBookingModal(false)
        }
        title="Book Your Experience"
      >
        <motion.div
          variants={
            staggerContainer
          }
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          <div className="rounded-2xl bg-primary-50 p-4">
            <p className="text-xs text-primary-500 font-semibold uppercase tracking-wide">
              You're booking
            </p>

            <p className="font-semibold text-gray-900 mt-1">
              {experience.title}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {locationCity}
              {locationCountry
                ? `, ${locationCountry}`
                : ''}
            </p>
          </div>

          <div>
            <label className="label">
              Select Date
            </label>

            <input
              type="date"
              value={bookingDate}
              onChange={(e) =>
                setBookingDate(
                  e.target.value
                )
              }
              min={today}
              className="input"
              disabled={
                submitting
              }
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">
                Guests
              </label>

              <span className="text-xs text-gray-400">
                {totalGuests}/
                {maxGuests}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                <div>
                  <p className="font-semibold text-sm">
                    Adults
                  </p>

                  <p className="text-xs text-gray-400">
                    Full price
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={
                      adults <= 1 ||
                      submitting
                    }
                    onClick={() =>
                      handleAdultsChange(
                        -1
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-6 text-center font-bold">
                    {adults}
                  </span>

                  <button
                    type="button"
                    disabled={
                      submitting ||
                      totalGuests >=
                        maxGuests
                    }
                    onClick={() =>
                      handleAdultsChange(
                        1
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                <div>
                  <p className="font-semibold text-sm">
                    Children
                  </p>

                  <p className="text-xs text-gray-400">
                    50% of adult price
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={
                      children <=
                        0 ||
                      submitting
                    }
                    onClick={() =>
                      handleChildrenChange(
                        -1
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-6 text-center font-bold">
                    {children}
                  </span>

                  <button
                    type="button"
                    disabled={
                      submitting ||
                      totalGuests >=
                        maxGuests
                    }
                    onClick={() =>
                      handleChildrenChange(
                        1
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">
                {adults} adult
                {adults !== 1
                  ? 's'
                  : ''}{' '}
                ×{' '}
                {formatCurrency(
                  price
                )}
              </span>

              <span className="font-semibold">
                {formatCurrency(
                  price * adults
                )}
              </span>
            </div>

            {children > 0 && (
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">
                  {children}{' '}
                  child
                  {children !== 1
                    ? 'ren'
                    : ''}{' '}
                  ×{' '}
                  {formatCurrency(
                    childPrice
                  )}
                </span>

                <span className="font-semibold">
                  {formatCurrency(
                    childPrice *
                      children
                  )}
                </span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="font-bold">
                Total
              </span>

              <span className="font-display font-extrabold text-2xl text-primary-600">
                {formatCurrency(
                  totalPrice
                )}
              </span>
            </div>
          </div>

          <button
            onClick={
              handleBooking
            }
            disabled={submitting}
            className="btn-primary w-full text-base py-3.5 disabled:opacity-60"
          >
            {submitting
              ? 'Processing Booking...'
              : 'Confirm Booking'}
          </button>

          <p className="text-center text-xs text-gray-400">
            You won't be charged until your booking is confirmed.
          </p>
        </motion.div>
      </Modal>

      <Modal
        isOpen={reviewModal}
        onClose={() =>
          !reviewSubmitting &&
          setReviewModal(false)
        }
        title="Share Your Experience"
      >
        <motion.div className="space-y-5">
          <div className="rounded-2xl bg-primary-50 p-4">
            <p className="text-xs text-primary-500 font-semibold uppercase tracking-wide">
              Reviewing
            </p>

            <p className="font-semibold text-gray-900 mt-1">
              {experience.title}
            </p>
          </div>

          <div>
            <label className="label">
              Your Rating
            </label>

            <div className="flex gap-2">
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={
                      reviewSubmitting
                    }
                    onClick={() =>
                      setReviewRating(
                        index + 1
                      )
                    }
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className={cn(
                        'w-8 h-8',
                        index <
                          reviewRating
                          ? 'text-secondary-500 fill-secondary-500'
                          : 'text-gray-200'
                      )}
                    />
                  </button>
                )
              )}
            </div>

            <p className="text-sm font-medium text-gray-500 mt-2">
              {reviewRating}/5
            </p>
          </div>

          <div>
            <label className="label">
              Your Review
            </label>

            <textarea
              value={
                reviewComment
              }
              onChange={(e) =>
                setReviewComment(
                  e.target.value
                )
              }
              rows={5}
              maxLength={500}
              disabled={
                reviewSubmitting
              }
              placeholder="Tell other travelers what made this experience special..."
              className="input resize-none"
            />

            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                Minimum 10 characters
              </p>

              <p className="text-xs text-gray-400">
                {
                  reviewComment.length
                }
                /500
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleReview
            }
            disabled={
              reviewSubmitting ||
              reviewComment.trim()
                .length < 10
            }
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {reviewSubmitting
              ? 'Publishing Review...'
              : 'Publish Review'}
          </button>
        </motion.div>
      </Modal>
    </div>
  );
};

export default ExperienceDetail;