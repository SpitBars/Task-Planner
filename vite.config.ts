import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-beautiful-dnd': path.resolve(__dirname, 'src/lib/react-beautiful-dnd.tsx')
    }

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  }
});
