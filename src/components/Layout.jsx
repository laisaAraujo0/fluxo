import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AccessibilityButton from './AccessibilityButton';
import Breadcrumbs from './Breadcrumbs';

const Layout = () => {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      
      <main ref={mainRef} className="grow overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
      
      <Footer />
      
      {/* Botão de Acessibilidade */}
      <AccessibilityButton />
    </div>
  );
};

export default Layout;
