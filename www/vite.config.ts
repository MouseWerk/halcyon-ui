import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const reg = path.resolve(import.meta.dirname, "../registry")

export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom", "clsx", "tailwind-merge"],
    alias: [
      { find: /^@\/components\/ui\/(.*)$/, replacement: `${reg}/ui/$1` },
      { find: /^@\/lib\/(.*)$/, replacement: `${reg}/lib/$1` },
      { find: /^@\/hooks\/(.*)$/, replacement: `${reg}/hooks/$1` },
      { find: /^@\/registry\/(.*)$/, replacement: `${reg}/$1` },
      { find: /^@site\/(.*)$/, replacement: path.resolve(import.meta.dirname, "src") + "/$1" },
    ],
  },
  server: { fs: { allow: [".."] } },
})
