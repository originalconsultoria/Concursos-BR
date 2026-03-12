import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Settings as SettingsIcon, Bookmark, User as UserIcon, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import Opportunities from './pages/Opportunities';
import Dashboard from './pages/Dashboard';
import { Logo } from './components/Logo';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Oportunidades' },
  { to: '/dashboard', icon: TrendingUp, label: 'Análise' },
  { to: '/my-exams', icon: Bookmark, label: 'Meus Concursos' },
  { to: '/map', icon: MapIcon, label: 'Mapa' },
  { to: '/settings', icon: SettingsIcon, label: 'Configurações' },
  { to: '/auth', icon: UserIcon, label: 'Perfil' },
];

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="hidden md:flex w-64 bg-slate-900 text-white h-full flex-col">
      <div className="p-6 flex items-center gap-3">
        <Logo className="w-10 h-10" />
        <h1 className="text-xl font-bold tracking-tight">Concursos BR</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
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
    </div>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center pb-safe z-50 px-2 h-16">
      {links.map((link) => {
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
            <Icon size={22} className={clsx(isActive && "scale-110")} />
            <span className={clsx("text-[10px] font-bold tracking-tight uppercase", isActive ? "opacity-100" : "opacity-70")}>{link.label}</span>
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
    </div>
  );
}

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>Página em desenvolvimento...</p>
  </div>
);

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
            <Routes>
              <Route path="/" element={<Opportunities />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-exams" element={<PlaceholderPage title="Meus Concursos" />} />
              <Route path="/map" element={<PlaceholderPage title="Mapa" />} />
              <Route path="/settings" element={<PlaceholderPage title="Configurações" />} />
              <Route path="/auth" element={<PlaceholderPage title="Perfil" />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
