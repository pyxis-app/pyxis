import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: { unoptimized: true },
  experimental: {
    // Use the Rust-based MDX compiler with GFM (tables, strikethrough, task lists, etc.).
    // This is serializable by Turbopack; the JS remark-gfm plugin is not.
    mdxRs: { mdxType: "gfm" },
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
