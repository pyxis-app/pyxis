export type DocLink = { title: string; href: string; external?: boolean };
export type DocGroup = { label: string; items: DocLink[] };

export const DOC_NAV: DocGroup[] = [
  {
    label: "Get started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    label: "How it works",
    items: [
      { title: "The five agents", href: "/docs/agents" },
      { title: "How a briefing is built", href: "/docs/how-briefings-work" },
      { title: "Data sources & freshness", href: "/docs/data-sources" },
      { title: "Sentiment methodology", href: "/docs/sentiment" },
    ],
  },
  {
    label: "Reference",
    items: [
      { title: "What Pyxis can & can’t do", href: "/docs/capabilities" },
      { title: "FAQ", href: "/docs/faq" },
      { title: "Changelog", href: "https://usepyxis.com/changelog", external: true },
    ],
  },
];

export function isActiveDoc(href: string, pathname: string): boolean {
  if (href === "/docs") return pathname === "/docs";
  return pathname === href || pathname.startsWith(href + "/");
}
