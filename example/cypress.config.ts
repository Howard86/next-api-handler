import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'd5185e',
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
  video: false,
});
