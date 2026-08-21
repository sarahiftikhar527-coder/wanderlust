import { useEffect, useRef, useState } from "react";

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const normalizedDelay = Math.max(
      0,
      Number.isFinite(Number(delay))
        ? Number(delay)
        : 300
    );

    const timeoutId = window.setTimeout(() => {
      if (Object.is(previousValueRef.current, value)) {
        return;
      }

      previousValueRef.current = value;
      setDebouncedValue(value);
    }, normalizedDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;