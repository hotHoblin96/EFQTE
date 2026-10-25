import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Zap, Target, Gauge, Sparkles, SlidersHorizontal, MousePointerClick, Dumbbell } from 'lucide-react';
import { QteMode, AutoBotConfig, QteStats, HitResult } from '../types/qte';
import { soundEngine } from '../utils/audio';

interface QteSimulatorProps {
  botConfig: AutoBotConfig;
  stats: QteStats;
  setStats: React.Dispatch<React.SetStateAction<QteStats>>;
  onAutoClickTriggered?: () => void;
}

export const QteSimulator: React.FC<QteSimulatorProps> = ({
  botConfig,
  stats,
  setStats,
  onAutoClickTriggered,
}) => {
  const [mode, setMode] = useState<QteMode>('eft_hexagon');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hitFeedback, setHitFeedback] = useState<{ text: string; type: HitResult; id: number } | null>(null);
  const [lmbPressed, setLmbPressed] = useState<boolean>(false);
  const [clickEffectPos, setClickEffectPos] = useState<{ x: number; y: number } | null>(null);

  // EFT Hexagon State
  // Scale starts from 2.2 and shrinks down to 1.0 (target)
  const [eftScale, setEftScale] = useState<number>(2.2);
  const eftScaleRef = useRef<number>(2.2);
  const [eftReps, setEftReps] = useState<number>(0);
  const [eftStrengthXp, setEftStrengthXp] = useState<number>(0);
  const [eftEnergy, setEftEnergy] = useState<number>(100);

  // Radial Mode State (DBD)
  const [radialAngle, setRadialAngle] = useState<number>(0);
  const radialAngleRef = useRef<number>(0);
  const [zoneStart, setZoneStart] = useState<number>(120);
  const [zoneWidth, setZoneWidth] = useState<number>(55);
  const [greatWidth, setGreatWidth] = useState<number>(14);

  // Slider Mode State (GTA 5 / Radmir)
  const [sliderPos, setSliderPos] = useState<number>(0);
  const sliderPosRef = useRef<number>(0);
  const [sliderDir, setSliderDir] = useState<number>(1);
  const sliderDirRef = useRef<number>(1);
  const [sliderZoneStart, setSliderZoneStart] = useState<number>(40);
  const [sliderZoneWidth, setSliderZoneWidth] = useState<number>(24);

  // Shrinking Ring State
  const [ringRadius, setRingRadius] = useState<number>(90);
  const ringRadiusRef = useRef<number>(90);

  // Rapid Clicker State (0 to 100)
  const [rapidProgress, setRapidProgress] = useState<number>(40);
  const rapidProgressRef = useRef<number>(40);
  const [cpsCounter, setCpsCounter] = useState<number>(0);

  // Animation frame ref
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const botTriggeredThisCycleRef = useRef<boolean>(false);
  const roundStartTimeRef = useRef<number>(performance.now());
  const rapidClicksWindowRef = useRef<number[]>([]);
  const cuePlayedRef = useRef<boolean>(false);

  // Reset a round for active mode
  const resetRound = useCallback((newMode?: QteMode) => {
    const activeMode = newMode || mode;
    botTriggeredThisCycleRef.current = false;
    cuePlayedRef.current = false;
    roundStartTimeRef.current = performance.now();

    if (activeMode === 'eft_hexagon') {
      eftScaleRef.current = 2.2;
      setEftScale(2.2);
      soundEngine.playWarningCue();
    } else if (activeMode === 'radial') {
      radialAngleRef.current = 0;
      setRadialAngle(0);
      const newStart = 100 + Math.random() * 160;
      setZoneStart(newStart);
      setZoneWidth(45 + Math.random() * 15);
      setGreatWidth(12 + Math.random() * 5);
      soundEngine.playWarningCue();
    } else if (activeMode === 'slider') {
      sliderPosRef.current = 0;
      sliderDirRef.current = 1;
      setSliderPos(0);
      setSliderDir(1);
      const newStart = 30 + Math.random() * 40;
      setSliderZoneStart(newStart);
      setSliderZoneWidth(20 + Math.random() * 12);
      soundEngine.playWarningCue();
    } else if (activeMode === 'shrinking') {
      ringRadiusRef.current = 100;
      setRingRadius(100);
      soundEngine.playWarningCue();
    } else if (activeMode === 'rapid') {
      rapidProgressRef.current = 45;
      setRapidProgress(45);
    }
  }, [mode]);

  // Record Hit Result & Update Stats
  const recordHit = useCallback((result: HitResult, reactionMs: number) => {
    setHitFeedback({
      text:
        result === 'perfect'
          ? mode === 'eft_hexagon'
            ? 'ИДЕАЛЬНЫЙ ПОВТОР! (+0.8 СИЛА)'
            : 'PERFECT! (GREAT)'
          : result === 'good'
          ? mode === 'eft_hexagon'
            ? 'ПОВТОР ВЫПОЛНЕН (+0.4 СИЛА)'
            : 'GOOD (УСПЕХ)'
          : mode === 'eft_hexagon'
          ? 'ПРОМАХ! (РАСТЯЖЕНИЕ МЫШЦ)'
          : 'MISS (ПРОМАХ)',
      type: result,
      id: Date.now(),
    });

    if (result === 'perfect') {
      soundEngine.playSuccessHit(true);
    } else if (result === 'good') {
      soundEngine.playSuccessHit(false);
    } else {
      soundEngine.playFailBuzz();
    }

    setStats((prev) => {
      const isHit = result === 'perfect' || result === 'good';
      const newStreak = isHit ? prev.currentStreak + 1 : 0;
      const newBest = Math.max(prev.bestStreak, newStreak);
      const newReactionTimes =
        isHit && reactionMs > 0 ? [...prev.reactionTimes.slice(-49), reactionMs] : prev.reactionTimes;
      const avgReaction =
        newReactionTimes.length > 0
          ? Math.round(newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length)
          : 0;

      return {
        totalAttempts: prev.totalAttempts + 1,
        perfectHits: prev.perfectHits + (result === 'perfect' ? 1 : 0),
        goodHits: prev.goodHits + (result === 'good' ? 1 : 0),
        misses: prev.misses + (result === 'miss' ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: newBest,
        reactionTimes: newReactionTimes,
        averageReactionTimeMs: avgReaction,
      };
    });
  }, [mode, setStats]);

  // Trigger LMB Click (Manual or Bot)
  const triggerLmbClick = useCallback(
    (source: 'manual' | 'bot' = 'manual') => {
      soundEngine.playMouseClick('down');
      setLmbPressed(true);
      setTimeout(() => {
        soundEngine.playMouseClick('up');
        setLmbPressed(false);
      }, botConfig.pressDurationMs || 45);

      if (source === 'bot' && onAutoClickTriggered) {
        onAutoClickTriggered();
      }

      const now = performance.now();
      const elapsed = Math.round(now - roundStartTimeRef.current);

      if (mode === 'eft_hexagon') {
        // Target boundary is scale = 1.0
        const diff = Math.abs(eftScale - 1.0);
        if (diff <= 0.08) {
          setEftReps((prev) => prev + 1);
          setEftStrengthXp((prev) => +(prev + 0.8).toFixed(1));
          setEftEnergy((prev) => Math.max(0, prev - 4));
          recordHit('perfect', elapsed);
          setTimeout(() => resetRound('eft_hexagon'), 350);
        } else if (diff <= 0.18) {
          setEftReps((prev) => prev + 1);
          setEftStrengthXp((prev) => +(prev + 0.4).toFixed(1));
          setEftEnergy((prev) => Math.max(0, prev - 6));
          recordHit('good', elapsed);
          setTimeout(() => resetRound('eft_hexagon'), 350);
        } else {
          setEftEnergy((prev) => Math.max(0, prev - 12));
          recordHit('miss', elapsed);
          setTimeout(() => resetRound('eft_hexagon'), 450);
        }
      } else if (mode === 'radial') {
        const greatStart = zoneStart;
        const greatEnd = zoneStart + greatWidth;
        const goodStart = zoneStart;
        const goodEnd = zoneStart + zoneWidth;

        if (radialAngle >= greatStart && radialAngle <= greatEnd) {
          recordHit('perfect', elapsed);
          setTimeout(() => resetRound(), 250);
        } else if (radialAngle >= goodStart && radialAngle <= goodEnd) {
          recordHit('good', elapsed);
          setTimeout(() => resetRound(), 250);
        } else {
          recordHit('miss', elapsed);
          setTimeout(() => resetRound(), 350);
        }
      } else if (mode === 'slider') {
        const greatCenter = sliderZoneStart + sliderZoneWidth / 2;
        const isInGreat = Math.abs(sliderPos - greatCenter) <= sliderZoneWidth * 0.2;
        const isInGood = sliderPos >= sliderZoneStart && sliderPos <= sliderZoneStart + sliderZoneWidth;

        if (isInGreat) {
          recordHit('perfect', elapsed);
          setTimeout(() => resetRound(), 250);
        } else if (isInGood) {
          recordHit('good', elapsed);
          setTimeout(() => resetRound(), 250);
        } else {
          recordHit('miss', elapsed);
          setTimeout(() => resetRound(), 350);
        }
      } else if (mode === 'shrinking') {
        const diff = Math.abs(ringRadius - 30);
        if (diff <= 4) {
          recordHit('perfect', elapsed);
          setTimeout(() => resetRound(), 250);
        } else if (diff <= 12) {
          recordHit('good', elapsed);
          setTimeout(() => resetRound(), 250);
        } else {
          recordHit('miss', elapsed);
          setTimeout(() => resetRound(), 350);
        }
      } else if (mode === 'rapid') {
        setRapidProgress((prev) => Math.min(100, prev + 7.5));
        rapidClicksWindowRef.current.push(now);
        const filtered = rapidClicksWindowRef.current.filter((t) => now - t <= 1000);
        rapidClicksWindowRef.current = filtered;
        setCpsCounter(filtered.length);
        if (rapidProgress + 7.5 >= 98) {
          recordHit('perfect', 0);
          setTimeout(() => resetRound(), 600);
        }
      }
    },
    [
      botConfig.pressDurationMs,
      mode,
      onAutoClickTriggered,
      eftScale,
      radialAngle,
      zoneStart,
      greatWidth,
      zoneWidth,
      recordHit,
      resetRound,
      sliderZoneStart,
      sliderZoneWidth,
      sliderPos,
      ringRadius,
      rapidProgress,
    ]
  );

  // Main animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      if (mode === 'eft_hexagon') {
        const next = Math.max(0.7, eftScaleRef.current - 1.15 * dt);
        eftScaleRef.current = next;
        setEftScale(next);

        if (botConfig.enabled && !botTriggeredThisCycleRef.current) {
          const jitter = (Math.random() * 2 - 1) * (botConfig.randomJitterMs || 0);
          const totalDelay = Math.max(0, botConfig.reactionDelayMs + jitter);
          const delayOffset = totalDelay * 0.00115;
          const targetThreshold = 1.0 - delayOffset;

          if (next <= targetThreshold) {
            botTriggeredThisCycleRef.current = true;
            triggerLmbClick('bot');
          }
        }

        if (next <= 0.74 && !botTriggeredThisCycleRef.current) {
          botTriggeredThisCycleRef.current = true;
          recordHit('miss', 0);
          setTimeout(() => resetRound('eft_hexagon'), 450);
        }
      } else if (mode === 'radial') {
        const next = radialAngleRef.current + 180 * dt;
        radialAngleRef.current = next >= 360 ? 360 : next;
        setRadialAngle(radialAngleRef.current);

        if (!cuePlayedRef.current && next >= zoneStart - 40 && next < zoneStart) {
          cuePlayedRef.current = true;
        }

        if (botConfig.enabled && !botTriggeredThisCycleRef.current) {
          let targetAngle = zoneStart + greatWidth / 2;
          if (botConfig.targetZonePlacement === 'early') {
            targetAngle = zoneStart + 2;
          } else if (botConfig.targetZonePlacement === 'random') {
            targetAngle = zoneStart + Math.random() * zoneWidth * 0.8;
          }

          const jitter = (Math.random() * 2 - 1) * (botConfig.randomJitterMs || 0);
          const totalDelay = Math.max(0, botConfig.reactionDelayMs + jitter);
          const delayOffsetAngle = totalDelay * 0.18;

          if (next >= targetAngle + delayOffsetAngle) {
            botTriggeredThisCycleRef.current = true;
            triggerLmbClick('bot');
          }
        }

        if (next >= zoneStart + zoneWidth + 15 && !botTriggeredThisCycleRef.current) {
          botTriggeredThisCycleRef.current = true;
          recordHit('miss', 0);
          setTimeout(() => resetRound(), 350);
        }
      } else if (mode === 'slider') {
        let dir = sliderDirRef.current;
        let next = sliderPosRef.current + dir * 70 * dt;
        if (next >= 100) {
          next = 100;
          dir = -1;
          sliderDirRef.current = -1;
          setSliderDir(-1);
        } else if (next <= 0) {
          next = 0;
          dir = 1;
          sliderDirRef.current = 1;
          setSliderDir(1);
        }
        sliderPosRef.current = next;
        setSliderPos(next);

        if (botConfig.enabled && !botTriggeredThisCycleRef.current) {
          const targetPos = sliderZoneStart + sliderZoneWidth / 2;
          const jitter = (Math.random() * 2 - 1) * (botConfig.randomJitterMs || 0);
          const totalDelay = Math.max(0, botConfig.reactionDelayMs + jitter);
          const delayOffset = totalDelay * 0.07 * dir;

          if (dir > 0 && next >= targetPos + delayOffset && next >= sliderZoneStart) {
            botTriggeredThisCycleRef.current = true;
            triggerLmbClick('bot');
            setTimeout(() => {
              botTriggeredThisCycleRef.current = false;
            }, 600);
          }
        }
      } else if (mode === 'shrinking') {
        const next = Math.max(0, ringRadiusRef.current - 45 * dt);
        ringRadiusRef.current = next;
        setRingRadius(next);

        if (botConfig.enabled && !botTriggeredThisCycleRef.current) {
          const jitter = (Math.random() * 2 - 1) * (botConfig.randomJitterMs || 0);
          const totalDelay = Math.max(0, botConfig.reactionDelayMs + jitter);
          const delayOffsetRadius = totalDelay * 0.045;

          if (next <= 30 - delayOffsetRadius) {
            botTriggeredThisCycleRef.current = true;
            triggerLmbClick('bot');
          }
        }

        if (next <= 12 && !botTriggeredThisCycleRef.current) {
          botTriggeredThisCycleRef.current = true;
          recordHit('miss', 0);
          setTimeout(() => resetRound(), 350);
        }
      } else if (mode === 'rapid') {
        const next = Math.max(0, rapidProgressRef.current - 16 * dt);
        rapidProgressRef.current = next;
        setRapidProgress(next);

        if (botConfig.enabled) {
          const now = performance.now();
          const targetInterval = 1000 / 22;
          if (!botTriggeredThisCycleRef.current || now - roundStartTimeRef.current >= targetInterval) {
            roundStartTimeRef.current = now;
            botTriggeredThisCycleRef.current = true;
            triggerLmbClick('bot');
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isPlaying,
    mode,
    botConfig,
    zoneStart,
    greatWidth,
    zoneWidth,
    sliderZoneStart,
    sliderZoneWidth,
    triggerLmbClick,
    recordHit,
    resetRound,
  ]);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault();
        triggerLmbClick('manual');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerLmbClick]);

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickEffectPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setClickEffectPos(null), 300);
    triggerLmbClick('manual');
  };

  const successRate =
    stats.totalAttempts > 0
      ? Math.round(((stats.perfectHits + stats.goodHits) / stats.totalAttempts) * 100)
      : 0;

  // Hexagon point generation string
  const getHexagonPoints = (radius: number, cx = 100, cy = 100) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i + 30; // Pointy-top / flat-side
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = cx + radius * Math.cos(angleRad);
      const y = cy + radius * Math.sin(angleRad);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-white">Интерактивный симулятор QTE</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              EFT Спортзал 4K
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Точная копия механики тренировки в убежище Escape from Tarkov. Нажмите <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px]">ЛКМ</kbd> при совмещении контуров или включите авто-бота.
          </p>
        </div>

        {/* Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('eft_hexagon');
              resetRound('eft_hexagon');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'eft_hexagon'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>EFT Качалка (Гексагон)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('slider');
              resetRound('slider');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'slider'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>GTA 5 / Radmir Бар</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('radial');
              resetRound('radial');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'radial'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>DBD Круг</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('rapid');
              resetRound('rapid');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'rapid'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Спам кликер</span>
          </button>
        </div>
      </div>

      {/* Main Arena & Virtual Mouse Visualizer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Play Arena */}
        <div
          onClick={handleArenaClick}
          className="lg:col-span-8 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 min-h-[460px] flex flex-col items-center justify-center relative overflow-hidden select-none cursor-pointer transition-colors group"
        >
          {/* Authentic EFT Gym Background for EFT mode */}
          {mode === 'eft_hexagon' && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity filter blur-[0.5px] pointer-events-none"
              style={{
                backgroundImage: 'url(/assets/aistudio/ShareX_z9UDPWlbx2_86bb88fc.jpg)',
              }}
            />
          )}

          {/* Grid background for other modes */}
          {mode !== 'eft_hexagon' && (
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
          )}

          {/* Click ripple effect */}
          {clickEffectPos && (
            <span
              className="absolute w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-ping pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: clickEffectPos.x, top: clickEffectPos.y }}
            />
          )}

          {/* Top In-Game EFT HUD Info */}
          {mode === 'eft_hexagon' && (
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-xs pointer-events-none z-10 font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                <span className="font-bold tracking-wider">УБЕЖИЩЕ: СПОРТЗАЛ (ЖИМ ГАНТЕЛЕЙ)</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>
                  Повторения: <strong className="text-white">{eftReps}/15</strong>
                </span>
                <span>
                  Прокачка Силы: <strong className="text-emerald-400">+{eftStrengthXp}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Floating Hit Feedback Text */}
          {hitFeedback && (
            <div
              key={hitFeedback.id}
              className={`absolute top-12 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg transition-all animate-bounce z-20 ${
                hitFeedback.type === 'perfect'
                  ? 'bg-amber-400 text-slate-950 shadow-amber-400/30'
                  : hitFeedback.type === 'good'
                  ? 'bg-emerald-400 text-slate-950 shadow-emerald-400/30'
                  : 'bg-rose-500 text-white shadow-rose-500/30'
              }`}
            >
              {hitFeedback.text}
            </div>
          )}

          {/* MODE: EFT Hexagon Gym Minigame */}
          {mode === 'eft_hexagon' && (
            <div className="relative w-80 h-80 flex items-center justify-center my-6 z-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
                {/* Fixed Target Hexagon Frame (Bone Off-White #D4D3C5) */}
                <polygon
                  points={getHexagonPoints(56)}
                  fill="#141718"
                  fillOpacity="0.85"
                  stroke="#D4D3C5"
                  strokeWidth="7"
                  strokeLinejoin="miter"
                  className="shadow-xl"
                />

                {/* Shrinking Outer Hexagon */}
                <polygon
                  points={getHexagonPoints(56 * eftScale)}
                  fill="none"
                  stroke={
                    Math.abs(eftScale - 1.0) <= 0.08
                      ? '#FFFFFF'
                      : Math.abs(eftScale - 1.0) <= 0.2
                      ? '#A3E635'
                      : '#8A8D8B'
                  }
                  strokeWidth={Math.abs(eftScale - 1.0) <= 0.08 ? '6' : '3.5'}
                  strokeLinejoin="miter"
                  strokeOpacity={Math.max(0.3, Math.min(1, 2.4 - eftScale * 0.7))}
                  className="transition-none"
                />

                {/* Inside Mouse Icon with Highlighted Left Mouse Button */}
                <g transform="translate(86, 80)">
                  {/* Mouse Body Background */}
                  <rect
                    x="0"
                    y="0"
                    width="28"
                    height="40"
                    rx="14"
                    fill="#262a2d"
                    stroke="#D4D3C5"
                    strokeWidth="1.5"
                  />

                  {/* Left Mouse Button (LMB) - Highlighted! */}
                  <path
                    d="M 14,0 A 14,14 0 0,0 0,14 L 0,18 L 13,18 L 13,0 Z"
                    fill={lmbPressed ? '#ef4444' : '#ECEAE0'}
                    className="transition-colors"
                  />

                  {/* Right Mouse Button (RMB) */}
                  <path
                    d="M 14,0 A 14,14 0 0,1 28,14 L 28,18 L 15,18 L 15,0 Z"
                    fill="#3f454a"
                  />

                  {/* Middle separator line */}
                  <line x1="14" y1="0" x2="14" y2="18" stroke="#141718" strokeWidth="1.5" />

                  {/* Mouse Scroll Wheel */}
                  <rect
                    x="12"
                    y="6"
                    width="4"
                    height="8"
                    rx="2"
                    fill="#141718"
                    stroke="#D4D3C5"
                    strokeWidth="0.8"
                  />
                </g>
              </svg>

              {/* Timing Hint & Distance to target */}
              <div className="absolute -bottom-4 text-center">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                    Math.abs(eftScale - 1.0) <= 0.08
                      ? 'text-amber-400 bg-amber-500/20'
                      : 'text-slate-400'
                  }`}
                >
                  {Math.abs(eftScale - 1.0) <= 0.08
                    ? '🎯 НАЖИМАЙТЕ ЛКМ СЕЙЧАС!'
                    : `Сжатие контура: ${(eftScale * 100).toFixed(0)}% (Цель: 100%)`}
                </span>
              </div>
            </div>
          )}

          {/* MODE: DBD Radial */}
          {mode === 'radial' && (
            <div className="relative w-72 h-72 flex items-center justify-center my-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="78" fill="none" stroke="#1e293b" strokeWidth="12" />
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="12"
                  strokeDasharray={`${(zoneWidth / 360) * 490} 490`}
                  strokeDashoffset={`-${(zoneStart / 360) * 490}`}
                  strokeLinecap="butt"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="12"
                  strokeDasharray={`${(greatWidth / 360) * 490} 490`}
                  strokeDashoffset={`-${(zoneStart / 360) * 490}`}
                  strokeLinecap="butt"
                />
                <line
                  x1="100"
                  y1="100"
                  x2={100 + 74 * Math.cos((radialAngle * Math.PI) / 180)}
                  y2={100 + 74 * Math.sin((radialAngle * Math.PI) / 180)}
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="8" fill="#f87171" />
                <circle cx="100" cy="100" r="3" fill="#ffffff" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  ЛКМ / Пробел
                </span>
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {Math.round(radialAngle)}°
                </span>
              </div>
            </div>
          )}

          {/* MODE: GTA 5 Slider */}
          {mode === 'slider' && (
            <div className="w-full max-w-lg space-y-6 my-8 px-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold text-slate-300">
                  Рыбалка / Качалка (GTA V RP / Radmir)
                </span>
                <p className="text-[11px] text-slate-400">
                  Нажмите ЛКМ когда красный бегунок находится в зеленой зоне
                </p>
              </div>

              <div className="relative h-12 bg-slate-950 rounded-xl border border-slate-700/80 overflow-hidden shadow-inner flex items-center">
                <div
                  className="absolute top-0 bottom-0 bg-emerald-500/80 border-x-2 border-emerald-300 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  style={{
                    left: `${sliderZoneStart}%`,
                    width: `${sliderZoneWidth}%`,
                  }}
                >
                  <div className="w-1.5 h-full bg-amber-300 shadow-md" />
                </div>

                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-rose-500 shadow-lg shadow-rose-500/50 z-10 transition-none rounded-sm -translate-x-1/2"
                  style={{ left: `${sliderPos}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>0%</span>
                <span className="text-emerald-400 font-semibold">
                  Цель: {Math.round(sliderZoneStart)}% - {Math.round(sliderZoneStart + sliderZoneWidth)}%
                </span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* MODE: Rapid Clicker */}
          {mode === 'rapid' && (
            <div className="w-full max-w-md space-y-6 my-6 px-4">
              <div className="text-center space-y-1">
                <span className="text-sm font-semibold text-white">Перетягивание / Спам ЛКМ</span>
                <p className="text-xs text-slate-400">
                  Удерживайте полосу на 100% быстрыми кликами ЛКМ
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-6 w-full bg-slate-950 rounded-full border border-slate-700 overflow-hidden p-1 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      rapidProgress > 75
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        : rapidProgress > 30
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                        : 'bg-gradient-to-r from-rose-600 to-rose-400'
                    }`}
                    style={{ width: `${rapidProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Сила: {Math.round(rapidProgress)}%</span>
                  <span className="text-cyan-400 font-bold">{cpsCounter} CPS (Кликов/сек)</span>
                </div>
              </div>
            </div>
          )}

          {/* Arena Bottom Instruction Bar */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400 z-10">
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
              <span>Кликните в любой области арены для симуляции нажатия ЛКМ</span>
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetRound();
                }}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сброс</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlaying ? 'Пауза' : 'Продолжить'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Real-time Stats & Virtual Mouse Visualizer */}
        <div className="lg:col-span-4 space-y-4">
          {/* Virtual Mouse Visualizer Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Индикатор мыши (ЛКМ)
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold transition-colors ${
                  lmbPressed
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/50'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {lmbPressed ? 'CLICK [LMB]' : 'IDLE'}
              </span>
            </div>

            {/* Mouse Graphic */}
            <div className="flex justify-center py-2">
              <div className="relative w-28 h-40 bg-slate-800/90 rounded-t-[38px] rounded-b-[34px] border-2 border-slate-700 shadow-xl p-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-1 h-16">
                  {/* Left Mouse Button (LMB) */}
                  <div
                    className={`rounded-tl-[32px] rounded-tr-sm rounded-bl-sm rounded-br-sm border transition-all flex flex-col items-center justify-center cursor-pointer ${
                      lmbPressed
                        ? 'bg-rose-500 text-white border-rose-300 shadow-md shadow-rose-500/60 scale-[0.98]'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerLmbClick('manual');
                    }}
                  >
                    <span className="text-[11px] font-bold">ЛКМ</span>
                    <span className="text-[9px] opacity-75 font-mono">LMB</span>
                  </div>

                  {/* Right Mouse Button (RMB) */}
                  <div className="bg-slate-700/50 rounded-tr-[32px] rounded-tl-sm rounded-bl-sm rounded-br-sm border border-slate-600/50 flex flex-col items-center justify-center opacity-60">
                    <span className="text-[11px] font-bold text-slate-400">ПКМ</span>
                    <span className="text-[9px] text-slate-500 font-mono">RMB</span>
                  </div>
                </div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3.5 h-7 bg-slate-900 rounded-full border border-slate-600 flex items-center justify-center">
                  <div className="w-1.5 h-3 bg-cyan-400/80 rounded-full" />
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    EFT SENSOR
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Авто-бот мгновенно нажимает ЛКМ в момент совпадения внешнего гексагона с рамкой.
            </p>
          </div>

          {/* Stats Summary Panel */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Результаты тренировки
              </span>
              <span className="text-xs font-mono font-semibold text-cyan-400">
                {successRate}% Успех
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Идеально (Great)</span>
                <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                  {stats.perfectHits}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Успешно (Good)</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                  {stats.goodHits}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Промахи</span>
                <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                  {stats.misses}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Серия повторений</span>
                <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                  {stats.currentStreak}
                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                    (Рекорд: {stats.bestStreak})
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Средняя задержка клика</span>
                <span className="text-xs text-slate-500">
                  {botConfig.enabled ? 'С учетом настроек бота' : 'Ваша физическая реакция'}
                </span>
              </div>
              <span className="text-base font-bold font-mono text-white tabular-nums">
                {stats.averageReactionTimeMs} ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
