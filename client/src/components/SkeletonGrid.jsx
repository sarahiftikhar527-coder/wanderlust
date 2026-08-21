import { motion } from 'framer-motion';

const SkeletonBlock = ({
  className = '',
  delay = 0,
  rounded = true,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 ${
        rounded ? 'rounded-lg' : ''
      } ${className}`}
    >
      <motion.div
        initial={{
          x: '-120%',
        }}
        animate={{
          x: '220%',
        }}
        transition={{
          duration: 1.7,
          repeat: Infinity,
          repeatDelay: 0.15,
          ease: 'linear',
          delay,
        }}
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-18deg]"
      />

      <motion.div
        animate={{
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
        className="absolute inset-0 bg-gradient-to-br from-slate-100/20 via-blue-100/10 to-indigo-100/20"
      />
    </div>
  );
};

const SkeletonCard = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="relative h-60 overflow-hidden bg-slate-100 sm:h-64">
        <SkeletonBlock
          className="absolute inset-0 h-full w-full"
          rounded={false}
          delay={index * 0.04}
        />

        <div className="absolute left-4 top-4">
          <SkeletonBlock
            className="h-7 w-24 rounded-full"
            delay={0.08}
          />
        </div>

        <div className="absolute right-4 top-4">
          <SkeletonBlock
            className="h-10 w-10 rounded-full"
            delay={0.14}
          />
        </div>

        <div className="absolute bottom-4 left-4">
          <SkeletonBlock
            className="h-7 w-20 rounded-full"
            delay={0.2}
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <SkeletonBlock
            className="h-4 w-4 rounded-full"
            delay={0.12}
          />

          <SkeletonBlock
            className="h-3.5 w-32"
            delay={0.16}
          />
        </div>

        <div className="space-y-2">
          <SkeletonBlock
            className="h-5 w-full"
            delay={0.22}
          />

          <SkeletonBlock
            className="h-5 w-4/5"
            delay={0.28}
          />
        </div>

        <div className="flex items-center gap-2">
          <SkeletonBlock
            className="h-4 w-4 rounded-full"
            delay={0.32}
          />

          <SkeletonBlock
            className="h-3.5 w-28"
            delay={0.36}
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBlock
                className="h-3 w-20"
                delay={0.42}
              />

              <SkeletonBlock
                className="h-6 w-24"
                delay={0.48}
              />
            </div>

            <SkeletonBlock
              className="mb-1 h-3 w-14"
              delay={0.54}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonGrid = ({
  count = 6,
  className = '',
}) => {
  const parsedCount = Number(count);

  const safeCount =
    Number.isFinite(parsedCount) && parsedCount > 0
      ? Math.min(Math.floor(parsedCount), 24)
      : 6;

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {Array.from(
        { length: safeCount },
        (_, index) => (
          <SkeletonCard
            key={`skeleton-card-${index}`}
            index={index}
          />
        )
      )}
    </motion.div>
  );
};

const SkeletonList = ({
  count = 5,
  className = '',
}) => {
  const parsedCount = Number(count);

  const safeCount =
    Number.isFinite(parsedCount) && parsedCount > 0
      ? Math.min(Math.floor(parsedCount), 20)
      : 5;

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
      className={`space-y-4 ${className}`}
    >
      {Array.from(
        { length: safeCount },
        (_, index) => (
          <motion.div
            key={`skeleton-list-${index}`}
            initial={{
              opacity: 0,
              x: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.35,
              delay: index * 0.05,
            }}
            className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <SkeletonBlock
              className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24"
              delay={index * 0.06}
            />

            <div className="min-w-0 flex-1 space-y-3 py-1">
              <SkeletonBlock
                className="h-3 w-24"
                delay={0.1}
              />

              <SkeletonBlock
                className="h-5 w-4/5"
                delay={0.16}
              />

              <SkeletonBlock
                className="h-3.5 w-2/3"
                delay={0.22}
              />

              <SkeletonBlock
                className="h-3 w-20"
                delay={0.28}
              />
            </div>
          </motion.div>
        )
      )}
    </motion.div>
  );
};

const SkeletonDetails = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.4,
      }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonBlock
          className="h-[360px] w-full rounded-3xl sm:h-[460px]"
          delay={0}
        />

        <div className="space-y-5 py-2">
          <SkeletonBlock
            className="h-7 w-28 rounded-full"
            delay={0.1}
          />

          <div className="space-y-3">
            <SkeletonBlock
              className="h-9 w-full"
              delay={0.16}
            />

            <SkeletonBlock
              className="h-9 w-4/5"
              delay={0.22}
            />
          </div>

          <div className="flex gap-3">
            <SkeletonBlock
              className="h-5 w-24"
              delay={0.28}
            />

            <SkeletonBlock
              className="h-5 w-28"
              delay={0.34}
            />
          </div>

          <div className="space-y-3 pt-4">
            <SkeletonBlock
              className="h-4 w-full"
              delay={0.4}
            />

            <SkeletonBlock
              className="h-4 w-full"
              delay={0.46}
            />

            <SkeletonBlock
              className="h-4 w-3/4"
              delay={0.52}
            />
          </div>

          <div className="flex gap-3 pt-5">
            <SkeletonBlock
              className="h-12 w-36 rounded-xl"
              delay={0.58}
            />

            <SkeletonBlock
              className="h-12 w-12 rounded-xl"
              delay={0.64}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export {
  SkeletonBlock,
  SkeletonCard,
  SkeletonList,
  SkeletonDetails,
};

export default SkeletonGrid;