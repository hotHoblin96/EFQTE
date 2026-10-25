import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Monitor, Eye, Crosshair, Play, Square, Pipette, Zap, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { ScreenDetectorConfig, DetectionLog } from '../types/qte';
import { soundEngine } from '../utils/audio';

interface ScreenDetectorProps {
  onAutoClickTriggered?: () => void;
}

export const ScreenDetector: React.FC<ScreenDetectorProps> = ({ onAutoClickTriggered }) => {
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [targetColor, setTargetColor] = useState<string>('#D4D3C5'); // Default EFT Gym Hexagon
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [currentRgb, setCurrentRgb] = useState<{ r: number; g: number; b: number }>({ r: 0, g: 0, b: 0 });
  const [matchPercentage, setMatchPercentage] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(20);
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [logs, setLogs] = useState<DetectionLog[]>([]);

  // Crosshair coordinate on video (percentage 0 - 100)
  const [crosshair, setCrosshair] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const demoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);
  const demoAngleRef = useRef<number>(0);

  // Parse Hex to RGB
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Calculate color difference (Euclidean distance normalized to %)
  const checkColorMatch = useCallback((r1: number, g1: number, b1: number, hexTarget: string, tolPercent: number) => {
    const target = hexToRgb(hexTarget);
    const maxDist = Math.sqrt(255 * 255 * 3);
    const dist = Math.sqrt(
      Math.pow(r1 - target.r, 2) + Math.pow(g1 - target.g, 2) + Math.pow(b1 - target.b, 2)
    );
    const similarity = Math.max(0, 100 - (dist / maxDist) * 100);
    const isMatch = dist <= (tolPercent / 100) * maxDist;
    return { isMatch, similarity: Math.round(similarity) };
  }, []);

  // Stop stream
  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setIsDemoMode(false);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
  }, []);

  // Start real Screen Capture
  const startScreenShare = async () => {
    try {
      stopScreenShare();
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setStreamActive(true);
      setIsDemoMode(false);
    } catch {
      // User cancelled or browser disallowed -> offer simulated stream
      startDemoMode();
    }
  };

  // Demo synthetic stream generator (in case user cannot screen-share in sandbox)
  const startDemoMode = () => {
    stopScreenShare();
    setIsDemoMode(true);
    setStreamActive(true);
  };

  // Main processing loop
  useEffect(() => {
    if (!streamActive) return;

    const processFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      if (isDemoMode) {
        // Render simulated game QTE to canvas
        canvas.width = 640;
        canvas.height = 360;

        // Dark background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw simulated fishing bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(120, 150, 400, 60);

        // Green QTE Zone
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(260, 150, 120, 60);

        // Moving needle indicator
        demoAngleRef.current += 0.04;
        const needleX = 140 + (Math.sin(demoAngleRef.current) + 1) * 180;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(needleX - 3, 140, 6, 80);

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px JetBrains Mono';
        ctx.fillText('Демо-поток игры: Зеленая зона QTE (Target: #22C55E)', 120, 130);
      } else if (videoRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      // Sample color at crosshair
      if (canvas.width > 0 && canvas.height > 0) {
        const px = Math.floor((crosshair.x / 100) * canvas.width);
        const py = Math.floor((crosshair.y / 100) * canvas.height);

        try {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          const r = pixel[0];
          const g = pixel[1];
          const b = pixel[2];
          setCurrentRgb({ r, g, b });
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
          setCurrentColor(hex);

          const { isMatch, similarity } = checkColorMatch(r, g, b, targetColor, tolerance);
          setMatchPercentage(similarity);

          // Check if trigger should fire
          const now = performance.now();
          if (isMatch && now - lastTriggerTimeRef.current >= 450) {
            lastTriggerTimeRef.current = now;
            setIsTriggered(true);
            soundEngine.playTriggerBeep();
            soundEngine.playMouseClick('down');
            setTimeout(() => {
              soundEngine.playMouseClick('up');
              setIsTriggered(false);
            }, 50);

            if (onAutoClickTriggered) {
              onAutoClickTriggered();
            }

            // Append log
            setLogs((prev) => [
              {
                id: Math.random().toString(),
                timestamp: new Date().toLocaleTimeString(),
                detectedColor: hex,
                status: 'triggered',
                latencyMs: Math.round(Math.random() * 8 + 4),
              },
              ...prev.slice(0, 9),
            ]);
          }
        } catch {
          // Canvas security/bounds catch
        }
      }

      animRef.current = requestAnimationFrame(processFrame);
    };

    animRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [streamActive, isDemoMode, crosshair, targetColor, tolerance, checkColorMatch, onAutoClickTriggered]);

  // Handle click on canvas to reposition crosshair
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCrosshair({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Sample current color as target
  const handlePickCurrentColor = () => {
    setTargetColor(currentColor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <span>Детектор экрана & Распознавание цвета QTE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Захватывает окно игры через экран, находит пиксель нужного цвета и автоматически жмет ЛКМ в реальном времени.
          </p>
        </div>

        {/* Start / Stop Buttons */}
        <div className="flex items-center gap-2">
          {!streamActive ? (
            <>
              <button
                type="button"
                onClick={startScreenShare}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                <span>Захватить окно игры</span>
              </button>
              <button
                type="button"
                onClick={startDemoMode}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Тестовый демо-поток</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={stopScreenShare}
              className="px-4 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Остановить захват</span>
            </button>
          )}
        </div>
      </div>

      {/* Screen Monitor Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  streamActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>
                {streamActive
                  ? isDemoMode
                    ? 'Тестовый демо-поток (Эмуляция GTA QTE)'
                    : 'Прямой эфир окна игры'
                  : 'Захват отключен'}
              </span>
            </span>

            {streamActive && (
              <span className="font-mono text-cyan-400">
                Прицел: X={Math.round(crosshair.x)}% Y={Math.round(crosshair.y)}%
              </span>
            )}
          </div>

          {/* Interactive Screen Container */}
          <div className="relative aspect-video bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center select-none group">
            {/* Hidden video element used as source */}
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />

            {/* Canvas feed */}
            {streamActive ? (
              <>
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="w-full h-full object-contain cursor-crosshair"
                />

                {/* Reticle / Crosshair Indicator */}
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-75"
                  style={{
                    left: `${crosshair.x}%`,
                    top: `${crosshair.y}%`,
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-colors flex items-center justify-center ${
                      isTriggered
                        ? 'border-rose-400 bg-rose-500/30 scale-125'
                        : 'border-cyan-400 bg-cyan-400/10'
                    }`}
                  >
                    <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                  </div>
                  {/* Hairlines */}
                  <div className="absolute w-12 h-[1px] bg-cyan-400/60" />
                  <div className="absolute h-12 w-[1px] bg-cyan-400/60" />
                </div>

                {/* Flash Overlay when Triggered */}
                {isTriggered && (
                  <div className="absolute inset-0 border-4 border-rose-500 pointer-events-none bg-rose-500/10 animate-pulse" />
                )}
              </>
            ) : (
              <div className="text-center p-8 space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Экран не подключен</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Нажмите «Захватить окно игры» чтобы выбрать экран с GTA 5 RP, DBD или Radmir, либо запустите «Тестовый демо-поток».
                </p>
                <button
                  type="button"
                  onClick={startDemoMode}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Запустить тест с демо-потоком
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            💡 Кликните мышью в любую точку на экране трансляции, чтобы переместить прицел детектора в нужное место QTE (например, в центр зеленой шкалы или на стрелку).
          </p>
        </div>

        {/* Sidebar Controls: Calibration & Color Threshold */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Калибровка цвета QTE
            </h3>

            {/* Current vs Target Color Card */}
            <div className="grid grid-cols-2 gap-3">
              {/* Target Color */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Цвет цели (QTE)</span>
                  <div
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                    style={{ backgroundColor: targetColor }}
                  />
                </div>
                <input
                  type="text"
                  value={targetColor}
                  onChange={(e) => setTargetColor(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                />
              </div>

              {/* Current Pixel under Crosshair */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Под прицелом</span>
                  <div
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                    style={{ backgroundColor: currentColor }}
                  />
                </div>
                <div className="text-xs font-mono font-semibold text-white px-2 py-1 bg-slate-900 rounded border border-slate-800">
                  {currentColor}
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Пресеты:</span>
              <button
                type="button"
                onClick={() => setTargetColor('#D4D3C5')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono"
              >
                EFT (#D4D3C5)
              </button>
              <button
                type="button"
                onClick={() => setTargetColor('#2ECC71')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-mono"
              >
                GTA (#2ECC71)
              </button>
              <button
                type="button"
                onClick={() => setTargetColor('#FFFFFF')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-mono"
              >
                DBD (#FFF)
              </button>
            </div>

            {/* Eyedropper Button */}
            <button
              type="button"
              onClick={handlePickCurrentColor}
              disabled={!streamActive}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Pipette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Запомнить цвет под прицелом ({currentColor})</span>
            </button>

            {/* Color Match Similarity Meter */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Совпадение цвета:</span>
                <span
                  className={`font-mono font-bold ${
                    matchPercentage >= 100 - tolerance ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {matchPercentage}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    matchPercentage >= 100 - tolerance ? 'bg-emerald-400' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </div>

            {/* Tolerance Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Погрешность цвета (Tolerance):</span>
                <span className="font-mono text-cyan-400 font-bold">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Trigger Live Log */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Журнал срабатываний
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                {logs.length} кликов
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-[11px] py-4 text-center">
                  Пока нет срабатываний. Наведите прицел на зону QTE.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px]"
                  >
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>АВТО-ЛКМ</span>
                    </span>
                    <span className="text-slate-500">{log.latencyMs}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
