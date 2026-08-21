import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Compass,
  Globe2,
  Heart,
  MapPin,
  Play,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  experienceService,
  categoryService,
} from '../api/services';

import ExperienceCard from '../components/ExperienceCard';
import SkeletonGrid from '../components/SkeletonGrid';

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', '18%']
  );

  const heroScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1.08]
  );

  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.72],
    [1, 0]
  );

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [featuredResponse, categoriesResponse] =
          await Promise.all([
            experienceService.getFeatured(),
            categoryService.getAll(),
          ]);

        if (!mounted) return;

        const experiences =
          featuredResponse?.data?.data?.experiences ||
          featuredResponse?.data?.experiences ||
          [];

        const categoryData =
          categoriesResponse?.data?.data?.categories ||
          categoriesResponse?.data?.categories ||
          categoriesResponse?.data?.data ||
          [];

        setFeatured(
          Array.isArray(experiences)
            ? experiences
            : []
        );

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : []
        );
      } catch (error) {
        console.error('Home data error:', error);

        if (!mounted) return;

        setFeatured([]);
        setCategories([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    navigate(
      value
        ? `/experiences?search=${encodeURIComponent(value)}`
        : '/experiences'
    );
  };

  const getCategoryImage = (category) => {
    return (
      category?.image ||
      category?.imageUrl ||
      category?.coverImage ||
      category?.thumbnail ||
      category?.photo ||
      ''
    );
  };

  const getCategoryCount = (category) => {
    return (
      category?.experienceCount ??
      category?.experiencesCount ??
      category?.count ??
      category?.experiences?.length ??
      0
    );
  };

  const reveal = {
    hidden: {
      opacity: 0,
      y: 45,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.09,
      },
    },
  };

  const stats = [
    {
      value: '50+',
      label: 'Countries',
      icon: Globe2,
    },
    {
      value: '200+',
      label: 'Experiences',
      icon: Compass,
    },
    {
      value: '15K+',
      label: 'Travelers',
      icon: Users,
    },
    {
      value: '4.9',
      label: 'Average rating',
      icon: Check,
    },
  ];

  const benefits = [
    {
      number: '01',
      icon: Compass,
      title: 'Curated discovery',
      description:
        'Explore remarkable experiences selected for travelers who want something beyond the ordinary.',
    },
    {
      number: '02',
      icon: ShieldCheck,
      title: 'Travel with confidence',
      description:
        'Discover trusted experiences with transparent information and genuine traveler feedback.',
    },
    {
      number: '03',
      icon: Heart,
      title: 'Make it personal',
      description:
        'Save the places that inspire you and build a collection of adventures around your style.',
    },
  ];

  const floatingCards = [
    {
      icon: Check,
      value: '4.9',
      label: 'Traveler rating',
      position: 'right-[6%] top-[22%]',
    },
    {
      icon: Globe2,
      value: '50+',
      label: 'Destinations',
      position: 'right-[12%] bottom-[28%]',
    },
  ];

  return (
    <main className="overflow-hidden bg-[#fafafa] text-slate-900">
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden bg-[#080808]"
      >
        <motion.div
          style={{
            y: heroY,
            scale: heroScale,
          }}
          className="absolute inset-0"
        >
          <img
            src="https://images.pexels.com/photos/12715978/pexels-photo-12715978.jpeg?auto=compress&cs=tinysrgb&w=2200"
            alt="Beautiful mountain destination"
            className="h-full w-full object-cover"
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/15" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/35" />

        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -45, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -right-48 -top-48 h-[560px] w-[560px] rounded-full bg-white/10 blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 45, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-52 -left-52 h-[560px] w-[560px] rounded-full bg-slate-300/10 blur-[130px]"
        />

        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="pointer-events-none absolute inset-0 z-10 hidden xl:block">
          {floatingCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  y: [0, -8, 0],
                  scale: 1,
                }}
                transition={{
                  opacity: {
                    delay: 1.1 + index * 0.2,
                    duration: 0.7,
                  },
                  y: {
                    delay: 1.1 + index * 0.2,
                    duration: 5 + index,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                className={`absolute ${item.position} rounded-2xl border border-white/15 bg-black/30 px-4 py-3 shadow-2xl backdrop-blur-xl`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {item.value}
                    </p>

                    <p className="text-[9px] uppercase tracking-wider text-white/45">
                      {item.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          style={{
            opacity: heroOpacity,
          }}
          className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] items-center px-5 pb-36 pt-32 sm:px-8 lg:px-12"
        >
          <div className="w-full">
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
                duration: 0.8,
              }}
              className="mb-7"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 sm:text-xs">
                  The world is waiting
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="max-w-6xl"
            >
              <motion.h1
                variants={reveal}
                className="font-display max-w-5xl text-[3.6rem] font-black leading-[0.88] tracking-[-0.065em] text-white sm:text-7xl md:text-8xl lg:text-[8.2rem]"
              >
                Travel

                <span className="block text-white/30">
                  differently.
                </span>
              </motion.h1>

              <motion.p
                variants={reveal}
                className="mt-8 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8"
              >
                Discover remarkable places, local stories and
                unforgettable experiences that turn an ordinary
                trip into a story worth remembering.
              </motion.p>

              <motion.div
                variants={reveal}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/experiences"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-slate-950 shadow-[0_20px_60px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100"
                >
                  Explore experiences

                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>

                <Link
                  to="/about"
                  className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900">
                    <Play className="ml-0.5 h-3 w-3 fill-current" />
                  </span>

                  Our story
                </Link>
              </motion.div>
            </motion.div>

            <motion.form
              onSubmit={handleSearch}
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.65,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-14 max-w-4xl"
            >
              <div className="rounded-[1.5rem] border border-white/20 bg-white/[0.96] p-2 shadow-[0_30px_100px_rgba(0,0,0,.4)] backdrop-blur-2xl sm:rounded-full">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <MapPin className="h-5 w-5 text-slate-700" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Destination
                      </p>

                      <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Where do you want to go?"
                        aria-label="Search destination"
                        className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="hidden h-10 w-px bg-slate-200 sm:block" />

                  <div className="hidden items-center gap-3 px-4 lg:flex">
                    <Calendar className="h-5 w-5 text-slate-400" />

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        When
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        Anytime
                      </p>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    className="flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-slate-800"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </motion.button>
                </div>
              </div>
            </motion.form>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1,
            duration: 0.8,
          }}
          className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/20 backdrop-blur-xl"
        >
          <div className="mx-auto grid max-w-[1500px] grid-cols-2 divide-x divide-y divide-white/10 px-5 sm:grid-cols-4 sm:divide-y-0 sm:px-8 lg:px-12">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  whileHover={{
                    backgroundColor:
                      'rgba(255,255,255,0.04)',
                  }}
                  className="flex items-center gap-3 px-3 py-5 transition-colors sm:px-5 lg:py-6"
                >
                  <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 sm:flex">
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  <div>
                    <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                      {stat.value}
                    </p>

                    <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/40 sm:text-[10px]">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute bottom-28 right-8 z-20 hidden flex-col items-center gap-3 text-white/45 lg:flex"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
            Scroll
          </span>

          <div className="h-10 w-px bg-white/30" />
        </motion.div>
      </section>

      <section className="relative overflow-hidden bg-[#fafafa] py-28 sm:py-36">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl" />

        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: '-100px',
            }}
            variants={stagger}
            className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <motion.div variants={reveal}>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 sm:text-xs">
                Not just another trip
              </p>

              <h2 className="font-display max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                Go somewhere

                <span className="text-slate-400">
                  {' '}
                  worth remembering.
                </span>
              </h2>
            </motion.div>

            <motion.div
              variants={reveal}
              className="flex flex-col justify-end"
            >
              <p className="max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                Wanderlust connects curious travelers with
                extraordinary experiences around the world.
                From hidden local gems to once-in-a-lifetime
                adventures, we make discovering your next story
                beautifully simple.
              </p>

              <Link
                to="/experiences"
                className="group mt-7 inline-flex w-fit items-center gap-2 border-b border-slate-300 pb-2 text-sm font-bold text-slate-900 transition-colors hover:border-slate-950"
              >
                Discover the collection

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-28 sm:py-36">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: '-100px',
            }}
            variants={reveal}
            className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 sm:text-xs">
                Explore by mood
              </p>

              <h2 className="font-display max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Find your kind of adventure.
              </h2>
            </div>

            <Link
              to="/experiences"
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              View everything

              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </motion.div>

          {categories.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: '-80px',
              }}
              className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5"
            >
              {categories.slice(0, 8).map((category) => {
                const categoryImage =
                  getCategoryImage(category);

                const experienceCount =
                  getCategoryCount(category);

                return (
                  <motion.div
                    key={category._id}
                    variants={reveal}
                    whileHover={{
                      y: -8,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <Link
                      to={`/experiences?category=${category.slug}`}
                      className="group relative block min-h-[240px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-900 shadow-sm transition-all duration-500 hover:border-slate-300 hover:shadow-xl sm:min-h-[270px]"
                    >
                      {categoryImage ? (
                        <img
                          src={categoryImage}
                          alt={category.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                          <Compass className="h-10 w-10 text-slate-300" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />

                      <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/20" />

                      <div className="relative flex h-full min-h-[240px] flex-col justify-between p-5 sm:min-h-[270px] sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                            <Compass className="h-5 w-5" />
                          </div>

                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                            {category.name}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-white/70">
                            {experienceCount} experiences
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-[1.5rem] bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <Compass className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                No categories available yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f3f3f3] py-28 sm:py-36">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-slate-200/60 blur-3xl" />

        <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: '-100px',
            }}
            variants={reveal}
            className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 sm:text-xs">
                <TrendingUp className="h-4 w-4" />
                Trending now
              </div>

              <h2 className="font-display text-4xl font-black leading-tight tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Experiences people love.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Handpicked adventures that are getting people
                excited to pack their bags.
              </p>
            </div>

            <Link
              to="/experiences"
              className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-900"
            >
              See all experiences

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {loading ? (
            <SkeletonGrid count={3} />
          ) : featured.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: '-80px',
              }}
              className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
            >
              {featured.slice(0, 6).map((experience, index) => (
                <motion.div
                  key={experience._id}
                  variants={reveal}
                  whileHover={{
                    y: -9,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 240,
                    damping: 20,
                  }}
                >
                  <ExperienceCard
                    experience={experience}
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <Compass className="h-6 w-6 text-slate-300" />
              </div>

              <h3 className="font-bold text-slate-900">
                New adventures are coming.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We're curating something special. Check back
                soon for new experiences.
              </p>

              <Link
                to="/experiences"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Browse experiences

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-28 sm:py-36">
        <div className="absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-slate-100 blur-3xl" />

        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: '-100px',
            }}
            variants={stagger}
            className="relative grid gap-14 lg:grid-cols-[0.75fr_1.25fr]"
          >
            <motion.div variants={reveal}>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-slate-900" />

                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 sm:text-xs">
                  Why Wanderlust
                </p>
              </div>

              <h2 className="font-display text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                Designed for

                <span className="text-slate-400">
                  {' '}
                  curious people.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                Less planning. More discovering. Everything you
                need to turn curiosity into a real-world
                adventure.
              </p>

              <Link
                to="/about"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-slate-800"
              >
                Learn about Wanderlust

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              variants={reveal}
              className="divide-y divide-slate-200 border-y border-slate-200"
            >
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.number}
                    whileHover={{
                      x: 8,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    className="group grid gap-5 py-8 sm:grid-cols-[60px_60px_1fr] sm:items-start"
                  >
                    <span className="text-xs font-bold tracking-[0.2em] text-slate-300 transition-colors group-hover:text-slate-700">
                      {item.number}
                    </span>

                    <motion.div
                      whileHover={{
                        scale: 1.08,
                        rotate: 5,
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white group-hover:shadow-lg"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#080808] py-24 sm:py-32">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: '-100px',
            }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,.35)]"
          >
            <img
              src="https://images.pexels.com/photos/12874617/pexels-photo-12874617.jpeg?auto=compress&cs=tinysrgb&w=2000"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-900 to-black" />

            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
                backgroundSize: '55px 55px',
              }}
            />

            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-[100px]"
            />

            <motion.div
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-300/10 blur-[100px]"
            />

            <div className="relative grid gap-14 px-7 py-16 sm:px-12 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:px-20 lg:py-24">
              <div>
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl sm:text-xs"
                >
                  <Compass className="h-4 w-4" />

                  Your next story
                </motion.div>

                <h2 className="font-display max-w-3xl text-4xl font-black leading-[0.93] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                  Somewhere out there,

                  <span className="block text-slate-300">
                    your next adventure is waiting.
                  </span>
                </h2>

                <p className="mt-7 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                  Stop scrolling. Start exploring. Find an
                  experience that gives your next trip a story
                  worth telling.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/experiences"
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100"
                  >
                    Explore now

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                  >
                    Join Wanderlust
                  </Link>
                </div>
              </div>

              <div className="hidden items-end justify-end lg:flex">
                <motion.div
                  whileHover={{
                    y: -8,
                    rotate: -1,
                  }}
                  className="relative w-72 overflow-hidden rounded-[1.5rem] border border-white/15 bg-black/20 p-6 shadow-2xl backdrop-blur-xl"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

                  <div className="relative mb-7 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                      <Check className="h-5 w-5 text-slate-900" />
                    </div>

                    <div>
                      <p className="text-2xl font-black text-white">
                        4.9
                      </p>

                      <p className="text-xs text-white/50">
                        Average traveler rating
                      </p>
                    </div>
                  </div>

                  <div className="relative space-y-3">
                    {[
                      'Curated experiences',
                      'Real traveler reviews',
                      'Trusted hosts',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-sm text-white/80"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                          <Check className="h-3 w-3 text-white" />
                        </span>

                        {item}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-5 px-5 py-10 text-center sm:flex-row sm:px-8 sm:text-left lg:px-12">
          <div>
            <p className="font-bold tracking-tight text-slate-950">
              Ready to see the world differently?
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your next unforgettable experience is one click
              away.
            </p>
          </div>

          <Link
            to="/experiences"
            className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-lg"
          >
            Start exploring

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;