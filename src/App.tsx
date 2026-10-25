import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { QteSimulator } from './components/QteSimulator';
import { AutoBotSettings } from './components/AutoBotSettings';
import { ScreenDetector } from './components/ScreenDetector';
import { ScriptGenerator } from './components/ScriptGenerator';
import { ReactionBenchmark } from './components/ReactionBenchmark';
import { GuideModal } from './components/GuideModal';
import { AutoBotConfig, QteStats } from './types/qte';
import { soundEngine } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Auto-Bot Configuration
  const [botConfig, setBotConfig] = useState<AutoBotConfig>({
    enabled: true,
    reactionDelayMs: 45, // Pro latency by default
    randomJitterMs: 14, // Subtle stealth anti-cheat variance
    targetZonePlacement: 'center',
    humanizeClicks: true,
    pressDurationMs: 45,
    soundEnabled: true,
    hotkey: 'Space',
  });

  // Global Performance Statistics
  const [stats, setStats] = useState<QteStats>({
    totalAttempts: 0,
    perfectHits: 0,
    goodHits: 0,
    misses: 0,
    currentStreak: 0,
    bestStreak: 0,
    reactionTimes: [],
    averageReactionTimeMs: 0,
  });

  // Global Hotkey toggle for bot (e.g. F2 or Space in simulator)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'F2') {
        e.preventDefault();
        setBotConfig((prev) => {
          const nextState = !prev.enabled;
          if (nextState) {
            soundEngine.playTriggerBeep();
          } else {
            soundEngine.playFailBuzz();
          }
          return { ...prev, enabled: nextState };
        });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleToggleBot = () => {
    setBotConfig((prev) => {
      const next = !prev.enabled;
      if (next) {
        soundEngine.playTriggerBeep();
      }
      return { ...prev, enabled: next };
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Top Navigation Contract */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        botEnabled={botConfig.enabled}
        onToggleBot={handleToggleBot}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenGuide={() => setActiveTab('guide')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: Simulator & Auto-Bot */}
        {activeTab === 'simulator' && (
          <div className="space-y-8">
            <QteSimulator
              botConfig={botConfig}
              stats={stats}
              setStats={setStats}
            />

            <AutoBotSettings
              config={botConfig}
              onChange={setBotConfig}
            />
          </div>
        )}

        {/* TAB 2: Screen Detector */}
        {activeTab === 'screen' && (
          <ScreenDetector />
        )}

        {/* TAB 3: Script Generator for Games */}
        {activeTab === 'scripts' && (
          <ScriptGenerator />
        )}

        {/* TAB 4: Reaction Benchmark */}
        {activeTab === 'benchmark' && (
          <ReactionBenchmark />
        )}

        {/* TAB 5: Comprehensive Guide */}
        {activeTab === 'guide' && (
          <GuideModal />
        )}
      </main>

      {/* Clean, quiet footer (no telemetry slop or fake version engines) */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">QTE Auto-Clicker & Reaction Bot</span>
            <span aria-hidden="true">·</span>
            <span>Автонажатие ЛКМ для GTA 5 RP, Radmir, DBD и симуляций реакции</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className="hover:text-slate-200 transition-colors"
            >
              Руководство
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('scripts')}
              className="hover:text-slate-200 transition-colors"
            >
              Скрипты AHK
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('benchmark')}
              className="hover:text-slate-200 transition-colors"
            >
              Тест реакции
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
