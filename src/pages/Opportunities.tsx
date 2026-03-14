import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Check, X, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight, BookOpen, Briefcase, Globe, Layout, ListChecks, Star, MapPin, Trophy, ExternalLink, RefreshCw, Calendar, CalendarDays, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useConcursoStore, Concurso } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { PositionsList } from '../components/PositionsList';
import { calculateScore } from '../utils/scoring';
import { getEditalStatus, parseNamedLinks } from '../utils/concursoUtils';
import clsx from 'clsx';

type SortKey = keyof Concurso | 'status' | 'score';

const MultiSelect = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  options: string[]; 
  selected: string[]; 
  onChange: (val: string[]) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-left flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-indigo-500/20",
          selected.length > 0 ? "border-indigo-500 text-indigo-700 font-medium" : "border-slate-200 text-slate-500"
        )}
      >
        <span className="truncate">
          {selected.length === 0 ? placeholder : `${selected.length} selecionado${selected.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown size={16} className={clsx("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in duration-150">
          {options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-slate-50 transition-colors",
                selected.includes(option) ? "text-indigo-600 font-bold bg-indigo-50/50" : "text-slate-600"
              )}
            >
              <span>{option}</span>
              {selected.includes(option) && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MobileFilterSection = ({ 
  label, 
  options, 
  selected, 
  onChange 
}: { 
  label: string; 
  options: string[]; 
  selected: string[]; 
  onChange: (val: string[]) => void;
}) => {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => toggleOption(option)}
            className={clsx(
              "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
              selected.includes(option) 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                : "bg-slate-50 text-slate-600 border-slate-200"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const FilterModal = ({ 
  isOpen, 
  onClose, 
  ufFilter, setUfFilter, 
  statusFilter, setStatusFilter, 
  esferaFilter, setEsferaFilter, 
  modalidadeFilter, setModalidadeFilter, 
  onApply, 
  ufs, esferas, modalidades 
}: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900">Filtros</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <MobileFilterSection label="Estado (UF)" options={ufs} selected={ufFilter} onChange={setUfFilter} />
          <MobileFilterSection label="Esfera" options={esferas} selected={esferaFilter} onChange={setEsferaFilter} />
          <MobileFilterSection label="Modalidade" options={modalidades} selected={modalidadeFilter} onChange={setModalidadeFilter} />
          <MobileFilterSection label="Status" options={['Aberto', 'Autorizado', 'Comissão Formada', 'Previsto', 'Solicitado', 'Encerrado']} selected={statusFilter} onChange={setStatusFilter} />
        </div>
        <div className="mt-8 pt-6 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100">Cancelar</button>
          <button onClick={onApply} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-200">Aplicar Filtros</button>
        </div>
      </div>
    </div>
  );
};

const isRelevant = (val: string | undefined | null) => {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  if (lower === 'n/a' || lower === '-' || lower === 'não informado') return false;
  if (lower.includes('consultar edital') || lower.includes('a definir')) return false;
  return true;
};

export default function Opportunities() {
  const { concursos, scoringRules, userProfileScoring, markInterest, updateConcurso, toggleFavorite, setConcursos } = useConcursoStore();
  const [filter, setFilter] = useState('');
  const [ufFilter, setUfFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [esferaFilter, setEsferaFilter] = useState<string[]>([]);
  const [modalidadeFilter, setModalidadeFilter] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    uf: string[];
    status: string[];
    esfera: string[];
    modalidade: string[];
  }>({
    uf: [],
    status: [],
    esfera: [],
    modalidade: []
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [animatingRowId, setAnimatingRowId] = useState<string | null>(null);
  
  useEffect(() => {
    if (expandedRow) {
      setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        const elementId = isMobile ? `mobile-card-${expandedRow}` : `desktop-row-${expandedRow}`;
        const element = document.getElementById(elementId);
        if (isMobile && element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [expandedRow]);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(50);

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'BR', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 
    'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 
    'RR', 'SC', 'SP', 'SE', 'TO', 'N/A'
  ];

  const esferas = useMemo(() => {
    const set = new Set(concursos.map(c => c.esfera).filter((e): e is string => !!e && e !== 'N/A'));
    return Array.from(set).sort();
  }, [concursos]);

  const modalidades = useMemo(() => {
    const set = new Set(concursos.map(c => c.modalidade).filter((m): m is string => !!m && m !== 'N/A'));
    return Array.from(set).sort();
  }, [concursos]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isFilterActive = ufFilter.length > 0 || statusFilter.length > 0 || esferaFilter.length > 0 || modalidadeFilter.length > 0;

  const handleApplyFilters = () => {
    setAppliedFilters({
      uf: ufFilter,
      status: statusFilter,
      esfera: esferaFilter,
      modalidade: modalidadeFilter
    });
    setVisibleCount(50);
    setIsFilterDrawerOpen(false);
  };

  const clearFilters = () => {
    setUfFilter([]);
    setStatusFilter([]);
    setEsferaFilter([]);
    setModalidadeFilter([]);
    setAppliedFilters({ uf: [], status: [], esfera: [], modalidade: [] });
    setVisibleCount(50);
  };

  const processedConcursos = useMemo(() => {
    // 1. Filter
    let result = concursos.filter(c => {
      if (c.institution === 'Carregando...') return false;
      const matchesText = 
        (c.institution || '').toLowerCase().includes((filter || '').toLowerCase()) ||
        (c.board || '').toLowerCase().includes((filter || '').toLowerCase()) ||
        (c.source || '').toLowerCase().includes((filter || '').toLowerCase());
      
      const matchesUf = appliedFilters.uf.length === 0 || appliedFilters.uf.includes(c.location);
      
      const status = (c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date)) as any;
      const matchesStatus = appliedFilters.status.length === 0 || appliedFilters.status.includes(status);
      
      const matchesEsfera = appliedFilters.esfera.length === 0 || appliedFilters.esfera.includes(c.esfera || '');
      const matchesModalidade = appliedFilters.modalidade.length === 0 || appliedFilters.modalidade.includes(c.modalidade || '');
      
      return matchesText && matchesUf && matchesStatus && matchesEsfera && matchesModalidade;
    }).map(c => ({
      ...c,
      calculatedScore: calculateScore(c, scoringRules, userProfileScoring)
    }));

    // 2. Sort
    result.sort((a, b) => {
      const statusA = (a.status && a.status !== 'N/A' ? a.status : getEditalStatus(a.registration_end, a.exam_date)) as string;
      const statusB = (b.status && b.status !== 'N/A' ? b.status : getEditalStatus(b.registration_end, b.exam_date)) as string;

      // Rule: Encerrado goes to the end
      if (statusA === 'Encerrado' && statusB !== 'Encerrado') return 1;
      if (statusA !== 'Encerrado' && statusB === 'Encerrado') return -1;

      if (sortConfig) {
        let valA: any;
        let valB: any;

        if (sortConfig.key === 'status') {
          valA = statusA;
          valB = statusB;
        } else if (sortConfig.key === 'score') {
          valA = a.calculatedScore;
          valB = b.calculatedScore;
        } else {
          valA = a[sortConfig.key as keyof Concurso] || '';
          valB = b[sortConfig.key as keyof Concurso] || '';
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else {
        // Default sort by score descending if no sort config
        return b.calculatedScore - a.calculatedScore;
      }
    });

    return result;
  }, [concursos, filter, appliedFilters, sortConfig, getEditalStatus, scoringRules, userProfileScoring]);

  const visibleConcursos = useMemo(() => {
    return processedConcursos.slice(0, visibleCount);
  }, [processedConcursos, visibleCount]);

  const handleMarkInterest = (id: string, status: 'interested' | 'ignored' | 'none') => {
    setAnimatingRowId(id);
    markInterest(id, status);
    setTimeout(() => setAnimatingRowId(null), 500);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (!sortConfig || sortConfig.key !== column) return <ArrowUpDown size={14} className="ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 text-indigo-600" /> : <ArrowDown size={14} className="ml-1 text-indigo-600" />;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0 pt-4 md:pt-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Oportunidades</h2>
          <p className="text-slate-500">Encontre e gerencie concursos públicos.</p>
        </div>
      </div>

      {/* BARRA DE AÇÕES UNIFICADA */}
      <div className="flex gap-2 mb-6 px-4 md:px-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar concurso..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setVisibleCount(50);
            }}
          />
        </div>
        
        <button 
          onClick={() => setIsFilterDrawerOpen(true)}
          className={clsx(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all",
            isFilterActive 
              ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          )}
        >
          <Filter size={20} />
          <span className="hidden md:inline font-medium text-sm">Filtros</span>
        </button>

        {isFilterActive && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
          >
            <Trash2 size={20} />
            <span className="hidden md:inline font-medium text-sm">Limpar</span>
          </button>
        )}
      </div>

      <FilterModal 
        isOpen={isFilterDrawerOpen} 
        onClose={() => setIsFilterDrawerOpen(false)}
        ufFilter={ufFilter} setUfFilter={setUfFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        esferaFilter={esferaFilter} setEsferaFilter={setEsferaFilter}
        modalidadeFilter={modalidadeFilter} setModalidadeFilter={setModalidadeFilter}
        onApply={handleApplyFilters}
        ufs={ufs} esferas={esferas} modalidades={modalidades}
      />

      {/* MOBILE: Cards (hidden em md:) */}
      <div className="md:hidden grid grid-cols-1 gap-4 px-4">
        {concursos.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
            Nenhum concurso encontrado. Faça o upload do arquivo CSV.
          </div>
        ) : processedConcursos.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            Nenhum resultado para a busca.
          </div>
        ) : (
          <>
            {visibleConcursos.map((c, index) => {
              const status = c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date);
              const isExpanded = expandedRow === c.id;
              
              return (
                <motion.div 
                  id={`mobile-card-${c.id}`}
                  layout
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                  key={`${c.id}-${index}`}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(50);
                    setExpandedRow(isExpanded ? null : c.id);
                  }}
                  className={clsx(
                    "bg-white rounded-2xl border transition-colors duration-200 overflow-hidden flex flex-col relative cursor-pointer",
                    c.interest_status === 'interested' ? "border-indigo-500 ring-1 ring-indigo-500 shadow-md" : "border-slate-200 shadow-sm",
                    (c.interest_status === 'ignored' || status === 'Encerrado') && "opacity-60 grayscale",
                    isExpanded && "border-slate-300 shadow-md"
                  )}
                >
                  <div className="p-3 flex flex-col gap-1.5">
                    {/* Header row: Title + Score + Favorite */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
                        {c.institution}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className={clsx(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold",
                          c.calculatedScore < 30 ? "bg-rose-50 text-rose-700" :
                          c.calculatedScore < 70 ? "bg-amber-50 text-amber-700" :
                          "bg-emerald-50 text-emerald-700"
                        )}>
                          <Trophy size={10} />
                          <span>{c.calculatedScore}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (navigator.vibrate) navigator.vibrate(50);
                            toggleFavorite(c);
                          }}
                          className={clsx(
                            "p-1 rounded-full transition-colors -mr-1 -mt-1",
                            c.is_favorite ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-slate-50"
                          )}
                        >
                          <Star size={16} fill={c.is_favorite ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    {/* Location, Board & Status */}
                    <div className="flex items-center mt-0.5 gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate pr-2">
                        <span className="flex items-center gap-1 flex-shrink-0"><MapPin size={10} /> {c.location}</span>
                        {c.board && c.board !== 'N/A' && (
                          <>
                            <span className="text-slate-300 flex-shrink-0">•</span>
                            <span className="truncate">{c.board}</span>
                          </>
                        )}
                      </div>
                      <StatusBadge status={status as any} />
                    </div>

                    {/* Key Stats & Actions */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col flex-shrink-0 whitespace-nowrap">
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Vagas</span>
                          <span className="text-[13px] font-bold text-slate-700 leading-none">{c.vacancies}</span>
                        </div>
                        <div className="w-px h-5 bg-slate-200"></div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Salário</span>
                          <span className={clsx(
                            "text-[13px] font-bold leading-none truncate",
                            (!c.salary || c.salary === 'N/A' || c.salary.toLowerCase().includes('cadastro')) ? "text-slate-400" : "text-emerald-600"
                          )}>
                            {c.salary && c.salary !== 'N/A' ? c.salary : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {status !== 'Encerrado' && (
                          c.interest_status === 'interested' ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(50); handleMarkInterest(c.id, 'none'); }}
                              className="px-3 py-1 flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 rounded-full transition-colors"
                            >
                              <Check size={12} />
                              <span>Interesse</span>
                            </button>
                          ) : c.interest_status === 'ignored' ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(50); handleMarkInterest(c.id, 'none'); }}
                              className="px-3 py-1 flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-full transition-colors"
                            >
                              <RefreshCw size={12} />
                              <span>Restaurar</span>
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(50); handleMarkInterest(c.id, 'interested'); }}
                                className="px-3 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-full transition-colors"
                              >
                                Interesse
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(50); handleMarkInterest(c.id, 'ignored'); }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                title="Ignorar"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-4 pt-3 bg-slate-50 shadow-inner border-t border-slate-200 space-y-4" onClick={(e) => e.stopPropagation()}>
                          {/* Módulo A: Grid de Metadados */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Esfera - Row 1 */}
                        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col gap-1 shadow-sm">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Globe size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Esfera</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{c.esfera}</span>
                        </div>
                        
                        {/* Inscrições até - Row 2 */}
                        <div className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col gap-1 shadow-sm">
                          <div className="flex items-center gap-1.5 text-rose-500">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Inscrições até</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{c.registration_end}</span>
                        </div>
                        
                        {/* Data da Prova - Row 2 */}
                        <div className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col gap-1 shadow-sm">
                          <div className="flex items-center gap-1.5 text-blue-500">
                            <CalendarDays size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Data da Prova</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{c.exam_date}</span>
                        </div>
                        
                        {/* Novo Bloco: Vagas e Remuneração - Row 3 */}
                        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-3 flex flex-col gap-3 shadow-sm">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Vagas Ofertadas</span>
                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{c.vacancies}</p>
                          </div>
                          <div className="border-t border-slate-100 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Remuneração</span>
                            <p className="text-xs font-bold text-emerald-600 leading-relaxed">{c.salary && c.salary !== 'N/A' ? c.salary : 'A definir'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Módulo B: Smart Hiding (Etapas e Disciplinas) */}
                      {isRelevant(c.etapas) && (
                        <div className="px-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Etapas</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{c.etapas}</p>
                        </div>
                      )}

                      {isRelevant(c.subjects) && (
                        <div className="px-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Disciplinas</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">{c.subjects}</p>
                        </div>
                      )}

                      {/* Módulo C: Paddock de Cargos */}
                      {c.positions && c.positions.length > 0 && isRelevant(c.positions[0]) && (
                        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                          <div className="flex items-center gap-1.5 text-slate-700 mb-2.5">
                            <Briefcase size={14} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Cargos Disponíveis</span>
                          </div>
                          <PositionsList positions={c.positions} />
                        </div>
                      )}

                      {/* Módulo D: Zona de Ação */}
                      <div className="flex flex-col gap-2 pt-1">
                        {parseNamedLinks(c.Link_Edital, 'Ver Edital').map((link, idx) => (
                          <a 
                            key={`edital-${idx}`}
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            referrerPolicy="no-referrer"
                            className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            <ExternalLink size={14} />
                            {link.name}
                          </a>
                        ))}
                        {parseNamedLinks(c.Link_Inscricao, 'Página de Inscrição').map((link, idx) => (
                          <a 
                            key={`inscricao-${idx}`}
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            referrerPolicy="no-referrer"
                            className="flex items-center justify-center gap-2 w-full bg-slate-900 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                          >
                            <Check size={14} />
                            {link.name}
                          </a>
                        ))}
                        {parseNamedLinks(c.Link_Edital, '').length === 0 && parseNamedLinks(c.Link_Inscricao, '').length === 0 && c.link && c.link !== 'N/A' && (
                          <a 
                            href={c.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            referrerPolicy="no-referrer"
                            className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            <ExternalLink size={14} />
                            Acessar Edital
                          </a>
                        )}
                      </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* DESKTOP/TABLET: Tabela (block apenas em md:) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('institution')}>
                  <div className="flex items-center uppercase text-[11px] tracking-wider">Órgão / Instituição <SortIcon column="institution" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('score')}>
                  <div className="flex items-center uppercase text-[11px] tracking-wider">Pontuação <SortIcon column="score" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center uppercase text-[11px] tracking-wider">Status <SortIcon column="status" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('exam_date')}>
                  <div className="flex items-center uppercase text-[11px] tracking-wider">Data Prova <SortIcon column="exam_date" /></div>
                </th>
                <th className="px-6 py-4 text-right uppercase text-[11px] tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {concursos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum concurso encontrado.</td></tr>
              ) : processedConcursos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum resultado para a busca.</td></tr>
              ) : (
                <>
                  {visibleConcursos.map((c, index) => {
                    const status = c.status && c.status !== 'N/A' ? c.status : getEditalStatus(c.registration_end, c.exam_date);
                    const isExpanded = expandedRow === c.id;
                    
                    return (
                      <React.Fragment key={`${c.id}-${index}`}>
                        <tr 
                          id={`desktop-row-${c.id}`}
                          className={clsx(
                            "transition-colors cursor-pointer group",
                            c.interest_status === 'interested' ? "bg-indigo-50/30" : 
                            c.interest_status === 'ignored' ? "opacity-50 grayscale" : "bg-white",
                            "hover:bg-slate-50"
                          )}
                          onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(50);
                            setExpandedRow(isExpanded ? null : c.id);
                          }}
                        >
                          <td className="px-6 py-4 w-10">
                            <div className={clsx(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                              isExpanded ? "bg-indigo-50 text-indigo-600 rotate-90" : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                            )}>
                              <ChevronRight size={18} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="min-w-0">
                                <div className="font-black text-slate-900 truncate text-base tracking-tight mb-0.5">{c.institution}</div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate mb-1">
                                  <span className="flex items-center gap-1 flex-shrink-0"><MapPin size={10} /> {c.location}</span>
                                  {c.board && c.board !== 'N/A' && (
                                    <>
                                      <span className="text-slate-300 flex-shrink-0">•</span>
                                      <span className="truncate">{c.board}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-emerald-600 font-semibold text-xs">
                                  {c.salary && c.salary !== 'N/A' ? c.salary : 'Consulte o edital'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={clsx(
                              "flex items-center space-x-2 font-bold",
                              c.calculatedScore < 30 ? "text-rose-600" :
                              c.calculatedScore < 70 ? "text-amber-600" :
                              "text-emerald-600"
                            )}>
                              <Trophy size={16} />
                              <span className="text-base">{c.calculatedScore}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={status as any} />
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              <span className="font-medium">{c.exam_date && c.exam_date !== 'N/A' ? c.exam_date : 'Consultar Edital'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              {c.link && c.link !== 'N/A' && (
                                <a href={c.link} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Acessar Edital">
                                  <ExternalLink size={18} />
                                </a>
                              )}
                              
                              <button 
                                onClick={() => { if (navigator.vibrate) navigator.vibrate(50); handleMarkInterest(c.id, c.interest_status === 'interested' ? 'none' : 'interested'); }}
                                className={clsx(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm",
                                  c.interest_status === 'interested' 
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                                )}
                              >
                                <Check size={14} />
                                <span>{c.interest_status === 'interested' ? 'Interessado' : 'Interesse'}</span>
                              </button>
                              
                              <button 
                                onClick={() => { if (navigator.vibrate) navigator.vibrate(50); handleMarkInterest(c.id, c.interest_status === 'ignored' ? 'none' : 'ignored'); }}
                                className={clsx(
                                  "p-2 rounded-lg transition-all",
                                  c.interest_status === 'ignored' ? "text-rose-600" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                )}
                                title={c.interest_status === 'ignored' ? 'Ignorado' : 'Ignorar'}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={6} className="p-0">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-6 bg-slate-50 border-t border-slate-200">
                                    <div className="max-w-5xl space-y-6">
                                      {/* Módulo A: Grid de Metadados */}
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {/* Esfera */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col gap-1.5 shadow-sm">
                                          <div className="flex items-center gap-1.5 text-slate-400">
                                            <Globe size={14} />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Esfera</span>
                                          </div>
                                          <span className="text-sm font-medium text-slate-700">{c.esfera}</span>
                                        </div>
                                        
                                        {/* Inscrições até */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col gap-1.5 shadow-sm">
                                          <div className="flex items-center gap-1.5 text-rose-500">
                                            <Calendar size={14} />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inscrições até</span>
                                          </div>
                                          <span className="text-sm font-medium text-slate-700">{c.registration_end}</span>
                                        </div>
                                        
                                        {/* Data da Prova */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col gap-1.5 shadow-sm">
                                          <div className="flex items-center gap-1.5 text-blue-500">
                                            <CalendarDays size={14} />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data da Prova</span>
                                          </div>
                                          <span className="text-sm font-medium text-slate-700">{c.exam_date}</span>
                                        </div>

                                        {/* Vagas */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col gap-1.5 shadow-sm">
                                          <div className="flex items-center gap-1.5 text-slate-400">
                                            <Briefcase size={14} />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vagas Ofertadas</span>
                                          </div>
                                          <span className="text-sm font-medium text-slate-700">{c.vacancies}</span>
                                        </div>
                                      </div>

                                      {/* Módulo B: Smart Hiding (Etapas e Disciplinas) */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {isRelevant(c.etapas) && (
                                          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Etapas</span>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.etapas}</p>
                                          </div>
                                        )}

                                        {isRelevant(c.subjects) && (
                                          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Disciplinas</span>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{c.subjects}</p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Módulo C: Paddock de Cargos */}
                                      {c.positions && c.positions.length > 0 && isRelevant(c.positions[0]) && (
                                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                          <div className="flex items-center gap-1.5 text-slate-700 mb-3">
                                            <Briefcase size={16} />
                                            <span className="text-sm font-semibold uppercase tracking-wider">Cargos Disponíveis</span>
                                          </div>
                                          <PositionsList positions={c.positions} />
                                        </div>
                                      )}

                                      {/* Módulo D: Zona de Ação */}
                                      <div className="flex flex-wrap gap-3 pt-2">
                                        {parseNamedLinks(c.Link_Edital, 'Ver Edital').map((link, idx) => (
                                          <a 
                                            key={`edital-dt-${idx}`}
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            referrerPolicy="no-referrer"
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm max-w-md w-full sm:w-auto"
                                          >
                                            <ExternalLink size={16} />
                                            {link.name}
                                          </a>
                                        ))}
                                        {parseNamedLinks(c.Link_Inscricao, 'Página de Inscrição').map((link, idx) => (
                                          <a 
                                            key={`inscricao-dt-${idx}`}
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            referrerPolicy="no-referrer"
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm max-w-md w-full sm:w-auto"
                                          >
                                            <Check size={16} />
                                            {link.name}
                                          </a>
                                        ))}
                                        {parseNamedLinks(c.Link_Edital, '').length === 0 && parseNamedLinks(c.Link_Inscricao, '').length === 0 && c.link && c.link !== 'N/A' && (
                                          <a 
                                            href={c.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            referrerPolicy="no-referrer"
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm max-w-md w-full sm:w-auto"
                                          >
                                            <ExternalLink size={16} />
                                            Acessar Edital
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination / Load More */}
      <div className="py-12">
        {visibleCount < processedConcursos.length ? (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setVisibleCount(prev => prev + 50)}
              className="w-full md:w-auto bg-white text-indigo-600 border border-indigo-200 px-8 py-4 md:py-3 rounded-2xl md:rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Carregar Mais Oportunidades
            </button>
            <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
              Exibindo {visibleCount} de {processedConcursos.length} concursos
            </p>
          </div>
        ) : processedConcursos.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <Check size={14} />
              Fim da lista
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Filtros</h3>
              <button onClick={clearFilters} className="text-sm font-bold text-rose-600">Limpar</button>
            </div>
            
            <div className="space-y-8 max-h-[60vh] overflow-y-auto pb-6 pr-2 custom-scrollbar">
              <MobileFilterSection 
                label="Estado (UF)"
                options={ufs}
                selected={ufFilter}
                onChange={setUfFilter}
              />
              <MobileFilterSection 
                label="Esfera"
                options={esferas}
                selected={esferaFilter}
                onChange={setEsferaFilter}
              />
              <MobileFilterSection 
                label="Modalidade"
                options={modalidades}
                selected={modalidadeFilter}
                onChange={setModalidadeFilter}
              />
              <MobileFilterSection 
                label="Status"
                options={['Aberto', 'Autorizado', 'Comissão Formada', 'Previsto', 'Solicitado', 'Encerrado']}
                selected={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            <button
              onClick={handleApplyFilters}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
