import { useState, useEffect } from 'react';
import { Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AccessibilityPanel from './AccessibilityPanel';

// Constantes para as classes CSS
const ACCESSIBILITY_BUTTON_CLASS = "fixed right-4 top-1/3 z-30 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 flex items-center justify-center";

const AccessibilityButton = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Função para aplicar/remover classes no body
  const applyBodyClass = (className, shouldApply) => {
    const body = document.body;
    if (shouldApply) {
      body.classList.add(className);
    } else {
      body.classList.remove(className);
    }
  };

  // Carregar configurações iniciais e aplicar classes
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
    applyBodyClass('dark-mode', savedSettings.darkMode);
    applyBodyClass('high-contrast', savedSettings.highContrast);
    if (savedSettings.fontSize) {
      document.documentElement.style.fontSize = `${savedSettings.fontSize}%`;
    }
  }, []);

  // Verificar se deve mostrar o botão baseado na rota atual
  useEffect(() => {
    const checkRoute = () => {
      const currentPath = window.location.pathname;
      const hiddenRoutes = ['/login', '/cadastro', '/admin-login', '/cadastro-orgao'];
      setIsVisible(!hiddenRoutes.includes(currentPath));
    };

    checkRoute();
    
    // Escutar mudanças de rota (melhorar para usar um listener de router se possível)
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
        return;
      }
      
      // Escape para fechar painel
      if (event.key === 'Escape' && showPanel) {
        setShowPanel(false);
        return;
      }
      
      // Atalhos de teclado para as funções principais (se o painel estiver fechado)
      if (!showPanel) {
        // Alt + C para alto contraste
        if (event.altKey && event.key === 'c') {
          event.preventDefault();
          const body = document.body;
          body.classList.toggle('high-contrast');
          // Atualizar localStorage
          const isHighContrast = body.classList.contains('high-contrast');
          const savedSettings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
          localStorage.setItem('accessibilitySettings', JSON.stringify({...savedSettings, highContrast: isHighContrast}));
          return;
        }
        
        // Alt + D para modo escuro
        if (event.altKey && event.key === 'd') {
          event.preventDefault();
          const body = document.body;
          body.classList.toggle('dark-mode');
          // Atualizar localStorage
          const isDarkMode = body.classList.contains('dark-mode');
          const savedSettings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
          localStorage.setItem('accessibilitySettings', JSON.stringify({...savedSettings, darkMode: isDarkMode}));
          return;
        }
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
              className={ACCESSIBILITY_BUTTON_CLASS}
              size="icon"
              aria-label="Abrir painel de acessibilidade. Atalho: Alt + A"
            >
              <Accessibility className="h-7 w-7" /> {/* Aumentado o tamanho do ícone */}
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
