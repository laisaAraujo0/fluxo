import { useState, useEffect } from 'react';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

const LoadingScreen = ({ 
  isVisible = true, 
  message = 'Carregando...', 
  progress = null,
  type = 'default', // 'default', 'map', 'data', 'error'
  onComplete = null,
  duration = 3000
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Definir etapas de carregamento baseadas no tipo
  useEffect(() => {
    const steps = {
      default: [
        { label: 'Inicializando aplicação...', duration: 800 },
        { label: 'Carregando recursos...', duration: 1000 },
        { label: 'Preparando interface...', duration: 700 },
        { label: 'Finalizando...', duration: 500 }
      ],
      map: [
        { label: 'Carregando mapa...', duration: 1000 },
        { label: 'Obtendo localização...', duration: 800 },
        { label: 'Buscando eventos próximos...', duration: 900 },
        { label: 'Renderizando marcadores...', duration: 600 },
        { label: 'Aplicando filtros...', duration: 400 }
      ],
      data: [
        { label: 'Conectando ao servidor...', duration: 600 },
        { label: 'Autenticando usuário...', duration: 800 },
        { label: 'Carregando dados...', duration: 1200 },
        { label: 'Processando informações...', duration: 700 },
        { label: 'Preparando visualização...', duration: 500 }
      ],
      error: [
        { label: 'Tentando reconectar...', duration: 1000 },
        { label: 'Verificando conectividade...', duration: 800 },
        { label: 'Recarregando recursos...', duration: 1000 }
      ]
    };
    
    setLoadingSteps(steps[type] || steps.default);
  }, [type]);

  // Simular progresso automático
  useEffect(() => {
    if (!isVisible || loadingSteps.length === 0) return;

    let totalDuration = 0;
    let currentTime = 0;
    
    const totalStepDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    
    const interval = setInterval(() => {
      currentTime += 50;
      const progressPercent = Math.min((currentTime / totalStepDuration) * 100, 100);
      setCurrentProgress(progressPercent);
      
      // Atualizar etapa atual
      let accumulatedTime = 0;
      for (let i = 0; i < loadingSteps.length; i++) {
        accumulatedTime += loadingSteps[i].duration;
        if (currentTime <= accumulatedTime) {
          setCurrentStep(i);
          break;
        }
      }
      
      // Completar carregamento
      if (currentTime >= totalStepDuration) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, loadingSteps, onComplete]);

  // Usar progresso externo se fornecido
  const displayProgress = progress !== null ? progress : currentProgress;
  const displayMessage = loadingSteps[currentStep]?.label || message;

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'map':
        return <MapPin className="h-8 w-8 text-primary animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-destructive animate-pulse" />;
      case 'data':
        return <CheckCircle className="h-8 w-8 text-green-500 animate-pulse" />;
      default:
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-destructive/5';
      case 'map':
        return 'bg-blue-50 dark:bg-blue-950/20';
      case 'data':
        return 'bg-green-50 dark:bg-green-950/20';
      default:
        return 'bg-background/95';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${getBackgroundColor()} backdrop-blur-sm`}>
      <Card className="w-full max-w-md mx-4 shadow-lg border-0">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo e Ícone */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-10 w-10 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  Mapa da Realidade
                </span>
              </div>
              
              <div className="flex items-center justify-center">
                {getIcon()}
              </div>
            </div>

            {/* Mensagem de Status */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {displayMessage}
              </h3>
              
              {type === 'error' && (
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto tentamos restabelecer a conexão...
                </p>
              )}
            </div>

            {/* Barra de Progresso */}
            <div className="w-full space-y-2">
              <Progress 
                value={displayProgress} 
                className="w-full h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{Math.round(displayProgress)}%</span>
              </div>
            </div>

            {/* Etapas de Carregamento */}
            {loadingSteps.length > 0 && (
              <div className="w-full space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  Etapa {currentStep + 1} de {loadingSteps.length}
                </div>
                
                <div className="flex justify-center space-x-1">
                  {loadingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index <= currentStep 
                          ? 'bg-primary' 
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dicas ou Informações Adicionais */}
            {type === 'map' && (
              <div className="text-center text-xs text-muted-foreground">
                💡 Dica: Permita o acesso à localização para uma melhor experiência
              </div>
            )}
            
            {type === 'data' && (
              <div className="text-center text-xs text-muted-foreground">
                🔒 Seus dados estão seguros e protegidos
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Animação de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
