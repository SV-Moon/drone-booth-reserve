import { useEffect, useState } from 'react'
import BookingPage from './pages/BookingPage'
import AdminPage from './pages/AdminPage'

// GitHub Pages 같은 정적 호스팅에서는 새로고침 시 서버 라우팅이 없으므로,
// 별도 라이브러리 없이 해시(#admin)로 화면을 전환한다.
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return hash
}

export default function App() {
  const hash = useHashRoute()

  return hash === '#admin' ? <AdminPage /> : <BookingPage />
}
