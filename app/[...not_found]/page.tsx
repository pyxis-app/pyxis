import { notFound } from "next/navigation";

// Lowest-priority catch-all. Every defined route (/, /research, /b/[id],
// /api/*, …) out-prioritizes this, so only genuinely unmatched URLs land here.
// In this Next version the root `app/not-found.tsx` doesn't reliably catch
// unmatched URLs on its own, so we funnel them through notFound() — which
// renders `app/not-found.tsx` with a proper 404 status.
export default function CatchAllNotFound(): never {
  notFound();
}
