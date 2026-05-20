import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: { unoptimized: true },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    // Plugin passed as a string (not an imported JS function) so it is
    // serializable to Turbopack's Rust loader. Enables GFM tables, etc.
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
