import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1));

      if (element) {
        requestAnimationFrame(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });

        return;
      }
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    };

    const frame = requestAnimationFrame(scrollToTop);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;