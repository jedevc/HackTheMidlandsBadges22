import { useState, useCallback, useEffect } from "react";

export default function useBoundingClientRect(elementRef) {
  const [rect, setRect] = useState(null);

  const update = useCallback(() => {
    if (elementRef && elementRef.current) {
      const r = elementRef.current.getBoundingClientRect();
      setRect(r);
    }
  }, [elementRef]);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return rect;
}
