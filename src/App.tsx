import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home/Home';
import ProjectDetail from '@/pages/ProjectDetail/ProjectDetail';
import About from '@/pages/About/About';
import Contacts from '@/pages/Contacts/Contacts';
import { PageTransition } from '@/components/PageTransition/PageTransition';

// Импортируем новые страницы для раздела Услуг
import Services from '@/pages/Services/Services';
import BrandIdentity from '@/pages/Services/BrandIdentity';
import Packaging from '@/pages/Services/Packaging';
import UiUx from '@/pages/Services/UiUx';
import MotionDesign from '@/pages/Services/MotionDesign';
import ArtDirection from '@/pages/Services/ArtDirection';

function App() {
  const location = useLocation();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/projects/:slug" element={<PageTransition><ProjectDetail /></PageTransition>} />
          
          {/* Новые маршруты для услуг */}
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/services/brand-identity" element={<PageTransition><BrandIdentity /></PageTransition>} />
          <Route path="/services/packaging" element={<PageTransition><Packaging /></PageTransition>} />
          <Route path="/services/ui-ux" element={<PageTransition><UiUx /></PageTransition>} />
          <Route path="/services/motion-design" element={<PageTransition><MotionDesign /></PageTransition>} />
          <Route path="/services/art-direction" element={<PageTransition><ArtDirection /></PageTransition>} />

          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contacts" element={<PageTransition><Contacts /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;
