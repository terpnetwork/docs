import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

/** dayjs ships CJS `dayjs.min.js` as "main"; Vite then fails `import dayjs from 'dayjs'`. */
export default defineConfig({
  resolve: {
    alias: [{ find: /^dayjs$/, replacement: path.join(root, 'shims/dayjs.mjs') }],
  },
  optimizeDeps: {
    include: ['mermaid'],
    exclude: ['dayjs'],
  },
})
