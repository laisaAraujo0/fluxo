import { useState, useEffect } from 'react';
import { MapPin, Save, X, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { validarCEP, formatarCEP, useCEP } from '@/lib/cep';

const LocationPreferences = () => {
  const [cepPadrao, setCepPadrao] = useState('');
  const [cepSalvo, setCepSalvo] = useState('');
  const [loading, setLoading] = useState(false);
  const { endereco, buscar: buscarCEP } = useCEP();

  useEffect(() => {
    // Carregar CEP salvo do localStorage
    const savedCEP = localStorage.getItem('cepPadrao');
    if (savedCEP) {
      setCepSalvo(savedCEP);
      setCepPadrao(formatarCEP(savedCEP));
    }
  }, []);

  useEffect(() => {
    // Buscar informações do CEP quando válido
    if (validarCEP(cepPadrao.replace(/\D/g, ''))) {
      buscarCEP(cepPadrao.replace(/\D/g, ''));
    }
  }, [cepPadrao]);

  const handleSalvarCEP = () => {
    const cepLimpo = cepPadrao.replace(/\D/g, '');
    
    if (!validarCEP(cepLimpo)) {
      toast.error('CEP inválido');
      return;
    }

    setLoading(true);
    
    // Simular salvamento (em produção, salvar no backend)
    setTimeout(() => {
      localStorage.setItem('cepPadrao', cepLimpo);
      setCepSalvo(cepLimpo);
      setLoading(false);
      toast.success('CEP padrão salvo com sucesso!');
    }, 500);
  };

  const handleRemoverCEP = () => {
    localStorage.removeItem('cepPadrao');
    setCepSalvo('');
    setCepPadrao('');
    toast.success('CEP padrão removido');
  };

  const handleCepChange = (value) => {
    const cepFormatado = formatarCEP(value);
    setCepPadrao(cepFormatado);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Preferências de Localização
        </CardTitle>
        <CardDescription>
          Defina um CEP padrão para personalizar sua experiência
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {cepSalvo && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">CEP Padrão Atual</p>
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Ativo
              </Badge>
            </div>
            <p className="text-lg font-bold">{formatarCEP(cepSalvo)}</p>
            
            {endereco && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{endereco.logradouro}</p>
                <p>{endereco.bairro}</p>
                <p>{endereco.localidade} - {endereco.uf}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cepPadrao">
            {cepSalvo ? 'Alterar CEP Padrão' : 'Definir CEP Padrão'}
          </Label>
          <Input
            id="cepPadrao"
            placeholder="00000-000"
            value={cepPadrao}
            onChange={(e) => handleCepChange(e.target.value)}
            maxLength={9}
          />
          <p className="text-xs text-muted-foreground">
            O CEP padrão será usado para filtrar eventos e informações relevantes para sua região
          </p>
        </div>

        {endereco && cepPadrao !== formatarCEP(cepSalvo) && (
          <div className="p-3 bg-primary/10 rounded-lg text-sm">
            <p className="font-medium mb-1">Novo CEP:</p>
            <p>{endereco.localidade} - {endereco.uf}</p>
            <p className="text-muted-foreground">{endereco.logradouro}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSalvarCEP}
            disabled={loading || !validarCEP(cepPadrao.replace(/\D/g, '')) || cepPadrao === formatarCEP(cepSalvo)}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          
          {cepSalvo && (
            <Button
              variant="outline"
              onClick={handleRemoverCEP}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPreferences;

