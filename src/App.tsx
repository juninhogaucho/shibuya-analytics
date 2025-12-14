import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/landing/Preloader';
import { AppRoutes } from './app/routes';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {!loading && <AppRoutes />}
    </>
  );
};

export default App;