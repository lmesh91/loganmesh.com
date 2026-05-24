import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeTerminalColors from "./src/lib/rehypeTerminalColors.mjs";

export default defineConfig({
  site: "https://loganmesh.com",
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeTerminalColors],
  },
});
