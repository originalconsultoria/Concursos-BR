import React, { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { useConcursoStore } from '../store';
import { LogIn, LogOut, User as UserIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchGlobalConcursos } from '../services/firebaseSync';

export const UserAuth: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const user = useConcursoStore((state) => state.user);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isFirebaseConfigured) {
    if (compact) return null;
    return (
      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center space-x-2 text-amber-500 mb-2">
          <AlertTriangle size={16} />
          <span className="text-xs font-medium">Firebase não configurado</span>
        </div>
        <p className="text-[10px] text-slate-500">
          Configure as variáveis de ambiente no AI Studio para habilitar a sincronização.
        </p>
      </div>
    );
  }

  if (user) {
    if (compact) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden">
            {user.displayName ? (
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=4f46e5&color=fff`} alt={user.displayName} />
            ) : (
              <UserIcon size={16} />
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      );
    }

    return (
      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden">
            {user.displayName ? (
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=4f46e5&color=fff`} alt={user.displayName} />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.displayName || 'Usuário'}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center justify-center p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        title="Entrar com Google"
      >
        <LogIn size={18} />
      </button>
    );
  }

  return (
    <div className="mt-auto p-4 border-t border-slate-800">
      <button
        onClick={handleLogin}
        className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium"
      >
        <LogIn size={20} />
        <span>Entrar com Google</span>
      </button>
      <p className="text-[10px] text-slate-500 mt-2 text-center">
        Sincronize seus dados entre dispositivos
      </p>
    </div>
  );
};
