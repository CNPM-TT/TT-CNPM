import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Cố định port cho admin
    strictPort: true, // Báo lỗi nếu port bị chiếm
  }
})
