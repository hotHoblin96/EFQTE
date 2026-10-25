import React from 'react';
import { Sliders, Shield, Zap, Sparkles, Volume2 } from 'lucide-react';
import { AutoBotConfig, HitPlacement } from '../types/qte';

interface AutoBotSettingsProps {
  config: AutoBotConfig;
  onChange: (updater: (prev: AutoBotConfig) => AutoBotConfig) => void;
}

export const AutoBotSettings: React.FC<AutoBotSettingsProps> = ({ config, onChange }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Параметры автонажатия ЛКМ (Auto-Bot)</h3>
          </div>
          <p className="text-xs text-slate-400">
            Точная настройка времени отклика, антидетект-джиттера и попадания в зону QTE
          </p>
        </div>

        {/* Big Toggle Switch */}
        <button
          type="button"
          onClick={() => onChange((prev) => ({ ...prev, enabled: !prev.enabled }))}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 border ${
            config.enabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              config.enabled ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
          />
          <span>{config.enabled ? 'Автонажатие ЛКМ: ВКЛ' : 'Автонажатие ЛКМ: ВЫКЛ'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Reaction Delay */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Задержка реакции (Delay)</span>
            </span>
            <span className="font-mono font-bold text-cyan-400 tabular-nums">
              {config.reactionDelayMs} ms
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="250"
            step="5"
            value={config.reactionDelayMs}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, reactionDelayMs: Number(e.target.value) }))
            }
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 ms (Бот)</span>
            <span>60 ms (Pro)</span>
            <span>130 ms (Человек)</span>
            <span>250 ms</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            0 ms — мгновенное попадание в Great зону. При 60–100 ms выглядит максимально натурально для логов игры.
          </p>
        </div>

        {/* 2. Jitter / Anti-detection */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Рандомизация (Джиттер)</span>
            </span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              ±{config.randomJitterMs} ms
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="40"
            step="2"
            value={config.randomJitterMs}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, randomJitterMs: Number(e.target.value) }))
            }
            className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 ms (Точный)</span>
            <span>±15 ms (Рекомендуется)</span>
            <span>±40 ms</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Добавляет случайный разброс времени каждого клика, чтобы серверный античит не заподозрил автоматизацию.
          </p>
        </div>

        {/* 3. Placement inside zone */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Точка входа в зону</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {(
              [
                { id: 'center', label: 'Центр (Great)' },
                { id: 'early', label: 'Начало (Safe)' },
                { id: 'random', label: 'Случайная' },
              ] as { id: HitPlacement; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onChange((prev) => ({ ...prev, targetZonePlacement: opt.id }))
                }
                className={`py-2 px-1 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                  config.targetZonePlacement === opt.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            «Центр» целится в самое сердце Great-зоны. «Начало» жмет сразу при касании первой границы.
          </p>
        </div>
      </div>

      {/* Secondary Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Press Duration (LMB down time) */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">
              Длительность зажатия ЛКМ
            </span>
            <span className="text-[11px] text-slate-400">
              Время удержания кнопки мыши перед отпусканием
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="20"
              max="120"
              step="5"
              value={config.pressDurationMs}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, pressDurationMs: Number(e.target.value) }))
              }
              className="w-24 accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono font-semibold text-white w-12 text-right">
              {config.pressDurationMs} ms
            </span>
          </div>
        </div>

        {/* Audio feedback */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-slate-300 block">
                Звук механического клика
              </span>
              <span className="text-[11px] text-slate-400">
                Имитирует тактильный щелчок микропереключателя мыши
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              config.soundEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {config.soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}
          </button>
        </div>
      </div>
    </div>
  );
};
