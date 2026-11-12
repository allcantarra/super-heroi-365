import { defineConfig } from '@playwright/test'

// Roteiro de ponta a ponta contra o build de produção, em tela de iPhone (375 px).
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4365', viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true },
  webServer: { command: 'npm run build && npx vite preview --port 4365 --strictPort', url: 'http://localhost:4365', reuseExistingServer: true, timeout: 120000 },
})
