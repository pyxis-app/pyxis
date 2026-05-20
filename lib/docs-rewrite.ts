const DOCS_HOST = "docs.usepyxis.com";

/**
 * Maps a request on the docs subdomain to the /docs route subtree.
 * Returns the rewrite target pathname, or null when no rewrite applies.
 */
export function docsRewrite(host: string | null | undefined, pathname: string): string | null {
  if (!host) return null;
  const h = host.split(":")[0].toLowerCase();
  if (h !== DOCS_HOST) return null;
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return null;
  if (pathname === "/") return "/docs";
  return "/docs" + pathname;
}
