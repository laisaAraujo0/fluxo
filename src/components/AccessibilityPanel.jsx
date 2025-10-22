import { useState, useEffect } from 'react';
import { 
  Accessibility, Type, Eye, X, Plus, Minus, ZoomIn, ZoomOut, RotateCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const PANEL_WIDTH = "w-72";

const AccessibilityPanel = ({ isVisible, onToggle }) => {
  const [fontSize, setFontSize] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
    setFontSize(saved.fontSize || 100);
    setZoom(saved.zoom || 100);
    setContrast(saved.contrast || 100);
    setDarkMode(saved.darkMode || false);
    setHighContrast(saved.highContrast || false);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.style.fontSize = `${fontSize}%`;
    body.style.zoom = `${zoom}%`;
    body.style.filter = `contrast(${contrast}%)`;
    darkMode ? body.classList.add('dark-mode') : body.classList.remove('dark-mode');
    highContrast ? body.classList.add('high-contrast') : body.classList.remove('high-contrast');

    localStorage.setItem('accessibilitySettings', JSON.stringify({ fontSize, zoom, contrast, darkMode, highContrast }));
  }, [fontSize, zoom, contrast, darkMode, highContrast]);

  const resetSettings = () => {
    setFontSize(100);
    setZoom(100);
    setContrast(100);
    setDarkMode(false);
    setHighContrast(false);
    localStorage.removeItem('accessibilitySettings');
    toast.success('Configurações restauradas para o padrão.');
  };

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onToggle();
    if (isVisible) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="dialog"
          aria-label="Painel de acessibilidade"
          className={`fixed right-4 top-1/2 -translate-y-1/2 ${PANEL_WIDTH} bg-white border shadow-2xl z-50 flex flex-col rounded-2xl p-2`}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card className="border-0 flex flex-col bg-gray-50">
            <CardHeader className="bg-gray-800 text-white flex justify-between items-center px-3 py-2 rounded-t-xl">
              <div className="flex items-center gap-2 text-sm">
                <Accessibility className="h-4 w-4 text-blue-400" />
                <span>Acessibilidade</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onToggle} className="text-white hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 text-sm">
              {/* Texto e Zoom */}
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <Type className="h-4 w-4" />
                  <span className="font-medium">Texto e Zoom</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label>Tamanho da Fonte: {fontSize}%</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="sm" onClick={() => setFontSize(Math.max(50, fontSize - 10))}><Minus className="h-3 w-3" /></Button>
                      <Slider value={[fontSize]} onValueChange={v => setFontSize(v[0])} min={50} max={200} step={10} className="flex-1" />
                      <Button variant="outline" size="sm" onClick={() => setFontSize(Math.min(200, fontSize + 10))}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div>
                    <Label>Zoom: {zoom}%</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))}><ZoomOut className="h-3 w-3" /></Button>
                      <Slider value={[zoom]} onValueChange={v => setZoom(v[0])} min={50} max={200} step={10} className="flex-1" />
                      <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}><ZoomIn className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Contraste e Tema */}
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">Contraste e Tema</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Alto Contraste</Label>
                    <Switch checked={highContrast} onCheckedChange={(v) => {
                      setHighContrast(v);
                      toast.info(`Modo de alto contraste ${v ? 'ativado' : 'desativado'}.`);
                    }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Modo Escuro</Label>
                    <Switch checked={darkMode} onCheckedChange={(v) => {
                      setDarkMode(v);
                      toast.info(`Modo escuro ${v ? 'ativado' : 'desativado'}.`);
                    }} />
                  </div>
                  <div>
                    <Label>Contraste: {contrast}%</Label>
                    <Slider value={[contrast]} onValueChange={v => setContrast(v[0])} min={50} max={200} step={10} className="mt-1" />
                  </div>
                </div>
              </section>

              <Separator />

              <div>
                <Button variant="outline" className="w-full flex items-center gap-2" onClick={resetSettings}>
                  <RotateCcw className="h-4 w-4" /> Restaurar Padrões
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccessibilityPanel;
