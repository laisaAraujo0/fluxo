import { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, CheckCircle, AlertCircle, Navigation, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { buscarCEP, buscarLocalizacaoAtual, formatarCEP, validarCEP, buscarEventosProximos } from '@/lib/cep';
import { toast } from 'sonner';

const BuscaCEP = ({ onEnderecoSelecionado, showEventosProximos = false }) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState(null);
  const [error, setError] = useState(null);
  const [localizacaoAtual, setLocalizacaoAtual] = useState(null);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [loadingLocalizacao, setLoadingLocalizacao] = useState(false);

  const handleCepChange = async (value) => {
    const cepFormatado = formatarCEP(value);
    setCep(cepFormatado);
    
    // Limpar estados anteriores
    setError(null);
    setEndereco(null);
    
    // Validar CEP
    if (!validarCEP(value)) {
      if (value.replace(/\D/g, '').length === 8) {
        setError('CEP inválido');
      }
      return;
    }
    
    // Buscar CEP
    setLoading(true);
    
    try {
      const resultado = await buscarCEP(value);
      
      if (resultado.success) {
        setEndereco(resultado.data);
        setError(null);
        toast.success('CEP encontrado com sucesso!');
        
        if (onEnderecoSelecionado) {
          onEnderecoSelecionado(resultado.data);
        }
        
        // Buscar eventos próximos se solicitado
        if (showEventosProximos && resultado.data.coordenadas) {
          const eventos = await buscarEventosProximos(resultado.data.coordenadas);
          setEventosProximos(eventos);
        }
      } else {
        setError(resultado.error);
        toast.error(resultado.error);
      }
    } catch (error) {
      setError('Erro ao buscar CEP');
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  };

  const handleObterLocalizacaoAtual = async () => {
    setLoadingLocalizacao(true);
    setError(null);
    
    try {
      const resultado = await buscarLocalizacaoAtual();
      
      if (resultado.success) {
        setLocalizacaoAtual(resultado.data);
        toast.success('Localização obtida com sucesso!');
        
        if (resultado.data.endereco) {
          setEndereco(resultado.data.endereco);
          if (onEnderecoSelecionado) {
            onEnderecoSelecionado(resultado.data.endereco);
          }
        }
        
        // Buscar eventos próximos se solicitado
        if (showEventosProximos) {
          const eventos = await buscarEventosProximos(resultado.data.coordenadas);
          setEventosProximos(eventos);
        }
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoadingLocalizacao(false);
    }
  };

  const limparBusca = () => {
    setCep('');
    setEndereco(null);
    setError(null);
    setLocalizacaoAtual(null);
    setEventosProximos([]);
  };

  return (
    <div className="space-y-4">
      {/* Busca por CEP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca por CEP
          </CardTitle>
          <CardDescription>
            Digite um CEP para obter informações de localização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="00000-000"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                maxLength={9}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {endereco && !loading && <CheckCircle className="h-4 w-4 text-green-500" />}
                {error && !loading && <AlertCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleObterLocalizacaoAtual}
              disabled={loadingLocalizacao}
              className="flex items-center gap-2"
            >
              {loadingLocalizacao ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              Minha Localização
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informações do Endereço */}
      {endereco && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informações do Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CEP</p>
                <p className="text-base font-semibold">{endereco.cep}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                <p className="text-base font-semibold">{endereco.localidade}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="text-base font-semibold">{endereco.uf}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Região</p>
                <Badge variant="secondary">{endereco.regiao}</Badge>
              </div>
            </div>

            {endereco.logradouro && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
                <p className="text-base">{endereco.logradouro}</p>
              </div>
            )}

            {endereco.bairro && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                <p className="text-base">{endereco.bairro}</p>
              </div>
            )}

            {endereco.ddd && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">DDD</p>
                <p className="text-base">({endereco.ddd})</p>
              </div>
            )}

            {endereco.coordenadas && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coordenadas Aproximadas</p>
                <p className="text-sm text-muted-foreground">
                  Lat: {endereco.coordenadas.lat.toFixed(4)}, 
                  Lng: {endereco.coordenadas.lng.toFixed(4)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Localização Atual */}
      {localizacaoAtual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Sua Localização Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coordenadas</p>
                <p className="text-sm">
                  {localizacaoAtual.coordenadas.lat.toFixed(6)}, {localizacaoAtual.coordenadas.lng.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisão</p>
                <p className="text-sm">{Math.round(localizacaoAtual.precisao)}m</p>
              </div>
            </div>

            {localizacaoAtual.endereco && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cidade Próxima</p>
                    <p className="text-base font-semibold">{localizacaoAtual.endereco.localidade}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <p className="text-base font-semibold">{localizacaoAtual.endereco.uf}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Região</p>
                    <Badge variant="secondary">{localizacaoAtual.endereco.regiao}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Distância</p>
                    <p className="text-sm">~{localizacaoAtual.endereco.distancia}km do centro</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Eventos Próximos */}
      {showEventosProximos && eventosProximos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Eventos Próximos
            </CardTitle>
            <CardDescription>
              Eventos reportados na sua região
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventosProximos.map((evento) => (
                <div key={evento.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{evento.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {evento.categoria}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {evento.distancia}km de distância
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão para limpar */}
      {(endereco || localizacaoAtual) && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={limparBusca}>
            Limpar Busca
          </Button>
        </div>
      )}
    </div>
  );
};

export default BuscaCEP;
