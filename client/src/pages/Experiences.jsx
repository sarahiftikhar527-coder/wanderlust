import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Star,
  X,
  ChevronDown,
  Compass,
} from 'lucide-react';

import {
  experienceService,
  categoryService,
} from '../api/services';

import ExperienceCard from '../components/ExperienceCard';
import { getErrorMessage, cn } from '../utils/helpers';
import toast from 'react-hot-toast';

const CLOUDINARY_IMAGES = {
  hunza:
    'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Hunza_Valley_fc9vgo.jpg',
  murree:
    'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Murree_Hiking_ehjn85.jpg',
  skardu:
    'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035829/Skardu_Adventure_wyjwrt.jpg',
  nathiaGali:
    'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
  cholistan:
    'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035828/Cholistan_Desert_Pakistan_krrsmv.jpg',
};

const DEFAULT_IMAGE = CLOUDINARY_IMAGES.nathiaGali;

const EXPERIENCE_IMAGES = [
  CLOUDINARY_IMAGES.hunza,
  CLOUDINARY_IMAGES.murree,
  CLOUDINARY_IMAGES.skardu,
  CLOUDINARY_IMAGES.nathiaGali,
  CLOUDINARY_IMAGES.cholistan,
];

const EXPERIENCE_IMAGE_MAP = {
  hunza: CLOUDINARY_IMAGES.hunza,
  murree: CLOUDINARY_IMAGES.murree,
  skardu: CLOUDINARY_IMAGES.skardu,
  lahore: CLOUDINARY_IMAGES.cholistan,
  islamabad: CLOUDINARY_IMAGES.nathiaGali,
  karachi: CLOUDINARY_IMAGES.cholistan,
  'fairy meadows': CLOUDINARY_IMAGES.skardu,
};

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

const cardReveal = {
  hidden: {
    opacity: 0,
    y: 25,
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

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === 'string') {
    const value = image.trim();
    return value || null;
  }

  if (typeof image === 'object') {
    return (
      image.secure_url ||
      image.secureUrl ||
      image.url ||
      image.src ||
      image.path ||
      image.publicUrl ||
      image.location ||
      null
    );
  }

  return null;
};

const getExperienceImage = (experience, index = 0) => {
  if (!experience) {
    return DEFAULT_IMAGE;
  }

  const possibleImages = [
    experience.coverImage,
    experience.image,
    experience.thumbnail,
    experience.cover,
    experience.featuredImage,
    experience.heroImage,
  ];

  for (const image of possibleImages) {
    const url = getImageUrl(image);

    if (
      url &&
      !url.includes('images.unsplash.com')
    ) {
      return url;
    }
  }

  if (Array.isArray(experience.images)) {
    for (const image of experience.images) {
      const url = getImageUrl(image);

      if (
        url &&
        !url.includes('images.unsplash.com')
      ) {
        return url;
      }
    }
  }

  if (Array.isArray(experience.gallery)) {
    for (const image of experience.gallery) {
      const url = getImageUrl(image);

      if (
        url &&
        !url.includes('images.unsplash.com')
      ) {
        return url;
      }
    }
  }

  const city = (
    experience.location?.city ||
    experience.city ||
    ''
  )
    .trim()
    .toLowerCase();

  if (EXPERIENCE_IMAGE_MAP[city]) {
    return EXPERIENCE_IMAGE_MAP[city];
  }

  const title = (
    experience.title || ''
  ).toLowerCase();

  if (title.includes('hunza')) {
    return CLOUDINARY_IMAGES.hunza;
  }

  if (title.includes('murree')) {
    return CLOUDINARY_IMAGES.murree;
  }

  if (title.includes('skardu')) {
    return CLOUDINARY_IMAGES.skardu;
  }

  if (title.includes('lahore')) {
    return CLOUDINARY_IMAGES.cholistan;
  }

  if (title.includes('islamabad')) {
    return CLOUDINARY_IMAGES.nathiaGali;
  }

  if (title.includes('karachi')) {
    return CLOUDINARY_IMAGES.cholistan;
  }

  if (title.includes('fairy meadows')) {
    return CLOUDINARY_IMAGES.skardu;
  }

  return (
    EXPERIENCE_IMAGES[
      index % EXPERIENCE_IMAGES.length
    ] || DEFAULT_IMAGE
  );
};

