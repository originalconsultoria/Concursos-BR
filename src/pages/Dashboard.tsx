import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie
} from 'recharts';
import { useConcursoStore } from '../store';
import { calculateScore } from '../utils/scoring';
import { 
  TrendingUp, Target, Award, CheckCircle2, 
  AlertCircle, Star, Briefcase, MapPin 
} from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

export default function Dashboard() {
  const { concursos, scoringRules, userProfileScoring } = useConcursoStore();

  const scoredConcursos = useMemo(() => {
    return concursos
      .filter(c => c.institution !== 'Carregando...')
      .map(c => ({
        ...c,
        score: calculateScore(c, scoringRules, userProfileScoring)
      }));
  }, [concursos, scoringRules, userProfileScoring]);

  const stats = useMemo(() => {
    const interested = scoredConcursos.filter(c => c.interest_status === 'interested');
    const favorites = scoredConcursos.filter(c => c.is_favorite);
    const avgScore = scoredConcursos.length > 0 
      ? scoredConcursos.reduce((acc, c) => acc + c.score, 0) / scoredConcursos.length 
      : 0;
    const topScore = scoredConcursos.length > 0 
      ? Math.max(...scoredConcursos.map(c => c.score)) 
      : 0;

    return {
      total: scoredConcursos.length,
      interested: interested.length,
      favorites: favorites.length,
      avgScore: Math.round(avgScore),
      topScore
    };
  }, [scoredConcursos]);

  const suitabilityData = useMemo(() => {
    const esferas = ['Federal', 'Estadual', 'Municipal'];
    return esferas.map(esfera => {
      const filtered = scoredConcursos.filter(c => c.esfera === esfera);
      const avg = filtered.length > 0 
        ? filtered.reduce((acc, c) => acc + c.score, 0) / filtered.length 
        : 0;
      return {
        subject: esfera,
        A: Math.round(avg),
        fullMark: 100
      };
    });
  }, [scoredConcursos]);

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: '0-20', min: 0, max: 20 },
      { name: '21-40', min: 21, max: 40 },
      { name: '41-60', min: 41, max: 60 },
      { name: '61-80', min: 61, max: 80 },
      { name: '81-100', min: 81, max: 100 },
    ];

    return ranges.map(range => ({
      name: range.name,
      count: scoredConcursos.filter(c => c.score >= range.min && c.score <= range.max).length
    }));
  }, [scoredConcursos]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4 md:px-0">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Interessados', value: stats.interested, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Favoritos', value: stats.favorites, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Score Médio', value: stats.avgScore, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Melhor Match', value: stats.topScore, icon: Award, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Suitability Radar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Target className="text-indigo-600" size={20} />
            Compatibilidade por Esfera
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={suitabilityData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Suitability"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">
            Baseado na média de pontuação dos concursos em cada esfera governamental.
          </p>
        </motion.div>

        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="text-rose-600" size={20} />
            Distribuição de Match
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">
            Quantidade de concursos por faixa de pontuação de compatibilidade.
          </p>
        </motion.div>
      </div>

      {/* Top Opportunities */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-600" size={20} />
          Melhores Oportunidades Atuais
        </h3>
        <div className="space-y-4">
          {scoredConcursos
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((concurso, i) => (
              <div key={concurso.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{concurso.institution}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} /> {concurso.location}
                      <span className="mx-1">•</span>
                      <Briefcase size={12} /> {concurso.board}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-indigo-600">{concurso.score}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
