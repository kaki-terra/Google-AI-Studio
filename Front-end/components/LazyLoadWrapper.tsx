import React, { useState, useRef, useEffect, Suspense } from 'react';
import SectionPlaceholder from './SectionPlaceholder';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  placeholder?: React.ReactElement;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({ children, placeholder }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '0px 0px 200px 0px', // Carrega 200px antes de entrar na tela
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={placeholder || <SectionPlaceholder />}>
          {children}
        </Suspense>
      ) : (
        placeholder || <SectionPlaceholder />
      )}
    </div>
  );
};

export default LazyLoadWrapper;
