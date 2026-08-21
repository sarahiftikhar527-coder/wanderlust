import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventClose = false,
}) => {
  const titleId = useId();
  const modalRef = useRef(null);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        closeOnEscape &&
        !preventClose
      ) {
        event.preventDefault();
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const frame = requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOpen,
    onClose,
    closeOnEscape,
    preventClose,
  ]);

  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (closeOnBackdrop && !preventClose) {
      onClose?.();
    }
  };

  const handleClose = () => {
    if (!preventClose) {
      onClose?.();
    }
  };

  const modalSize = sizes[size] || sizes.md;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
          role="presentation"
          onMouseDown={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 24,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 16,
            }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 30,
              mass: 0.8,
            }}
            className={`relative flex w-full ${modalSize} max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)] outline-none sm:rounded-3xl`}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            {title && (
              <div className="relative flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0 pr-4">
                  <h2
                    id={titleId}
                    className="truncate font-display text-lg font-bold tracking-tight text-gray-900 sm:text-xl"
                  >
                    {title}
                  </h2>
                </div>

                {showCloseButton && (
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    whileHover={{
                      scale: 1.06,
                      rotate: 3,
                    }}
                    whileTap={{
                      scale: 0.94,
                    }}
                    disabled={preventClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
            )}

            {!title && showCloseButton && (
              <motion.button
                type="button"
                onClick={handleClose}
                whileHover={{
                  scale: 1.06,
                  rotate: 3,
                }}
                whileTap={{
                  scale: 0.94,
                }}
                disabled={preventClose}
                className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/95 text-gray-500 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}

            <div
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${
                title
                  ? "max-h-[calc(92vh-73px)]"
                  : "max-h-[92vh]"
              }`}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay: 0.05,
                }}
                className="p-5 sm:p-6"
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;