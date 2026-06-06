import { defineConfig } from '@playwright/test';
import 'dotenv/config';

const PORT = 3333;

export default defineConfig({
  testDir: './',
  fullyParallel: false,
  // workers: 1 evita race conditions entre tests que tocan los mismos asientos seedeados
  workers: 1,
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `PORT=${PORT} pnpm run start`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
