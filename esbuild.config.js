#!/usr/bin/env node

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.jsx"],
    bundle: true,
    outfile: "www/main.js",
    loader: {
      '.js': 'js',
      '.jsx': 'jsx',
      '.png': 'dataurl',
      '.woff2': 'dataurl',
      '.woff': 'dataurl',
      '.css': 'css',
      '.svg': 'dataurl'
    }
  })
  .catch(() => process.exit(1));