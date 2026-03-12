import { useState } from 'react';
import { MapPin, Calendar, FileText, ExternalLink, Save, Map as MapIcon, Check, Star, Bookmark, Trophy, TrendingUp, Trash2 } from 'lucide-react';
import { useConcursoStore, Concurso } from '../store';
import { calculateScore } from '../utils/scoring';
import { parseNamedLinks } from '../utils/concursoUtils';
import clsx from 'clsx';
import Dashboard from './Dashboard';

export default function MyExams() {
  const { concursos, scoringRules, userProfileScoring, updateConcurso, toggleFavorite, markInterest, deleteConcurso } = useConcursoStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Concurso>>({});
  const [enriching, setEnriching] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'interested' | 'favorites' | 'analysis'>('interested');

  const myExams = concursos.filter(c => c.interest_status === 'interested');
  const favoriteExams = concursos.filter(c => c.is_favorite);

  const handleEdit = (concurso: Concurso) => {
    setEditingId(concurso.id);
    setEditForm({
      is_enrolled: concurso.is_enrolled,
      exam_location: concurso.exam_location || '',
      notes: concurso.notes || ''
    });
  };

  const handleSave = (id: string) => {
    updateConcurso(id, editForm);
    setEditingId(null);
  };

  const enrichLocation = async (id: string, locationQuery: string) => {
    setEnriching(id);
    try {
      // Mocking geocoding for client-side
      const lat = -23.55 + (Math.random() * 0.1);
      const lng = -46.63 + (Math.random() * 0.1);
      
      updateConcurso(id, { latitude: lat, longitude: lng });
      alert('Localização aproximada definida no mapa!');
    } catch (e) {
      console.error(e);
    }
    setEnriching(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meus Concursos</h2>
          <p className="text-slate-500">Gerencie suas inscrições, favoritos e análise de perfil.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('interested')}
            className={clsx(
              "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === 'interested' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Bookmark size={16} />
            <span>Acompanhamentos</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={clsx(
              "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === 'favorites' ? "bg-white text-amber-500 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Star size={16} />
            <span>Favoritos</span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={clsx(
              "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === 'analysis' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <TrendingUp size={16} />
            <span>Análise</span>
          </button>
        </div>
      </div>

      {activeTab === 'interested' && (
        myExams.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
            <p className="text-slate-500">Você ainda não marcou nenhum concurso como interessado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myExams.map((c, index) => (
              <ConcursoCard 
                key={`${c.id}-${index}`} 
                c={c} 
                scoringRules={scoringRules}
                userProfileScoring={userProfileScoring}
                editingId={editingId}
                editForm={editForm}
                setEditForm={setEditForm}
                enriching={enriching}
                handleEdit={handleEdit}
                handleSave={handleSave}
                enrichLocation={enrichLocation}
                toggleFavorite={toggleFavorite}
                markInterest={markInterest}
                deleteConcurso={deleteConcurso}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'favorites' && (
        favoriteExams.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
            <p className="text-slate-500">Você ainda não favoritou nenhum concurso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favoriteExams.map((c, index) => (
              <CompactConcursoCard 
                key={`${c.id}-${index}`} 
                c={c} 
                scoringRules={scoringRules}
                userProfileScoring={userProfileScoring}
                toggleFavorite={toggleFavorite}
                deleteConcurso={deleteConcurso}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'analysis' && (
        <Dashboard />
      )}
    </div>
  );
}

function CompactConcursoCard({ c, scoringRules, userProfileScoring, toggleFavorite, deleteConcurso }: any) {
  const score = calculateScore(c, scoringRules, userProfileScoring);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative group hover:border-indigo-100 transition-colors">
      <div className="flex-1 pr-16 sm:pr-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{c.source}</span>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{c.location}</span>
          {score > 0 && (
            <span className={clsx(
              "flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded",
              score > 70 ? "text-emerald-700 bg-emerald-50 border border-emerald-100 font-bold" : "text-amber-600 bg-amber-50"
            )}>
              <Trophy size={score > 70 ? 14 : 12} />
              <span>{score} pts</span>
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg text-slate-900 leading-tight">{c.institution}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Calendar size={14} className="text-slate-400" />
            <span>Inscrições: <strong className="font-medium text-slate-700">{c.registration_end || 'N/A'}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <FileText size={14} className="text-slate-400" />
            <span>Prova: <strong className="font-medium text-slate-700">{c.exam_date || 'A definir'}</strong></span>
          </div>
          {c.salary && c.salary !== 'N/A' && (
            <div className="flex items-center space-x-1.5">
               <span className="font-medium text-emerald-600">{c.salary}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
        {parseNamedLinks(c.Link_Inscricao, 'Inscrição').map((link, idx) => (
          <a 
            key={`inscricao-cp-${idx}`}
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="flex items-center space-x-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>{link.name}</span>
            <Check size={14} />
          </a>
        ))}
        {parseNamedLinks(c.Link_Edital, 'Edital').map((link, idx) => (
          <a 
            key={`edital-cp-${idx}`}
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="flex items-center space-x-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>{link.name}</span>
            <ExternalLink size={14} />
          </a>
        ))}
        {parseNamedLinks(c.Link_Edital, '').length === 0 && parseNamedLinks(c.Link_Inscricao, '').length === 0 && c.link && c.link !== 'N/A' && (
          <a 
            href={c.link} 
            target="_blank" 
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="flex items-center space-x-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Acessar</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-1">
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(c);
          }}
          className="p-1.5 text-amber-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
          title="Remover dos favoritos"
        >
          <Star size={20} fill="currentColor" />
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm('Deseja remover este concurso permanentemente?')) {
              deleteConcurso(c);
            }
          }}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Excluir permanentemente"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

function ConcursoCard({ c, scoringRules, userProfileScoring, editingId, editForm, setEditForm, enriching, handleEdit, handleSave, enrichLocation, toggleFavorite, markInterest, deleteConcurso }: any) {
  const score = calculateScore(c, scoringRules, userProfileScoring);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-4 relative">
      <div className="absolute top-4 md:top-6 right-12 md:right-14 flex items-center gap-1">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(c);
          }}
          className="p-2 text-slate-300 hover:text-amber-400 transition-colors"
          title={c.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Star size={20} fill={c.is_favorite ? "#fbbf24" : "none"} className={c.is_favorite ? "text-amber-400" : ""} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Deseja remover este concurso permanentemente?')) {
              deleteConcurso(c);
            }
          }}
          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          title="Excluir permanentemente"
        >
          <Trash2 size={20} />
        </button>
      </div>
      <div className="flex justify-between items-start pr-24">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{c.institution}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-indigo-600 text-sm font-medium">{c.source}</p>
            {score > 0 && (
              <span className={clsx(
                "flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded",
                score > 70 ? "text-emerald-700 bg-emerald-50 border border-emerald-100 font-bold" : "text-amber-600 bg-amber-50"
              )}>
                <Trophy size={score > 70 ? 14 : 12} />
                <span>{score} pts</span>
              </span>
            )}
          </div>
        </div>
        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex flex-col gap-2 items-end">
          {parseNamedLinks(c.Link_Inscricao, 'Página de Inscrição').map((link, idx) => (
            <a 
              key={`inscricao-fl-${idx}`}
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title={link.name}
            >
              <Check size={20} />
            </a>
          ))}
          {parseNamedLinks(c.Link_Edital, 'Ver Edital').map((link, idx) => (
            <a 
              key={`edital-fl-${idx}`}
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              title={link.name}
            >
              <ExternalLink size={20} />
            </a>
          ))}
          {parseNamedLinks(c.Link_Edital, '').length === 0 && parseNamedLinks(c.Link_Inscricao, '').length === 0 && c.link && c.link !== 'N/A' && (
            <a 
              href={c.link} 
              target="_blank" 
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Acessar Edital"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Calendar size={16} className="text-slate-400" />
          <span>Prova: {c.exam_date || 'A definir'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <MapPin size={16} className="text-slate-400" />
          <span>{c.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Calendar size={16} className="text-slate-400" />
          <span>Inscrições: {c.registration_end || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Calendar size={16} className="text-slate-400" />
          <span>Isenção: {c.exemption_period || 'N/A'}</span>
        </div>
      </div>

      {editingId === c.id ? (
        <div className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id={`enrolled-${c.id}`}
              checked={editForm.is_enrolled}
              onChange={e => setEditForm({...editForm, is_enrolled: e.target.checked})}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor={`enrolled-${c.id}`} className="text-sm font-medium text-slate-700">Já estou inscrito</label>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Local de Prova</label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={editForm.exam_location}
                onChange={e => setEditForm({...editForm, exam_location: e.target.value})}
                placeholder="Ex: Escola Estadual..."
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={() => enrichLocation(c.id, editForm.exam_location || '')}
                disabled={enriching === c.id || !editForm.exam_location}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                title="Buscar no Mapa"
              >
                <MapIcon size={18} className={enriching === c.id ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas / Lembretes</label>
            <textarea 
              value={editForm.notes}
              onChange={e => setEditForm({...editForm, notes: e.target.value})}
              placeholder="Anotações sobre o edital, matérias..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
            />
          </div>

          <button 
            onClick={() => handleSave(c.id)}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Save size={18} />
            <span>Salvar Alterações</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${c.is_enrolled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-sm font-medium text-slate-700">
                {c.is_enrolled ? 'Inscrito' : 'Não inscrito'}
              </span>
            </div>
            <button 
              onClick={() => handleEdit(c)}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              Editar Detalhes
            </button>
          </div>

          {c.exam_location && (
            <div className="flex items-start space-x-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
              <MapPin size={16} className="text-slate-400 mt-0.5" />
              <span>{c.exam_location}</span>
            </div>
          )}

          {c.notes && (
            <div className="flex items-start space-x-2 text-sm text-slate-600 bg-indigo-50/50 p-2 rounded-lg">
              <FileText size={16} className="text-indigo-400 mt-0.5" />
              <p className="italic">{c.notes}</p>
            </div>
          )}

          {c.latitude && c.longitude && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              <Check size={12} className="mr-1" /> Localização mapeada
            </p>
          )}
        </div>
      )}
    </div>
  );
}
