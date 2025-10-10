import { useState, useEffect } from 'react';
import { Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AccessibilityPanel from './AccessibilityPanel';

const AccessibilityButton = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Verificar se deve mostrar o botão baseado na rota atual
  useEffect(() => {
    const checkRoute = () => {
      const currentPath = window.location.pathname;
      const hiddenRoutes = ['/login', '/cadastro', '/admin-login', '/cadastro-orgao'];
      setIsVisible(!hiddenRoutes.includes(currentPath));
    };

    checkRoute();
    
    // Escutar mudanças de rota
    const handlePopState = () => checkRoute();
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt + A para abrir/fechar painel de acessibilidade
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setShowPanel(prev => !prev);
      }
      
      // Alt + C para alto contraste
      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        const body = document.body;
        body.classList.toggle('high-contrast');
      }
      
      // Alt + D para modo escuro
      if (event.altKey && event.key === 'd') {
        event.preventDefault();
        const body = document.body;
        body.classList.toggle('dark-mode');
      }
      
      // Ctrl + Plus para aumentar fonte
      if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        const root = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(root).fontSize);
        root.style.fontSize = `${Math.min(currentSize + 2, 32)}px`;
      }
      
      // Ctrl + Minus para diminuir fonte
      if (event.ctrlKey && event.key === '-') {
        event.preventDefault();
        const root = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(root).fontSize);
        root.style.fontSize = `${Math.max(currentSize - 2, 12)}px`;
      }
      
      // Escape para fechar painel
      if (event.key === 'Escape' && showPanel) {
        setShowPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPanel]);

  if (!isVisible) return null;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setShowPanel(true)}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 flex items-center justify-center"
              size="icon"
              aria-label="Abrir painel de acessibilidade"
            >
              <Accessibility className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            <p>Acessibilidade (Alt + A)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AccessibilityPanel 
        isVisible={showPanel} 
        onToggle={() => setShowPanel(false)} 
      />
    </>
  );
};

export default AccessibilityButton;

