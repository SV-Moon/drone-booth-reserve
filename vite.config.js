import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 프로젝트 페이지는 https://<user>.github.io/<repo>/ 형태의 경로를 쓰므로
// base 경로가 '/'가 아니라 '/<repo>/'여야 정적 자산이 정상적으로 로드됩니다.
// GitHub Actions 워크플로우에서 VITE_BASE_PATH 환경변수로 저장소 이름을 주입합니다.
// 커스텀 도메인을 쓰거나 로컬 개발 시에는 기본값 '/'가 사용됩니다.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
