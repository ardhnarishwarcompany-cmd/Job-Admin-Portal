import React, { useEffect, useRef, useState } from "react";

const LazyShow = ({ children, placeholderHeight = "240px" }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // loads slightly before entering viewport
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!show) {
    return (
      <div
        ref={ref}
        style={{ height: placeholderHeight }}
        className="w-full bg-slate-100/50 rounded-2xl animate-pulse border border-slate-200"
      />
    );
  }

  return children;
};

export default LazyShow;
