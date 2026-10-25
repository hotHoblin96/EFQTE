import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  botEnabled: boolean;
  onToggleBot: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGuide: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  botEnabled,
  onToggleBot,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('simulator');
          }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap flex items-center gap-2.5"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45 shrink-0 inline-block"></span>
          <span>QTE Auto-Clicker</span>
        </a>
      </div>

      {/* Zone 2: 4-5 single-line clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'simulator'
              ? 'text-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Симулятор QTE
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('screen')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'screen'
              ? 'text-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Детектор экрана
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scripts')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'scripts'
              ? 'text-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Скрипты для игр
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('benchmark')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'benchmark'
              ? 'text-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Тест реакции
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'guide'
              ? 'text-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Инструкция
        </button>
      </nav>

      {/* Zone 3: 1 primary action (or sound toggle + main bot toggle) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            soundEngine.enabled = !soundEnabled;
            onToggleSound();
          }}
          title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
          aria-label="Переключить звук"
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleBot}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            botEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              botEnabled ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
          />
          <span>{botEnabled ? 'Бот: АКТИВЕН (ЛКМ)' : 'Бот: ВЫКЛЮЧЕН'}</span>
        </button>
      </div>
    </header>
  );
};