const getCategoryName = (experience) => {
  if (!experience) {
    return '';
  }

  if (
    typeof experience.category === 'object' &&
    experience.category !== null
  ) {
    return experience.category?.name || '';
  }

  return experience.category || '';
};

const getLocation = (experience) => {
  if (!experience) {
    return 'Unknown location';
  }

  const city =
    experience.location?.city ||
    experience.city ||
    '';

  const country =
    experience.location?.country ||
    experience.country ||
    '';

  if (city && country) {
    return `${city}, ${country}`;
  }

  return city || country || 'Unknown location';
};

const SIDEBAR_TOP = 96;
const SIDEBAR_BOTTOM = 24;

const Experiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [selectedLocation, setSelectedLocation] =
    useState('all');

  const [sortBy, setSortBy] =
    useState('featured');

  const [showFilters, setShowFilters] =
    useState(false);

  const [priceRange, setPriceRange] =
    useState('all');

  const [ratingFilter, setRatingFilter] =
    useState('all');

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 12;

  const sidebarAnchorRef = useRef(null);
  const sidebarAreaRef = useRef(null);

  const [isSidebarPinned, setIsSidebarPinned] =
    useState(false);

  const [sidebarWidth, setSidebarWidth] =
    useState(256);

  const [sidebarLeft, setSidebarLeft] =
    useState(0);

  useEffect(() => {
    const updateSidebar = () => {
      const anchor = sidebarAnchorRef.current;

      if (!anchor) {
        return;
      }

      const rect =
        anchor.getBoundingClientRect();

      const shouldPin =
        rect.top <= SIDEBAR_TOP;

      setIsSidebarPinned(shouldPin);

      if (shouldPin) {
        setSidebarWidth(rect.width);
        setSidebarLeft(rect.left);
      }
    };

    updateSidebar();

    window.addEventListener(
      'scroll',
      updateSidebar,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      updateSidebar
    );

    return () => {
      window.removeEventListener(
        'scroll',
        updateSidebar
      );

      window.removeEventListener(
        'resize',
        updateSidebar
      );
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchExperiences = async () => {
      setLoading(true);
      setError('');

      try {
        const response =
          await experienceService.getAll();

        if (!mounted) {
          return;
        }

        const responseData = response?.data;

        const experienceData =
          responseData?.data?.experiences ||
          responseData?.experiences ||
          responseData?.data ||
          [];

        setExperiences(
          Array.isArray(experienceData)
            ? experienceData
            : []
        );
      } catch (err) {
        console.error(
          'FETCH EXPERIENCES ERROR:',
          err
        );

        if (!mounted) {
          return;
        }

        const message =
          getErrorMessage(err) ||
          'Unable to load experiences';

        setError(message);
        toast.error(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchExperiences();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setCategoryLoading(true);

      try {
        const response =
          await categoryService.getAll();

        if (!mounted) {
          return;
        }

        const responseData = response?.data;

        const categoryData =
          responseData?.data?.categories ||
          responseData?.categories ||
          responseData?.data ||
          [];

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : []
        );
      } catch (err) {
        console.error(
          'FETCH CATEGORIES ERROR:',
          err
        );

        if (mounted) {
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setCategoryLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedCategory,
    selectedLocation,
    sortBy,
    priceRange,
    ratingFilter,
  ]);

  const locations = useMemo(() => {
    const values = experiences
      .map((experience) => {
        const location =
          experience.location?.city ||
          experience.city ||
          '';

        return location.trim();
      })
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [experiences]);

  const filteredExperiences = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    let result = experiences.filter(
      (experience) => {
        const title =
          experience.title || '';

        const description =
          experience.description || '';

        const location =
          getLocation(experience);

        const category =
          getCategoryName(experience);

        const matchesSearch =
          !normalizedSearch ||
          title
            .toLowerCase()
            .includes(normalizedSearch) ||
          description
            .toLowerCase()
            .includes(normalizedSearch) ||
          location
            .toLowerCase()
            .includes(normalizedSearch) ||
          category
            .toLowerCase()
            .includes(normalizedSearch);

        const experienceCategory =
          getCategoryName(experience)
            .toLowerCase();

        const selectedCategoryName =
          selectedCategory.toLowerCase();

        const matchesCategory =
          selectedCategory === 'all' ||
          experienceCategory ===
            selectedCategoryName;

        const experienceCity = (
          experience.location?.city ||
          experience.city ||
          ''
        ).toLowerCase();

        const matchesLocation =
          selectedLocation === 'all' ||
          experienceCity ===
            selectedLocation.toLowerCase();

        const price =
          Number(experience.price) || 0;

        const matchesPrice =
          priceRange === 'all' ||
          (priceRange === 'under50' &&
            price < 50) ||
          (priceRange === '50to100' &&
            price >= 50 &&
            price <= 100) ||
          (priceRange === '100to200' &&
            price > 100 &&
            price <= 200) ||
          (priceRange === 'over200' &&
            price > 200);

        const rating =
          Number(
            experience.rating || 0
          );

        const matchesRating =
          ratingFilter === 'all' ||
          (ratingFilter === '4' &&
            rating >= 4) ||
          (ratingFilter === '4.5' &&
            rating >= 4.5);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesLocation &&
          matchesPrice &&
          matchesRating
        );
      }
    );

    result = [...result].sort(
      (a, b) => {
        if (sortBy === 'price-low') {
          return (
            Number(a.price || 0) -
            Number(b.price || 0)
          );
        }

        if (sortBy === 'price-high') {
          return (
            Number(b.price || 0) -
            Number(a.price || 0)
          );
        }

        if (sortBy === 'rating') {
          return (
            Number(b.rating || 0) -
            Number(a.rating || 0)
          );
        }

        if (sortBy === 'newest') {
          return (
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
          );
        }

        if (sortBy === 'title') {
          return (
            a.title || ''
          ).localeCompare(
            b.title || ''
          );
        }

        if (
          Boolean(b.featured) !==
          Boolean(a.featured)
        ) {
          return Boolean(b.featured)
            ? -1
            : 1;
        }

        return (
          Number(b.rating || 0) -
          Number(a.rating || 0)
        );
      }
    );

    return result;
  }, [
    experiences,
    search,
    selectedCategory,
    selectedLocation,
    sortBy,
    priceRange,
    ratingFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredExperiences.length /
        itemsPerPage
    )
  );

  const paginatedExperiences =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        itemsPerPage;

      return filteredExperiences.slice(
        start,
        start + itemsPerPage
      );
    }, [
      filteredExperiences,
      currentPage,
    ]);

  const activeFiltersCount =
    useMemo(() => {
      let count = 0;

      if (selectedCategory !== 'all') {
        count++;
      }

      if (selectedLocation !== 'all') {
        count++;
      }

      if (priceRange !== 'all') {
        count++;
      }

      if (ratingFilter !== 'all') {
        count++;
      }

      return count;
    }, [
      selectedCategory,
      selectedLocation,
      priceRange,
      ratingFilter,
    ]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setPriceRange('all');
    setRatingFilter('all');
    setSortBy('featured');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-3xl">
              <div className="h-14 w-full max-w-2xl skeleton rounded-xl mb-4" />

              <div className="h-5 w-full max-w-xl skeleton rounded-lg" />
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay:
                    index * 0.05,
                }}
                className="rounded-3xl overflow-hidden border border-gray-100 bg-white"
              >
                <div className="h-56 skeleton" />

                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 skeleton rounded" />
                  <div className="h-6 w-4/5 skeleton rounded" />
                  <div className="h-4 w-full skeleton rounded" />
                  <div className="h-10 w-full skeleton rounded-xl" />
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (
    error &&
    experiences.length === 0
  ) {
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
            <Compass className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="font-display font-extrabold text-2xl mb-3">
            Unable to Load Experiences
          </h1>

          <p className="text-gray-500 leading-7 mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="btn-primary"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const FiltersContent = ({
    mobile = false,
  }) => (
    <div
      className={
        mobile
          ? 'space-y-7'
          : 'space-y-6'
      }
    >
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Category
        </label>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() =>
              setSelectedCategory('all')
            }
            className={cn(
              'w-full text-left rounded-xl text-sm transition-all',
              mobile
                ? 'px-4 py-3'
                : 'px-3 py-2.5',
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white'
                : mobile
                  ? 'bg-gray-50 text-gray-600'
                  : 'text-gray-600 hover:bg-white'
            )}
          >
            All Experiences
          </button>

          {!categoryLoading &&
            categories.map(
              (category) => (
                <button
                  type="button"
                  key={
                    category._id ||
                    category.id ||
                    category.slug ||
                    category.name
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category.name || ''
                    )
                  }
                  className={cn(
                    'w-full text-left rounded-xl text-sm transition-all',
                    mobile
                      ? 'px-4 py-3'
                      : 'px-3 py-2.5',
                    selectedCategory.toLowerCase() ===
                      (
                        category.name || ''
                      ).toLowerCase()
                      ? 'bg-primary-600 text-white'
                      : mobile
                        ? 'bg-gray-50 text-gray-600'
                        : 'text-gray-600 hover:bg-white'
                  )}
                >
                  {category.name}
                </button>
              )
            )}
        </div>
      </div>

      {locations.length > 0 && (
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Location
          </label>

          <select
            value={selectedLocation}
            onChange={(event) =>
              setSelectedLocation(
                event.target.value
              )
            }
            className={cn(
              'w-full mt-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-primary-400',
              mobile
                ? 'px-4 py-3'
                : 'px-3 py-2.5'
            )}
          >
            <option value="all">
              All Locations
            </option>

            {locations.map(
              (location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              )
            )}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Price
        </label>

        <div className="mt-3 space-y-2">
          {[
            ['all', 'Any price'],
            ['under50', 'Under $50'],
            ['50to100', '$50 - $100'],
            ['100to200', '$100 - $200'],
            ['over200', '$200+'],
          ].map(
            ([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() =>
                  setPriceRange(value)
                }
                className={cn(
                  'w-full text-left rounded-xl text-sm transition-all',
                  mobile
                    ? 'px-4 py-3'
                    : 'px-3 py-2.5',
                  priceRange === value
                    ? 'bg-primary-600 text-white'
                    : mobile
                      ? 'bg-gray-50 text-gray-600'
                      : 'text-gray-600 hover:bg-white'
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Rating
        </label>

        <div className="mt-3 space-y-2">
          {[
            ['all', 'Any rating'],
            ['4', '4.0+'],
            ['4.5', '4.5+'],
          ].map(
            ([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() =>
                  setRatingFilter(value)
                }
                className={cn(
                  'w-full text-left rounded-xl text-sm transition-all flex items-center gap-2',
                  mobile
                    ? 'px-4 py-3'
                    : 'px-3 py-2.5',
                  ratingFilter === value
                    ? 'bg-primary-600 text-white'
                    : mobile
                      ? 'bg-gray-50 text-gray-600'
                      : 'text-gray-600 hover:bg-white'
                )}
              >
                {value !== 'all' && (
                  <Star className="w-3.5 h-3.5 fill-current" />
                )}

                {label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );

  const filtersPanelInner = (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-600" />

          <h3 className="font-bold">
            Filters
          </h3>
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Clear
          </button>
        )}
      </div>

      <FiltersContent />
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-100/40 blur-3xl" />

          <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-accent-100/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 relative">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
              Find your next
              <span className="text-primary-600">
                {' '}
                unforgettable
              </span>{' '}
              experience
            </h1>

            <p className="text-gray-500 text-base sm:text-lg leading-8 mt-5 max-w-2xl">
              Discover unique adventures,
              hidden gems, and unforgettable
              moments created by local hosts
              around the world.
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
              duration: 0.6,
            }}
            className="mt-8"
          >
            <div className="relative max-w-3xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search experiences, destinations, activities..."
                className="w-full h-14 pl-14 pr-5 rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          <div
            ref={sidebarAnchorRef}
            className="hidden lg:block w-64 shrink-0 self-start"
          >
            <div
              ref={sidebarAreaRef}
              className="w-64"
              style={{
                minHeight: isSidebarPinned
                  ? `calc(100vh - ${SIDEBAR_TOP + SIDEBAR_BOTTOM}px)`
                  : undefined,
              }}
            >
              {!isSidebarPinned && (
                <div className="w-64 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-gray-100 bg-gray-50/95 backdrop-blur-sm p-5 shadow-sm scrollbar-hide">
                  {filtersPanelInner}
                </div>
              )}
            </div>
          </div>

          {isSidebarPinned && (
            <div
              className="hidden lg:block fixed z-30"
              style={{
                top: `${SIDEBAR_TOP}px`,
                left: `${sidebarLeft}px`,
                width: `${sidebarWidth}px`,
                height: `calc(100vh - ${SIDEBAR_TOP + SIDEBAR_BOTTOM}px)`,
              }}
            >
              <div className="w-full h-full overflow-y-auto rounded-3xl border border-gray-100 bg-gray-50/95 backdrop-blur-sm p-5 shadow-sm scrollbar-hide">
                {filtersPanelInner}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
              <div>
                <p className="text-sm text-gray-400">
                  Showing{' '}
                  <span className="font-semibold text-gray-700">
                    {
                      filteredExperiences.length
                    }
                  </span>{' '}
                  experiences
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(true)
                  }
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold"
                >
                  <SlidersHorizontal className="w-4 h-4" />

                  Filters

                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center">
                      {
                        activeFiltersCount
                      }
                    </span>
                  )}
                </button>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium outline-none focus:border-primary-400"
                  >
                    <option value="featured">
                      Featured
                    </option>

                    <option value="rating">
                      Highest Rated
                    </option>

                    <option value="newest">
                      Newest
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="title">
                      Name
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {paginatedExperiences.length >
              0 ? (
                <motion.div
                  key="results"
                  variants={
                    staggerContainer
                  }
                  initial="hidden"
                  animate="visible"
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {paginatedExperiences.map(
                    (
                      experience,
                      index
                    ) => {
                      const image =
                        getExperienceImage(
                          experience,
                          index
                        );

                      const normalizedImages =
                        Array.isArray(
                          experience.images
                        )
                          ? experience.images
                              .map(
                                (
                                  item
                                ) =>
                                  getImageUrl(
                                    item
                                  )
                              )
                              .filter(
                                (url) =>
                                  url &&
                                  url !==
                                    image &&
                                  !url.includes(
                                    'images.unsplash.com'
                                  )
                              )
                              .slice(0, 2)
                          : [];

                      return (
                        <motion.div
                          key={
                            experience._id ||
                            experience.id ||
                            experience.slug ||
                            index
                          }
                          variants={
                            cardReveal
                          }
                          whileHover={{
                            y: -7,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                          className="relative"
                        >
                          <ExperienceCard
                            experience={{
                              ...experience,
                              image,
                              coverImage:
                                image,
                              images: [
                                image,
                                ...normalizedImages,
                              ],
                            }}
                            index={index}
                          />
                        </motion.div>
                      );
                    }
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-3xl border border-dashed border-gray-200 p-12 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
                    <Compass className="w-7 h-7 text-gray-300" />
                  </div>

                  <h3 className="font-display font-bold text-xl mb-2">
                    No experiences found
                  </h3>

                  <p className="text-sm text-gray-400 max-w-md mx-auto leading-6">
                    We couldn't find
                    experiences matching
                    your current search and
                    filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-outline mt-6"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  ←
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-semibold transition-all',
                      currentPage ===
                        page
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showFilters && (
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
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() =>
                setShowFilters(false)
              }
            />

            <motion.div
              initial={{
                x: '-100%',
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: '-100%',
              }}
              transition={{
                duration: 0.3,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-white p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary-600" />

                  <h2 className="font-display font-bold text-xl">
                    Filters
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(false)
                  }
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FiltersContent mobile />

              <button
                type="button"
                onClick={() =>
                  setShowFilters(false)
                }
                className="btn-primary w-full mt-7"
              >
                Apply Filters
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Experiences;