/** Canonical path without index.html or a trailing .html, matching Cloudflare pretty URLs. */
export function canonicalPath(pathname: string): string {
  if (pathname === "/index.html" || pathname === "/") return "/";
  if (pathname.endsWith("/index.html")) return pathname.slice(0, -"index.html".length);
  if (pathname.endsWith(".html")) return pathname.slice(0, -".html".length);
  return pathname;
}

export function isCurrent(pathname: string, href: string): boolean {
  const current = canonicalPath(pathname).replace(/\/$/, "") || "/";
  const target = canonicalPath(href).replace(/\/$/, "") || "/";
  return current === target;
}
