"use client";

import { useEffect, useState } from "react";

/**
 * Floating "back to top" control. Hidden until the page is scrolled past a
 * threshold (so it only appears once a briefing is long enough to need it),
 * then scrolls the window smoothly back to the top. Pages here use window
 * scroll, not a nested overflow container, so window.scrollTo is correct.
 */
export function BackToTop({ threshold = 600 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <button
      type="button"
      aria-label="back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 font-mono text-[12px] flex items-center gap-2 px-3.5 py-2.5 rounded-lg border transition-all duration-200"
      style={{
        background: "rgba(11,17,25,0.85)",
        borderColor: "var(--accent)",
        color: "var(--accent)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 0 1px rgba(91,143,255,0.10), 0 10px 30px -10px rgba(0,0,0,0.7)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <span className="text-[14px] leading-none">↑</span>
      top
    </button>
  );
}
