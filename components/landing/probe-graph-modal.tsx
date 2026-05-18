"use client";

import { ProbeNodeGraph } from "@/components/shared/probe-node-graph";

/**
 * Modal wrapper that displays the shared `ProbeNodeGraph` in `demo` mode.
 *
 * Implementation choice: rather than wrap the graph in an outer animation
 * loop, we added a `demo?: boolean` prop to `ProbeNodeGraph` itself. When
 * `demo` is true the component synthesizes its own preset phase cycle on a
 * 2-second timer, so this modal stays trivially thin and the same graph
 * code is exercised on both live sessions and the landing page.
 */
export function ProbeGraphModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="glass-card p-6 max-w-4xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">The Pyxis swarm</h3>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="w-full">
          <ProbeNodeGraph demo />
        </div>
      </div>
    </div>
  );
}
