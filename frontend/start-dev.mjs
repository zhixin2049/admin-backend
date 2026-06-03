import { createServer } from 'vite';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const react = require('./node_modules/@vitejs/plugin-react/dist/index.cjs').default;
import { resolve } from 'path';

const __dirname = 'C:/Users/admin/WorkBuddy/2026-05-20-task-3/React-admin';

const server = await createServer({
  root: __dirname,
  configFile: false,
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  server: {
    port: 3180,
    strictPort: false,
    open: false,
  },
});

await server.listen();
server.printUrls();
