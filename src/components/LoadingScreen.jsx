const LoadingScreen = ({ isVisible = true, message = 'Carregando' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-6">
        {/* Círculo duplo futurista */}
        <div className="relative w-20 h-20">
          {/* Círculo externo gradiente girando */}
          <div className="absolute inset-0 rounded-full border-4 border-t-gradient animate-spin-slow" style={{ borderColor: 'transparent transparent #4b5563 #4b5563' }} />
          
          {/* Círculo interno menor girando inverso */}
          <div className="absolute inset-2 rounded-full border-4 border-t-gradient animate-spin-slow-reverse" style={{ borderColor: 'transparent #000000 #000000 transparent' }} />
        </div>

        {/* Mensagem */}
        <span className="text-lg font-semibold text-foreground">{message}</span>
      </div>

      {/* Animações customizadas */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
