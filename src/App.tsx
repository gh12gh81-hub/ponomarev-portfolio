import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home/Home';
import ProjectDetail from '@/pages/ProjectDetail/ProjectDetail';
import About from '@/pages/About/About';
import Contacts from '@/pages/Contacts/Contacts';
import Services from '@/pages/Services/Services';
import BrandIdentity from '@/pages/Services/BrandIdentity';
import Packaging from '@/pages/Services/Packaging';
import UiUx from '@/pages/Services/UiUx';
import MotionDesign from '@/pages/Services/MotionDesign';
import ArtDirection from '@/pages/Services/ArtDirection';
import NotFound from '@/pages/NotFound/NotFound';
import { PageTransition } from '@/components/PageTransition/PageTransition';

const Admin = lazy(() => import('@/pages/Admin/Admin'));

function App() {
  const location = useLocation();

  if (location.pathname.replace(/\/+$/, '') === '/admin-portfolio') {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
        <Routes>
          <Route path="/admin-portfolio" element={<Admin />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/projects/:slug" element={<PageTransition><ProjectDetail /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/services/brand-identity" element={<PageTransition><BrandIdentity /></PageTransition>} />
          <Route path="/services/packaging" element={<PageTransition><Packaging /></PageTransition>} />
          <Route path="/services/ui-ux" element={<PageTransition><UiUx /></PageTransition>} />
          <Route path="/services/motion-design" element={<PageTransition><MotionDesign /></PageTransition>} />
          <Route path="/services/art-direction" element={<PageTransition><ArtDirection /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contacts" element={<PageTransition><Contacts /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;
