import { Outlet } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'

export function PublicLayout() {
  return (
    <div className="public-layout min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
