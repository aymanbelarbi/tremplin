import { Outlet, useLocation } from 'react-router-dom'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/ui/PageTransition'
import { AnimatePresence } from 'framer-motion'

export default function PublicLayout() {
  const location = useLocation()
  
  return (
    <div className="relative flex min-h-screen flex-col bg-paper text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-noise opacity-60 mix-blend-multiply"
      />
      <PublicNavbar />
      <main className="relative flex-1 pt-6">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
