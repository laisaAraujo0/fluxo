import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Ícones personalizados para diferentes categorias
const criarIconeCategoria = (categoria) => {
  const cores = {
    'infraestrutura': '#3b82f6',
    'seguranca': '#ef4444',
    'meio-ambiente': '#22c55e',
    'limpeza': '#a855f7',
    'saneamento': '#06b6d4',
    'mobilidade': '#eab308'
  };

  const cor = cores[categoria] || '#6b7280';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${cor};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Ícone para localização atual
const iconeLocalizacaoAtual = L.divIcon({
  className: 'localizacao-atual',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -3px;
        left: -3px;
        width: 20px;
        height: 20px;
        background-color: rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Ícone para CEP pesquisado
const iconeCEP = L.divIcon({
  className: 'cep-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background-color: #f97316;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(249, 115, 22, 0.5);
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
      <div style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        background-color: #ea580c;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const MapaInterativo = ({ 
  eventos = [], 
  coordenadasCentralizar = null, 
  localizacaoAtual = null,
  dadosCEP = null,
  onEventoSelecionado = null,
  altura = '600px',
  zoom = 13
}) => {
  const [mapaCarregado, setMapaCarregado] = useState(false);
  const mapRef = useRef(null);

  // Coordenadas padrão (São Paulo)
  const coordenadasPadrao = [-23.5505, -46.6333];
  
  // Determinar coordenadas iniciais
  const coordenadasIniciais = coordenadasCentralizar 
    ? [coordenadasCentralizar.lat, coordenadasCentralizar.lng]
    : localizacaoAtual?.coordenadas 
    ? [localizacaoAtual.coordenadas.lat, localizacaoAtual.coordenadas.lng]
    : coordenadasPadrao;

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
      'mobilidade': 'Mobilidade'
    };
    return categoriaMap[categoria] || categoria;
  };

  const formatarPrioridade = (prioridade) => {
    const prioridadeMap = {
      'alta': 'Alta',
      'media': 'Média',
      'baixa': 'Baixa'
    };
    return prioridadeMap[prioridade] || prioridade;
  };

  return (
    <div style={{ height: altura, width: '100%' }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={coordenadasIniciais}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenCreated={() => setMapaCarregado(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Centralizar mapa quando necessário */}
        {coordenadasCentralizar && (
          <CentralizarMapa coordenadas={coordenadasCentralizar} zoom={zoom} />
        )}
        
        {/* Marcador da localização atual */}
        {localizacaoAtual?.coordenadas && (
          <Marker
            position={[localizacaoAtual.coordenadas.lat, localizacaoAtual.coordenadas.lng]}
            icon={iconeLocalizacaoAtual}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-600 mb-2">Sua Localização</h3>
                {localizacaoAtual.endereco && (
                  <div className="space-y-1 text-sm">
                    <p><strong>Cidade:</strong> {localizacaoAtual.endereco.localidade}</p>
                    <p><strong>Estado:</strong> {localizacaoAtual.endereco.uf}</p>
                    {localizacaoAtual.endereco.cep && (
                      <p><strong>CEP:</strong> {localizacaoAtual.endereco.cep}</p>
                    )}
                    <p><strong>Precisão:</strong> {Math.round(localizacaoAtual.precisao)}m</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Lat: {localizacaoAtual.coordenadas.lat.toFixed(6)}, 
                  Lng: {localizacaoAtual.coordenadas.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Marcador do CEP pesquisado */}
        {dadosCEP?.coordenadas && !localizacaoAtual && (
          <Marker
            position={[dadosCEP.coordenadas.lat, dadosCEP.coordenadas.lng]}
            icon={iconeCEP}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-orange-600 mb-2">CEP Pesquisado</h3>
                {dadosCEP.endereco && (
                  <div className="space-y-1 text-sm">
                    <p><strong>CEP:</strong> {dadosCEP.endereco.cep}</p>
                    <p><strong>Cidade:</strong> {dadosCEP.endereco.localidade}</p>
                    <p><strong>Estado:</strong> {dadosCEP.endereco.uf}</p>
                    {dadosCEP.endereco.logradouro && (
                      <p><strong>Logradouro:</strong> {dadosCEP.endereco.logradouro}</p>
                    )}
                    {dadosCEP.endereco.bairro && (
                      <p><strong>Bairro:</strong> {dadosCEP.endereco.bairro}</p>
                    )}
                    {dadosCEP.endereco.regiao && (
                      <p><strong>Região:</strong> {dadosCEP.endereco.regiao}</p>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Marcadores dos eventos */}
        {eventos.map((evento) => (
          <Marker
            key={evento.id}
            position={[evento.coordenadas.lat, evento.coordenadas.lng]}
            icon={criarIconeCategoria(evento.categoria)}
            eventHandlers={{
              click: () => {
                if (onEventoSelecionado) {
                  onEventoSelecionado(evento);
                }
              }
            }}
          >
            <Popup>
              <div className="p-3 max-w-xs">
                <h3 className="font-semibold text-gray-800 mb-2">{evento.titulo}</h3>
                <p className="text-sm text-gray-600 mb-3">{evento.descricao}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium">Categoria:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {formatarCategoria(evento.categoria)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded ${
                      evento.status === 'resolvido' ? 'bg-green-100 text-green-800' :
                      evento.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                      evento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {formatarStatus(evento.status)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Prioridade:</span>
                    <span className={`px-2 py-1 rounded ${
                      evento.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                      evento.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {formatarPrioridade(evento.prioridade)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">{evento.endereco}</p>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Por: {evento.usuario}</span>
                    <span>{evento.data}</span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>👁 {evento.visualizacoes}</span>
                  <span>❤️ {evento.curtidas}</span>
                  <span>💬 {evento.comentarios}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaInterativo;
