import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Settings as SettingsIcon, Bookmark, User as UserIcon, Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import Opportunities from './pages/Opportunities';
import MyExams from './pages/MyExams';
import MapView from './pages/Map';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { Logo } from './components/Logo';
import { useConcursoStore } from './store';
import { fetchGlobalConcursos } from './services/firebaseSync';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Oportunidades' },
  { to: '/my-exams', icon: Bookmark, label: 'Meus Concursos' },
  { to: '/map', icon: MapIcon, label: 'Mapa' },
  { to: '/settings', icon: SettingsIcon, label: 'Configurações' },
  { to: '/auth', icon: UserIcon, label: 'Perfil' },
];

function SyncStatusIndicator({ className }: { className?: string }) {
  const syncStatus = useConcursoStore((state) => state.syncStatus);
  const user = useConcursoStore((state) => state.user);

  if (!user) return null;

  return (
    <div className={clsx("flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider", className)}>
      {syncStatus === 'syncing' && (
        <>
          <RefreshCw size={14} className="text-indigo-400 animate-spin" />
          <span className="text-slate-400">Sincronizando</span>
        </>
      )}
      {syncStatus === 'synced' && (
        <>
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-slate-400">Sincronizado</span>
        </>
      )}
      {syncStatus === 'error' && (
        <>
          <CloudOff size={14} className="text-rose-400" />
          <span className="text-rose-400">Erro de Sinc.</span>
        </>
      )}
      {syncStatus === 'idle' && (
        <>
          <Cloud size={14} className="text-slate-500" />
          <span className="text-slate-400">Conectado</span>
        </>
      )}
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const user = useConcursoStore((state) => state.user);
  
  const visibleLinks = user ? links.filter(l => l.to !== '/auth') : links;
  
  return (
    <div className="hidden md:flex w-64 bg-slate-900 text-white h-full flex-col">
      <div className="p-6 flex items-center gap-3">
        <Logo className="w-10 h-10" />
        <h1 className="text-xl font-bold tracking-tight">Concursos BR</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors',
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <SyncStatusIndicator />
      </div>
    </div>
  );
}

function BottomNav() {
  const location = useLocation();
  const user = useConcursoStore((state) => state.user);

  const visibleLinks = user ? links.filter(l => l.to !== '/auth') : links;

  const getShortLabel = (label: string) => {
    switch (label) {
      case 'Oportunidades': return 'Início';
      case 'Meus Concursos': return 'Salvos';
      case 'Configurações': return 'Ajustes';
      default: return label;
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center pb-safe z-50 px-1 h-16">
      {visibleLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={clsx(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 relative',
              isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-b-full" />
            )}
            <Icon size={22} className={clsx("transition-transform duration-200", isActive && "scale-110 -translate-y-0.5")} />
            <span className={clsx(
              "text-[9px] sm:text-[10px] font-bold tracking-tight uppercase whitespace-nowrap transition-all duration-200", 
              isActive ? "opacity-100" : "opacity-70"
            )}>
              {getShortLabel(link.label)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-lg text-slate-900 px-4 py-3 sticky top-0 z-50 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <Logo />
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Concursos BR</h1>
      </div>
      <SyncStatusIndicator className="px-0 py-0" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    fetchGlobalConcursos();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 p-0 md:p-8 overflow-y-auto pb-20 md:pb-8">
            <Routes>
              <Route path="/" element={<Opportunities />} />
              <Route path="/my-exams" element={<MyExams />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
