import { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Type, 
  Eye, 
  Volume2, 
  VolumeX, 
  Contrast, 
  MousePointer, 
  Keyboard,
  Settings,
  X,
  Plus,
  Minus,
  RotateCcw,
  Palette,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Focus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AccessibilityPanel = ({ isVisible, onToggle }) => {
  // Estados para configurações de acessibilidade
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [largePointer, setLargePointer] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [readingGuide, setReadingGuide] = useState(false);
  const [focusIndicator, setFocusIndicator] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [speechEnabled, setSpeechEnabled] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFontSize(settings.fontSize || 100);
      setContrast(settings.contrast || 100);
      setBrightness(settings.brightness || 100);
      setZoom(settings.zoom || 100);
      setHighContrast(settings.highContrast || false);
      setDarkMode(settings.darkMode || false);
      setLargePointer(settings.largePointer || false);
      setKeyboardNavigation(settings.keyboardNavigation || false);
      setScreenReader(settings.screenReader || false);
      setReducedMotion(settings.reducedMotion || false);
      setColorBlindMode(settings.colorBlindMode || 'none');
      setReadingGuide(settings.readingGuide || false);
      setFocusIndicator(settings.focusIndicator || false);
      setSpeechRate(settings.speechRate || 1);
      setSpeechVolume(settings.speechVolume || 1);
      setSpeechEnabled(settings.speechEnabled || false);
    }
  }, []);

  // Salvar configurações
  const saveSettings = () => {
    const settings = {
      fontSize,
      contrast,
      brightness,
      zoom,
      highContrast,
      darkMode,
      largePointer,
      keyboardNavigation,
      screenReader,
      reducedMotion,
      colorBlindMode,
      readingGuide,
      focusIndicator,
      speechRate,
      speechVolume,
      speechEnabled
    };
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  };

  // Aplicar configurações
  useEffect(() => {
    applyAccessibilitySettings();
    saveSettings();
  }, [
    fontSize, contrast, brightness, zoom, highContrast, darkMode, 
    largePointer, keyboardNavigation, screenReader, reducedMotion, 
    colorBlindMode, readingGuide, focusIndicator
  ]);

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    const body = document.body;

    // Tamanho da fonte
    root.style.fontSize = `${fontSize}%`;

    // Contraste
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Modo escuro
    if (darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }

    // Zoom
    root.style.zoom = `${zoom}%`;

    // Contraste e brilho
    body.style.filter = `contrast(${contrast}%) brightness(${brightness}%)`;

    // Ponteiro grande
    if (largePointer) {
      body.classList.add('large-pointer');
    } else {
      body.classList.remove('large-pointer');
    }

    // Navegação por teclado
    if (keyboardNavigation) {
      body.classList.add('keyboard-navigation');
    } else {
      body.classList.remove('keyboard-navigation');
    }

    // Movimento reduzido
    if (reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }

    // Modo daltônico
    body.className = body.className.replace(/colorblind-\w+/g, '');
    if (colorBlindMode !== 'none') {
      body.classList.add(`colorblind-${colorBlindMode}`);
    }

    // Guia de leitura
    if (readingGuide) {
      body.classList.add('reading-guide');
    } else {
      body.classList.remove('reading-guide');
    }

    // Indicador de foco
    if (focusIndicator) {
      body.classList.add('enhanced-focus');
    } else {
      body.classList.remove('enhanced-focus');
    }
  };

  const resetSettings = () => {
    setFontSize(100);
    setContrast(100);
    setBrightness(100);
    setZoom(100);
    setHighContrast(false);
    setDarkMode(false);
    setLargePointer(false);
    setKeyboardNavigation(false);
    setScreenReader(false);
    setReducedMotion(false);
    setColorBlindMode('none');
    setReadingGuide(false);
    setFocusIndicator(false);
    setSpeechRate(1);
    setSpeechVolume(1);
    setSpeechEnabled(false);
    
    localStorage.removeItem('accessibilitySettings');
    toast.success('Configurações de acessibilidade resetadas');
  };

  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onToggle}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50 overflow-y-auto">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="sticky top-0 bg-background border-b z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Acessibilidade</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Personalize a experiência de navegação
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-4">
            {/* Controles de Texto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <h3 className="font-semibold">Texto e Visualização</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Tamanho da Fonte: {fontSize}%</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFontSize(Math.max(50, fontSize - 10))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      min={50}
                      max={200}
                      step={10}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFontSize(Math.min(200, fontSize + 10))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Zoom da Página: {zoom}%</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <Slider
                      value={[zoom]}
                      onValueChange={(value) => setZoom(value[0])}
                      min={50}
                      max={200}
                      step={10}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Contraste: {contrast}%</Label>
                  <Slider
                    value={[contrast]}
                    onValueChange={(value) => setContrast(value[0])}
                    min={50}
                    max={200}
                    step={10}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Brilho: {brightness}%</Label>
                  <Slider
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    min={50}
                    max={200}
                    step={10}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Controles Visuais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <h3 className="font-semibold">Configurações Visuais</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast">Alto Contraste</Label>
                  <Switch
                    id="high-contrast"
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Modo Escuro</Label>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion">Reduzir Animações</Label>
                  <Switch
                    id="reduced-motion"
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reading-guide">Guia de Leitura</Label>
                  <Switch
                    id="reading-guide"
                    checked={readingGuide}
                    onCheckedChange={setReadingGuide}
                  />
                </div>

                <div>
                  <Label className="text-sm">Filtro para Daltonismo</Label>
                  <Select value={colorBlindMode} onValueChange={setColorBlindMode}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="protanopia">Protanopia</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia</SelectItem>
                      <SelectItem value="achromatopsia">Acromatopsia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Controles de Navegação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                <h3 className="font-semibold">Navegação</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="large-pointer">Ponteiro Grande</Label>
                  <Switch
                    id="large-pointer"
                    checked={largePointer}
                    onCheckedChange={setLargePointer}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-nav">Navegação por Teclado</Label>
                  <Switch
                    id="keyboard-nav"
                    checked={keyboardNavigation}
                    onCheckedChange={setKeyboardNavigation}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-indicator">Indicador de Foco Aprimorado</Label>
                  <Switch
                    id="focus-indicator"
                    checked={focusIndicator}
                    onCheckedChange={setFocusIndicator}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Controles de Áudio */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <h3 className="font-semibold">Síntese de Voz</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speech-enabled">Ativar Síntese de Voz</Label>
                  <Switch
                    id="speech-enabled"
                    checked={speechEnabled}
                    onCheckedChange={setSpeechEnabled}
                  />
                </div>

                {speechEnabled && (
                  <>
                    <div>
                      <Label className="text-sm">Velocidade da Fala: {speechRate.toFixed(1)}x</Label>
                      <Slider
                        value={[speechRate]}
                        onValueChange={(value) => setSpeechRate(value[0])}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Volume: {Math.round(speechVolume * 100)}%</Label>
                      <Slider
                        value={[speechVolume]}
                        onValueChange={(value) => setSpeechVolume(value[0])}
                        min={0}
                        max={1}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => speakText('Teste de síntese de voz ativado')}
                        className="flex-1"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Testar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={stopSpeech}
                        className="flex-1"
                      >
                        <VolumeX className="h-3 w-3 mr-1" />
                        Parar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Atalhos de Teclado */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <h3 className="font-semibold">Atalhos de Teclado</h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Abrir Acessibilidade:</span>
                  <Badge variant="secondary">Alt + A</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Aumentar Fonte:</span>
                  <Badge variant="secondary">Ctrl + +</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Diminuir Fonte:</span>
                  <Badge variant="secondary">Ctrl + -</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Alto Contraste:</span>
                  <Badge variant="secondary">Alt + C</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Modo Escuro:</span>
                  <Badge variant="secondary">Alt + D</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Botão de Reset */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={resetSettings}
                className="w-full flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar Padrões
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                As configurações são salvas automaticamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS Styles */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(200%) !important;
        }
        
        .large-pointer * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="black"/><circle cx="16" cy="16" r="8" fill="white"/></svg>') 16 16, auto !important;
        }
        
        .keyboard-navigation *:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        .enhanced-focus *:focus {
          outline: 4px solid #f59e0b !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.3) !important;
        }
        
        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .reading-guide {
          position: relative;
        }
        
        .reading-guide::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          z-index: 9999;
          pointer-events: none;
          animation: reading-guide 3s ease-in-out infinite;
        }
        
        @keyframes reading-guide {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(50vh); }
        }
        
        .colorblind-protanopia {
          filter: url('#protanopia-filter');
        }
        
        .colorblind-deuteranopia {
          filter: url('#deuteranopia-filter');
        }
        
        .colorblind-tritanopia {
          filter: url('#tritanopia-filter');
        }
        
        .colorblind-achromatopsia {
          filter: grayscale(100%);
        }
      `}</style>

      {/* SVG Filters for Color Blindness */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default AccessibilityPanel;
