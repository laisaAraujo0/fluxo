import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AccessibilityButton from './AccessibilityButton';
import Breadcrumbs from './Breadcrumbs';

const Layout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      
      <main className="flex-grow">
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
