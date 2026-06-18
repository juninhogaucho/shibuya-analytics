import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/landing/Preloader';
import { AppRoutes } from './app/routes';

const BOOT_SEEN_STORAGE_KEY = 'shibuya_boot_seen'

function shouldShowInitialPreloader(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const params = new URLSearchParams(window.location.search)

  if (params.get('skipBoot') === '1' || params.get('demo') === 'instant') {
    return false
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return false
  }

  try {
    return window.sessionStorage.getItem(BOOT_SEEN_STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(() => shouldShowInitialPreloader());

  useEffect(() => {
    if (loading) {
      return
    }

    try {
      window.sessionStorage.setItem(BOOT_SEEN_STORAGE_KEY, '1')
    } catch {
      // Session storage can be unavailable in hardened browsers; the app should still render.
    }
  }, [loading])

  return (
    <>
      <AppRoutes />

      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
    </>
  );
};

export default App;
