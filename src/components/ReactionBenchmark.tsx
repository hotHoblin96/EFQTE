import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Timer, Zap, Trophy, RotateCcw, MousePointerClick, Activity } from 'lucide-react';
import { soundEngine } from '../utils/audio';

type BenchmarkState = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export const ReactionBenchmark: React.FC = () => {
  const [state, setState] = useState<BenchmarkState>('idle');
  const [lastTimeMs, setLastTimeMs] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const startTest = useCallback(() => {
    setState('waiting');
    setLastTimeMs(null);

    // Random wait between 1.5s and 4.5s
    const delay = 1500 + Math.random() * 3000;

    timerRef.current = window.setTimeout(() => {
      setState('ready');
      startTimeRef.current = performance.now();
      soundEngine.playTriggerBeep();
    }, delay);
  }, []);

  const handleClickArena = () => {
    soundEngine.playMouseClick('down');
    setTimeout(() => soundEngine.playMouseClick('up'), 40);

    if (state === 'idle') {
      startTest();
    } else if (state === 'waiting') {
      // Clicked too early!
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setState('early');
      soundEngine.playFailBuzz();
    } else if (state === 'ready') {
      // Good hit
      const diff = Math.round(performance.now() - startTimeRef.current);
      setLastTimeMs(diff);
      setHistory((prev) => [diff, ...prev.slice(0, 9)]);
      setState('result');
      soundEngine.playSuccessHit(diff < 200);
    } else if (state === 'result' || state === 'early') {
      startTest();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const averageMs =
    history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;
  const bestMs = history.length > 0 ? Math.min(...history) : null;

  const getRank = (ms: number) => {
    if (ms <= 30) return { title: '🤖 Авто-Бот (Нечеловеческая)', color: 'text-rose-400' };
    if (ms < 160) return { title: '⚡ Киберспортсмен (Godlike)', color: 'text-amber-400' };
    if (ms < 210) return { title: '🎯 Отличная реакция (Pro)', color: 'text-emerald-400' };
    if (ms < 270) return { title: '👤 Среднестатистическая норма', color: 'text-cyan-400' };
    return { title: '🐢 Замедленная реакция', color: 'text-slate-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Timer className="w-5 h-5 text-cyan-400" />
          <span>Тест скорости реакции: Человек vs Авто-бот</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Проверьте время вашей физической реакции на ЛКМ и сравните с авто-кликером.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Reaction Test Box */}
        <div
          onClick={handleClickArena}
          className={`lg:col-span-8 rounded-2xl min-h-[380px] p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-150 border relative overflow-hidden ${
            state === 'idle'
              ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              : state === 'waiting'
              ? 'bg-rose-950/40 border-rose-800 text-rose-200'
              : state === 'ready'
              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-2xl shadow-emerald-500/40'
              : state === 'early'
              ? 'bg-amber-950/40 border-amber-700 text-amber-200'
              : 'bg-slate-900/80 border-cyan-500/40 text-white'
          }`}
        >
          {state === 'idle' && (
            <div className="space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <MousePointerClick className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Кликните ЛКМ для старта</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Дождитесь появления зеленого экрана и как можно быстрее нажмите ЛКМ!
              </p>
            </div>
          )}

          {state === 'waiting' && (
            <div className="space-y-3">
              <div className="w-4 h-4 rounded-full bg-rose-500 animate-ping mx-auto" />
              <h3 className="text-xl font-bold text-rose-200">ЖДИТЕ ЗЕЛЕНОГО СИГНАЛА...</h3>
              <p className="text-xs text-rose-300/80">Не нажимайте раньше времени</p>
            </div>
          )}

          {state === 'ready' && (
            <div className="space-y-2">
              <h3 className="text-3xl font-extrabold tracking-wider text-slate-950 animate-pulse">
                ЖМИТЕ ЛКМ СЕЙЧАС!
              </h3>
              <p className="text-xs font-semibold text-slate-900">КЛИКНИТЕ ПРЯМО СЕЙЧАС</p>
            </div>
          )}

          {state === 'early' && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-amber-300">Слишком рано!</h3>
              <p className="text-xs text-amber-200/80">
                Вы нажали до появления зеленого экрана. Кликните чтобы попробовать снова.
              </p>
            </div>
          )}

          {state === 'result' && lastTimeMs !== null && (
            <div className="space-y-3">
              <div className="text-5xl font-extrabold font-mono text-cyan-400 tabular-nums">
                {lastTimeMs} ms
              </div>
              <div className="text-sm font-semibold">{getRank(lastTimeMs).title}</div>
              <p className="text-xs text-slate-400">Кликните чтобы повторить попытку</p>
            </div>
          )}
        </div>

        {/* Comparison & Stats Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Сравнение задержек
            </h3>

            {/* Benchmark bars */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-rose-400 font-semibold">⚡ Авто-Бот QTE</span>
                  <span className="font-mono text-white">0 – 15 ms</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-rose-500 rounded-full w-[8%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-400 font-semibold">🏆 Киберспортсмен</span>
                  <span className="font-mono text-white">~140 ms</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-amber-400 rounded-full w-[45%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-400 font-semibold">👤 Средний человек</span>
                  <span className="font-mono text-white">~220 ms</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-cyan-400 rounded-full w-[70%]" />
                </div>
              </div>

              {averageMs && (
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400 font-bold">🎯 Ваш средний результат</span>
                    <span className="font-mono text-emerald-400 font-bold">{averageMs} ms</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, (averageMs / 300) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* History Table */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Последние попытки:</span>
                {bestMs && (
                  <span className="text-amber-400 font-mono">Лучший: {bestMs} ms</span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1.5 font-mono text-xs text-center">
                {history.length === 0 ? (
                  <div className="col-span-5 text-[11px] text-slate-500 py-2">
                    Тест еще не проводился
                  </div>
                ) : (
                  history.slice(0, 5).map((t, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      {t}ms
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
