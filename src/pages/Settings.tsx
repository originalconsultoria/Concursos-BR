import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, User, MapPin, Globe, GraduationCap, Layout, Bell, Mail, Smartphone, Trophy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useConcursoStore, ScoringRule, NotificationSettings } from '../store';
import { ESFERA_PATTERNS, MODALIDADE_PATTERNS, BRAZILIAN_UFS, ESCOLARIDADE_OPTIONS } from '../constants';
import clsx from 'clsx';

type TabType = 'perfil' | 'pontuacao' | 'notificacoes';

export default function Settings() {
  const { 
    scoringRules, addScoringRule, removeScoringRule, updateScoringRule,
    userProfileScoring, updateUserProfileScoring,
    notificationSettings, updateNotificationSettings
  } = useConcursoStore();

  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    // Simulate a brief calculation period for UX
    setTimeout(() => {
      setIsRecalculating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleAddRule = () => {
    const newRule: ScoringRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: 'salary',
      condition: 'greater_than',
      value: '',
      points: 10,
    };
    addScoringRule(newRule);
  };

  const toggleUf = (uf: string) => {
    const currentUfs = { ...(userProfileScoring.ufs_desejadas || {}) };
    if (currentUfs[uf]) {
      delete currentUfs[uf];
    } else {
      currentUfs[uf] = 10;
    }
    updateUserProfileScoring({ ufs_desejadas: currentUfs });
  };

  const toggleEsfera = (esfera: string) => {
    const currentEsferas = { ...(userProfileScoring.esferas_preferidas || {}) };
    if (currentEsferas[esfera]) {
      delete currentEsferas[esfera];
    } else {
      currentEsferas[esfera] = 15;
    }
    updateUserProfileScoring({ esferas_preferidas: currentEsferas });
  };

  const toggleModalidade = (modalidade: string) => {
    const currentModalidades = { ...(userProfileScoring.modalidades_preferidas || {}) };
    if (currentModalidades[modalidade]) {
      delete currentModalidades[modalidade];
    } else {
      currentModalidades[modalidade] = 10;
    }
    updateUserProfileScoring({ modalidades_preferidas: currentModalidades });
  };

  const toggleEscolaridade = (escolaridade: string) => {
    const currentEscolaridades = { ...(userProfileScoring.escolaridades_preferidas || {}) };
    if (currentEscolaridades[escolaridade]) {
      delete currentEscolaridades[escolaridade];
    } else {
      currentEscolaridades[escolaridade] = 20;
    }
    updateUserProfileScoring({ escolaridades_preferidas: currentEscolaridades });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-0 pb-12">
      <div className="py-4 sm:py-0">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h2>
        <p className="text-slate-500 text-sm sm:text-base font-medium">Personalize suas preferências e regras de pontuação</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center gap-1">
        <button
          onClick={() => setActiveTab('perfil')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'perfil' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          <User size={18} />
          <span>Perfil</span>
        </button>
        <button
          onClick={() => setActiveTab('pontuacao')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'pontuacao' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          <Trophy size={18} />
          <span>Pontuação</span>
        </button>
        <button
          onClick={() => setActiveTab('notificacoes')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'notificacoes' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          <Bell size={18} />
          <span>Notificações</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'perfil' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="text-indigo-600 shrink-0" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Perfil do Usuário</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* UFs Desejadas */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm uppercase tracking-wider">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span>Estados (UFs) Desejados</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BRAZILIAN_UFS.map(uf => {
                    const isActive = !!(userProfileScoring.ufs_desejadas || {})[uf];
                    return (
                      <button
                        key={uf}
                        onClick={() => toggleUf(uf)}
                        className={clsx(
                          "px-3 py-1.5 rounded-full text-sm font-bold border transition-all",
                          isActive 
                            ? "bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm" 
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {uf}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Esferas Preferidas */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm uppercase tracking-wider">
                  <Globe size={16} className="text-slate-400 shrink-0" />
                  <span>Esferas Preferidas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...Object.keys(ESFERA_PATTERNS), 'Federal', 'Estadual', 'Municipal'].map(esfera => {
                    const isActive = !!(userProfileScoring.esferas_preferidas || {})[esfera];
                    return (
                      <button
                        key={esfera}
                        onClick={() => toggleEsfera(esfera)}
                        className={clsx(
                          "px-3 py-1.5 rounded-full text-sm font-bold border transition-all",
                          isActive 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" 
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {esfera}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modalidades Preferidas */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm uppercase tracking-wider">
                  <Layout size={16} className="text-slate-400 shrink-0" />
                  <span>Modalidades Preferidas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(MODALIDADE_PATTERNS).map(modalidade => {
                    const isActive = !!(userProfileScoring.modalidades_preferidas || {})[modalidade];
                    return (
                      <button
                        key={modalidade}
                        onClick={() => toggleModalidade(modalidade)}
                        className={clsx(
                          "px-3 py-1.5 rounded-full text-sm font-bold border transition-all",
                          isActive 
                            ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" 
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {modalidade}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Escolaridade Alvo */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm uppercase tracking-wider">
                  <GraduationCap size={16} className="text-slate-400 shrink-0" />
                  <span>Nível de Escolaridade Alvo</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ESCOLARIDADE_OPTIONS.map(escolaridade => {
                    const isActive = !!(userProfileScoring.escolaridades_preferidas || {})[escolaridade];
                    return (
                      <button
                        key={escolaridade}
                        onClick={() => toggleEscolaridade(escolaridade)}
                        className={clsx(
                          "px-3 py-1.5 rounded-full text-sm font-bold border transition-all",
                          isActive 
                            ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm" 
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {escolaridade}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pontuacao' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="text-indigo-600 shrink-0" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Regras de Pontuação Dinâmicas</h3>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleRecalculate}
                    disabled={isRecalculating}
                    className={clsx(
                      "flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 border",
                      showSuccess 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    {isRecalculating ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : showSuccess ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    <span>{isRecalculating ? 'Calculando...' : showSuccess ? 'Concluído' : 'Recalcular Scores'}</span>
                  </button>
                  <button
                    onClick={handleAddRule}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-bold active:scale-95"
                  >
                    <Plus size={18} />
                    <span>Nova Regra</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {scoringRules.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                    <AlertCircle size={48} className="text-slate-200 mb-3" />
                    <p className="font-bold">Nenhuma regra configurada.</p>
                    <p className="text-xs mt-1">Adicione regras para priorizar concursos automaticamente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scoringRules.map((rule) => (
                      <div key={rule.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:flex-1">
                          <select
                            value={rule.field}
                            onChange={(e) => updateScoringRule(rule.id, { field: e.target.value as any })}
                            className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="salary">Salário</option>
                            <option value="vacancies">Vagas</option>
                            <option value="board">Banca</option>
                            <option value="positions">Cargos</option>
                            <option value="institution">Órgão</option>
                            <option value="location">UF / Local</option>
                          </select>

                          <select
                            value={rule.condition}
                            onChange={(e) => updateScoringRule(rule.id, { condition: e.target.value as any })}
                            className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="contains">Contém</option>
                            <option value="equals">Igual a</option>
                            <option value="greater_than">Maior que</option>
                            <option value="less_than">Menor que</option>
                          </select>
                        </div>

                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateScoringRule(rule.id, { value: e.target.value })}
                          placeholder="Valor..."
                          className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        />

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase mr-2">Pts</span>
                            <input
                              type="number"
                              value={rule.points}
                              onChange={(e) => updateScoringRule(rule.id, { points: Number(e.target.value) })}
                              className="w-12 text-sm font-bold text-center focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => removeScoringRule(rule.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-3">Como funciona a pontuação?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 leading-relaxed">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0" />
                    <p>Para <strong>Salário</strong> e <strong>Vagas</strong>, o sistema extrai números automaticamente (ex: "R$ 5.000" vira 5000).</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0" />
                    <p>Use <strong>Contém</strong> para buscar palavras-chave em Cargos, Bancas ou Órgãos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificacoes' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
              <Bell className="text-indigo-600 shrink-0" size={20} />
              <h3 className="text-lg font-bold text-slate-800">Preferências de Notificação</h3>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Canais de Notificação */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Canais de Envio</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all group gap-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-indigo-600 transition-colors shrink-0">
                          <Mail size={18} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-700 block">E-mail</span>
                          <span className="text-[10px] text-slate-500 font-medium">Resumos na sua caixa de entrada</span>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={notificationSettings.emailEnabled}
                          onChange={e => updateNotificationSettings({ emailEnabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all group gap-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-indigo-600 transition-colors shrink-0">
                          <Smartphone size={18} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-700 block">Push</span>
                          <span className="text-[10px] text-slate-500 font-medium">Alertas em tempo real</span>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={notificationSettings.pushEnabled}
                          onChange={e => updateNotificationSettings({ pushEnabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Gatilhos de Notificação */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">O que notificar</h4>
                  <div className="space-y-3">
                    {[
                      { id: 'notifyNewExams', label: 'Novos Concursos', desc: 'Editais importados' },
                      { id: 'notifyInterested', label: 'Interessados', desc: 'Atualizações em favoritos' },
                      { id: 'notifyDeadlines', label: 'Prazos', desc: 'Inscrições e provas' }
                    ].map((trigger) => (
                      <label key={trigger.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group">
                        <div className="flex-1 pr-4">
                          <span className="text-sm font-bold text-slate-700 block group-hover:text-indigo-600 transition-colors">{trigger.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{trigger.desc}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings[trigger.id as keyof NotificationSettings] as boolean}
                          onChange={e => updateNotificationSettings({ [trigger.id]: e.target.checked })}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-lg transition-all cursor-pointer shrink-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configurações de Prazo (Slider) */}
              <div className="pt-6 border-t border-slate-100">
                <div className="max-w-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Aviso de Prazos</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Dias de antecedência para alertas de encerramento.</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shrink-0 ml-4">
                      <span className="text-xl font-black text-indigo-600">{notificationSettings.deadlineThresholdDays}</span>
                      <span className="text-[10px] font-black text-indigo-400 ml-1 uppercase">dias</span>
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="1"
                      max="30"
                      step="1"
                      value={notificationSettings.deadlineThresholdDays}
                      onChange={e => updateNotificationSettings({ deadlineThresholdDays: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      <span>1 dia</span>
                      <span>15 dias</span>
                      <span>30 dias</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
