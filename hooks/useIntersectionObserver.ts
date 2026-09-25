import { useState, useEffect, RefObject } from 'react';

interface ObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  }: ObserverOptions = {}
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIntersecting(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, threshold, rootMargin, triggerOnce]);

  return isIntersecting;
}

export default useIntersectionObserver;
