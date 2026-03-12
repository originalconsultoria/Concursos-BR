import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useConcursoStore, Concurso } from '../store';
import { useState, useCallback } from 'react';
import { MapPin, Calendar, ExternalLink, Navigation, X, Trophy } from 'lucide-react';
import clsx from 'clsx';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterButton({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(center, 4)}
      className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-indigo-600 transition-colors"
      title="Recentrar Mapa"
    >
      <Navigation size={20} />
    </button>
  );
}

export default function MapView() {
  const { concursos } = useConcursoStore();
  const [selectedConcurso, setSelectedConcurso] = useState<Concurso | null>(null);
  
  const mappedConcursos = concursos.filter(c => c.interest_status === 'interested' && c.latitude && c.longitude && c.institution !== 'Carregando...');
  const center: [number, number] = [-15.7801, -47.9292]; // Brasilia

  const handleMarkerClick = useCallback((c: Concurso) => {
    setSelectedConcurso(c);
  }, []);

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto w-full p-4 md:p-6">
      <header className="mb-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mapa</h2>
        <p className="text-slate-500 font-medium">Locais de prova dos seus concursos.</p>
      </header>

      <div className="flex-1 bg-slate-100 relative overflow-hidden md:rounded-3xl md:border md:border-slate-200 md:shadow-sm">
        {mappedConcursos.length === 0 && (
          <div className="absolute inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Nenhum local mapeado</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Para visualizar concursos no mapa, vá até a aba <strong>Meus Concursos</strong>, clique em <strong>Editar Detalhes</strong> de um concurso e use o botão <strong>Buscar no Mapa</strong> para definir o local de prova.
              </p>
            </div>
          </div>
        )}

        <MapContainer 
          center={center} 
          zoom={4} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterButton center={center} />
          {mappedConcursos.map((c, index) => (
            <Marker 
              key={`${c.id}-${index}`} 
              position={[c.latitude!, c.longitude!]}
              eventHandlers={{
                click: () => handleMarkerClick(c),
              }}
            />
          ))}
        </MapContainer>

        {/* Floating Detail Card */}
        {selectedConcurso && (
          <div className="absolute bottom-6 left-4 right-4 z-[1000] md:left-auto md:right-6 md:w-80 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">{selectedConcurso.location}</span>
                      <span className="text-[10px] text-slate-400 font-medium truncate">{selectedConcurso.source}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-tight">{selectedConcurso.institution}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedConcurso(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="truncate">{selectedConcurso.exam_location || selectedConcurso.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Prova: {selectedConcurso.exam_date || 'Não definida'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Trophy size={14} className="text-amber-500" />
                    <span>Score: <strong className="text-slate-900">{selectedConcurso.calculatedScore}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedConcurso.link && selectedConcurso.link !== 'N/A' && (
                    <a 
                      href={selectedConcurso.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all"
                    >
                      <ExternalLink size={14} />
                      Ver Edital
                    </a>
                  )}
                  <button 
                    onClick={() => setSelectedConcurso(null)}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
