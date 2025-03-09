import { useEffect, useRef, useState } from "react";

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

export function useIntersectionObserver<T extends Element>({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  once = false,
}: IntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<T | null>(null);
  const frozen = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
      // If we only want to trigger once and already triggered, do nothing
      if (frozen.current) return;

      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);

      // If entry is intersecting and we only want to trigger once, freeze it
      if (once && entry.isIntersecting) {
        frozen.current = true;
      }
    };

    const observer = new IntersectionObserver(updateEntry, {
      root,
      rootMargin,
      threshold,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, once]);

  return { ref, entry, isIntersecting };
}
