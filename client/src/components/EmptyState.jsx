import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

const EmptyState = ({
  icon: Icon = Compass,
  title = "Nothing here yet",
  message = "There is no data available at the moment.",
  actionLabel,
  actionTo,
}) => {
  const hasAction = actionLabel && actionTo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex min-h-[300px] w-full flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[360px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.08,
          duration: 0.5,
          type: "spring",
          stiffness: 170,
          damping: 17,
        }}
        whileHover={{
          scale: 1.05,
          rotate: 2,
        }}
        className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-[26px] bg-primary-50 shadow-sm sm:h-24 sm:w-24"
      >
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.12, 0.35],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-[26px] bg-primary-100"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-2 rounded-[21px] border border-primary-200/60"
        />

        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm backdrop-blur-sm">
          <Icon
            className="h-7 w-7 text-primary-500 sm:h-8 sm:w-8"
            strokeWidth={1.8}
          />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.16,
          duration: 0.4,
        }}
        className="mb-2 font-display text-lg font-bold tracking-tight text-gray-900 sm:text-xl"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.21,
          duration: 0.4,
        }}
        className="mb-7 max-w-md text-sm leading-7 text-gray-500 sm:text-base"
      >
        {message}
      </motion.p>

      {hasAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.27,
            duration: 0.4,
          }}
        >
          <Link
            to={actionTo}
            className="btn-primary group inline-flex items-center gap-2"
          >
            <span>{actionLabel}</span>

            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </motion.span>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;