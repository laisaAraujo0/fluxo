import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, MapPin, Navigation, Layers, ZoomIn, ZoomOut } from 'lucide-react';

// Configurar ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para centralizar o mapa
const CentralizarMapa = ({ coordenadas, zoom = 13 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordenadas) {
      map.setView([coordenadas.lat, coordenadas.lng], zoom);
    }
  }, [coordenadas, zoom, map]);
  
  return null;
};

// Componente para controles customizados
const ControlesCustomizados = ({ onZoomIn, onZoomOut, onCentralizar, onCamadas }) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
    if (onZoomIn) onZoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
    if (onZoomOut) onZoomOut();
  };

  const handleCentralizar = () => {
    if (onCentralizar) onCentralizar();
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <div className="flex flex-col bg-white rounded-md shadow-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-none border-b"
            onClick={handleZoomIn}
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-none border-b"
            onClick={handleZoomOut}
            title="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-none border-b"
            onClick={handleCentralizar}
            title="Centralizar na sua localização"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-none"
            onClick={onCamadas}
            title="Alternar camadas"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Ícones personalizados para diferentes categorias
const criarIconeCategoria = (categoria, status) => {
  const cores = {
    'infraestrutura': '#3b82f6',
    'seguranca': '#ef4444',
    'meio-ambiente': '#22c55e',
    'limpeza': '#a855f7',
    'saneamento': '#06b6d4',
    'mobilidade': '#eab308',
    'outros': '#6b7280'
  };

  const coresStatus = {
    'pendente': '#eab308',
    'em_andamento': '#3b82f6',
    'resolvido': '#22c55e',
    'rejeitado': '#ef4444'
  };

  const corCategoria = cores[categoria] || cores.outros;
  const corStatus = coresStatus[status] || coresStatus.pendente;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: ${corCategoria};
        border: 3px solid ${corStatus};
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
        ${status === 'resolvido' ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background-color: #22c55e;
            border: 1px solid white;
            border-radius: 50%;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Ícone para localização atual
const iconeLocalizacaoAtual = L.divIcon({
  className: 'localizacao-atual',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background-color: #3b82f6;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 12px rgba(59, 130, 246, 0.6);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -4px;
        left: -4px;
        width: 24px;
        height: 24px;
        background-color: rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Ícone para CEP pesquisado
const iconeCEP = L.divIcon({
  className: 'cep-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background-color: #f97316;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 12px rgba(249, 115, 22, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
      "></div>
      <div style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 10px;
        height: 10px;
        background-color: #ea580c;
        border: 2px solid white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const MapaAvancado = ({ 
  eventos = [], 
  coordenadasCentralizar = null, 
  localizacaoAtual = null,
  dadosCEP = null,
  onEventoSelecionado = null,
  altura = '600px',
  zoom = 13,
  mostrarRaio = false,
  raioKm = 5,
  onMapaCarregado = null
}) => {
  const [mapaCarregado, setMapaCarregado] = useState(false);
  const [mostrarCamadas, setMostrarCamadas] = useState(false);
  const [tipoMapa, setTipoMapa] = useState('default');
  const mapRef = useRef(null);

  // Coordenadas padrão (São Paulo)
  const coordenadasPadrao = [-23.5505, -46.6333];
  
  // Determinar coordenadas iniciais
  const coordenadasIniciais = coordenadasCentralizar 
    ? [coordenadasCentralizar.lat, coordenadasCentralizar.lng]
    : localizacaoAtual?.coordenadas 
    ? [localizacaoAtual.coordenadas.lat, localizacaoAtual.coordenadas.lng]
    : coordenadasPadrao;

  // Coordenadas para o círculo de raio
  const coordenadasRaio = coordenadasCentralizar || localizacaoAtual?.coordenadas;

  const formatarStatus = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'resolvido': 'Resolvido',
      'rejeitado': 'Rejeitado'
    };
    return statusMap[status] || status;
  };

  const formatarCategoria = (categoria) => {
    const categoriaMap = {
      'infraestrutura': 'Infraestrutura',
      'seguranca': 'Segurança',
      'meio-ambiente': 'Meio Ambiente',
      'limpeza': 'Limpeza',
      'saneamento': 'Saneamento',
      'mobilidade': 'Mobilidade',
      'outros': 'Outros'
    };
    return categoriaMap[categoria] || categoria;
  };

  const formatarPrioridade = (prioridade) => {
    const prioridadeMap = {
      'alta': 'Alta',
      'media': 'Média',
      'baixa': 'Baixa',
      'urgente': 'Urgente'
    };
    return prioridadeMap[prioridade] || prioridade;
  };

  const handleMapaCarregado = () => {
    setMapaCarregado(true);
    if (onMapaCarregado) {
      onMapaCarregado();
    }
  };

  const handleCentralizar = () => {
    if (mapRef.current && coordenadasRaio) {
      const map = mapRef.current;
      map.setView([coordenadasRaio.lat, coordenadasRaio.lng], 15);
    }
  };

  const tiposMapa = {
    default: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
  };

  return (
    <div className="relative z-0">
  <div
    style={{ height: altura, width: '100%' }}
    className="rounded-lg overflow-hidden border shadow-lg leaflet-wrapper"
  >
    <MapContainer
      center={coordenadasIniciais}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      whenCreated={handleMapaCarregado}
      zoomControl={false}
      className="leaflet-container-custom"
    >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Mapa Padrão">
              <TileLayer
                attribution={tiposMapa.default.attribution}
                url={tiposMapa.default.url}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satélite">
              <TileLayer
                attribution={tiposMapa.satellite.attribution}
                url={tiposMapa.satellite.url}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Terreno">
              <TileLayer
                attribution={tiposMapa.terrain.attribution}
                url={tiposMapa.terrain.url}
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {/* Centralizar mapa quando necessário */}
          {coordenadasCentralizar && (
            <CentralizarMapa coordenadas={coordenadasCentralizar} zoom={zoom} />
          )}
          
          {/* Círculo de raio */}
          {mostrarRaio && coordenadasRaio && (
            <Circle
              center={[coordenadasRaio.lat, coordenadasRaio.lng]}
              radius={raioKm * 1000} // converter km para metros
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
          )}
          
          {/* Marcador da localização atual */}
          {localizacaoAtual?.coordenadas && (
            <Marker
              position={[localizacaoAtual.coordenadas.lat, localizacaoAtual.coordenadas.lng]}
              icon={iconeLocalizacaoAtual}
            >
              <Popup maxWidth={300}>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-600">Sua Localização</h3>
                    </div>
                    
                    {localizacaoAtual.endereco && (
                      <div className="space-y-2 text-sm">
                        {localizacaoAtual.endereco.localidade && (
                          <div className="flex justify-between">
                            <span className="font-medium">Cidade:</span>
                            <span>{localizacaoAtual.endereco.localidade}</span>
                          </div>
                        )}
                        {localizacaoAtual.endereco.uf && (
                          <div className="flex justify-between">
                            <span className="font-medium">Estado:</span>
                            <span>{localizacaoAtual.endereco.uf}</span>
                          </div>
                        )}
                        {localizacaoAtual.endereco.cep && (
                          <div className="flex justify-between">
                            <span className="font-medium">CEP:</span>
                            <span>{localizacaoAtual.endereco.cep}</span>
                          </div>
                        )}
                        {localizacaoAtual.coordenadas.precisao && (
                          <div className="flex justify-between">
                            <span className="font-medium">Precisão:</span>
                            <span>{Math.round(localizacaoAtual.coordenadas.precisao)}m</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 pt-2 border-t text-xs text-gray-500">
                      Lat: {localizacaoAtual.coordenadas.lat.toFixed(6)}, 
                      Lng: {localizacaoAtual.coordenadas.lng.toFixed(6)}
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          )}
          
          {/* Marcador do CEP pesquisado */}
          {dadosCEP?.coordenadas && !localizacaoAtual && (
            <Marker
              position={[dadosCEP.coordenadas.lat, dadosCEP.coordenadas.lng]}
              icon={iconeCEP}
            >
              <Popup maxWidth={300}>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-orange-600">CEP Pesquisado</h3>
                    </div>
                    
                    {dadosCEP.endereco && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">CEP:</span>
                          <span className="font-mono">{dadosCEP.cep}</span>
                        </div>
                        {dadosCEP.endereco.localidade && (
                          <div className="flex justify-between">
                            <span className="font-medium">Cidade:</span>
                            <span>{dadosCEP.endereco.localidade}</span>
                          </div>
                        )}
                        {dadosCEP.endereco.uf && (
                          <div className="flex justify-between">
                            <span className="font-medium">Estado:</span>
                            <span>{dadosCEP.endereco.uf}</span>
                          </div>
                        )}
                        {dadosCEP.endereco.logradouro && (
                          <div className="flex justify-between">
                            <span className="font-medium">Logradouro:</span>
                            <span>{dadosCEP.endereco.logradouro}</span>
                          </div>
                        )}
                        {dadosCEP.endereco.bairro && (
                          <div className="flex justify-between">
                            <span className="font-medium">Bairro:</span>
                            <span>{dadosCEP.endereco.bairro}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 pt-2 border-t">
                      <Badge variant="secondary" className="text-xs">
                        Precisão: {dadosCEP.coordenadas.precisao || 'CEP'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          )}
          
          {/* Marcadores dos eventos */}
          {eventos.map((evento) => (
            <Marker
              key={evento.id}
              position={[evento.coordenadas.lat, evento.coordenadas.lng]}
              icon={criarIconeCategoria(evento.categoria, evento.status)}
              eventHandlers={{
                click: () => {
                  if (onEventoSelecionado) {
                    onEventoSelecionado(evento);
                  }
                }
              }}
            >
              <Popup maxWidth={350}>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 text-base">
                      {evento.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {evento.descricao}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {formatarCategoria(evento.categoria)}
                      </Badge>
                      <Badge 
                        variant={evento.status === 'resolvido' ? 'default' : 'outline'}
                        className={`text-xs ${
                          evento.status === 'resolvido' ? 'bg-green-100 text-green-800' :
                          evento.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                          evento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {formatarStatus(evento.status)}
                      </Badge>
                      {evento.prioridade && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            evento.prioridade === 'alta' || evento.prioridade === 'urgente' ? 'border-red-300 text-red-700' :
                            evento.prioridade === 'media' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }`}
                        >
                          {formatarPrioridade(evento.prioridade)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{evento.endereco}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Por: {evento.usuario}</span>
                        <span>{evento.data}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {evento.visualizacoes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {evento.curtidas}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {evento.comentarios}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Informações do mapa */}
      {(dadosCEP || localizacaoAtual) && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">
              {localizacaoAtual ? 'Sua Localização' : 'CEP Pesquisado'}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {dadosCEP?.endereco?.localidade || localizacaoAtual?.endereco?.localidade}, {' '}
            {dadosCEP?.endereco?.uf || localizacaoAtual?.endereco?.uf}
          </p>
          {mostrarRaio && (
            <p className="text-xs text-blue-600 mt-1">
              Raio de busca: {raioKm}km
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapaAvancado;
