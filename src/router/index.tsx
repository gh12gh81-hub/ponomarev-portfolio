import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home/Home';
import ProjectDetail from '@/pages/ProjectDetail/ProjectDetail';
import About from '@/pages/About/About';
import Contacts from '@/pages/Contacts/Contacts';
import { PageTransition } from '@/components/PageTransition/PageTransition';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<PageTransition><Home /></PageTransition>} 
      />
      <Route 
        path="/projects/:slug" 
        element={<PageTransition><ProjectDetail /></PageTransition>} 
      />
      <Route 
        path="/about" 
        element={<PageTransition><About /></PageTransition>} 
      />
      <Route 
        path="/contacts" 
        element={<PageTransition><Contacts /></PageTransition>} 
      />
    </Routes>
  );
};
