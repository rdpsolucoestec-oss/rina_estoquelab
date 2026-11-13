const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
/** Site 100% estático (exportado) para rodar no GitHub Pages. */
export default {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: base,
  assetPrefix: base || undefined,
  images: { unoptimized: true },
};
