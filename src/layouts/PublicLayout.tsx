import { Outlet } from 'react-router-dom'
import { SiteNav } from './sections/SiteNav'
import { SiteFooter } from './sections/SiteFooter'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <SiteNav />
      <main style={{ paddingTop: '4rem' }}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
