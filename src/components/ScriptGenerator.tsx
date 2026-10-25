import React, { useState } from 'react';
import { Code2, Download, Copy, Check, FileCode, Sliders, Monitor, Dumbbell, ShieldCheck } from 'lucide-react';
import { ScriptTarget } from '../types/qte';
import { SCRIPT_PRESETS, generateScript, ScriptOptions } from '../utils/scripts';

export const ScriptGenerator: React.FC = () => {
  const [target, setTarget] = useState<ScriptTarget>('ahk_v2');
  const [selectedPreset, setSelectedPreset] = useState<string>('eft_gym');
  const [resolution, setResolution] = useState<'4k' | '2k' | '1080p'>('4k');
  const [triggerKey, setTriggerKey] = useState<string>('LMB');
  const [reactionDelay, setReactionDelay] = useState<number>(40);
  const [jitter, setJitter] = useState<number>(10);
  const [pressDuration, setPressDuration] = useState<number>(45);
  const [toggleHotkey, setToggleHotkey] = useState<string>('F2');
  const [calibrateHotkey, setCalibrateHotkey] = useState<string>('F3');
  const [targetColorHex, setTargetColorHex] = useState<string>('#D4D3C5');
  const [copied, setCopied] = useState<boolean>(false);

  // Apply preset
  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = SCRIPT_PRESETS.find((x) => x.id === presetId);
    if (p) {
      setTriggerKey(p.defaultKey === 'LButton' ? 'LMB' : p.defaultKey);
      if (p.triggerColor.startsWith('0x')) {
        setTargetColorHex('#' + p.triggerColor.replace('0x', ''));
      }
    }
  };

  // Determine target coordinates based on resolution
  const getCoordinates = () => {
    if (selectedPreset === 'eft_gym') {
      if (resolution === '4k') return { x: 1920, y: 1560 }; // 4K Hideout Gym Hexagon boundary
      if (resolution === '2k') return { x: 1280, y: 1040 };
      return { x: 960, y: 780 };
    }
    if (resolution === '4k') return { x: 1920, y: 1080 };
    if (resolution === '2k') return { x: 1280, y: 720 };
    return { x: 960, y: 540 };
  };

  const coords = getCoordinates();

  const currentOpts: ScriptOptions = {
    target,
    presetId: selectedPreset,
    triggerKey,
    reactionDelayMs: reactionDelay,
    jitterMs: jitter,
    pressDurationMs: pressDuration,
    toggleHotkey,
    calibrateHotkey,
    targetColorHex,
    tolerance: 18,
    targetX: coords.x,
    targetY: coords.y,
  };

  const scriptCode = generateScript(currentOpts);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = target === 'python' ? 'py' : 'ahk';
    const filename = `eft_gym_autoclicker_${selectedPreset}.${ext}`;
    const blob = new Blob([scriptCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <span>Генератор скриптов для запуска на вашем ПК (AutoHotkey / Python)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Так как браузер изолирован от окон Windows, для игры Escape from Tarkov (EFT) на вашем ПК используется готовый скрипт, отслеживающий появление белого контура гексагона и мгновенно нажимающий ЛКМ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pixel-only (Без внедрения в память)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Preset selection tabs */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Выберите целевой профиль:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCRIPT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                selectedPreset === preset.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-400">{preset.game}</span>
                {selectedPreset === preset.id && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{preset.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Script Language Switcher & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration options */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Параметры скрипта</span>
          </h3>

          {/* Target language */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Платформа / Язык:</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTarget('ahk_v2')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  target === 'ahk_v2'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AHK v2 (Топ)
              </button>
              <button
                type="button"
                onClick={() => setTarget('ahk_v1')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  target === 'ahk_v1'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AHK v1
              </button>
              <button
                type="button"
                onClick={() => setTarget('python')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  target === 'python'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python 3
              </button>
            </div>
          </div>

          {/* Screen Resolution Preset */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Разрешение экрана в игре:</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-400">
                {coords.x}x{coords.y}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setResolution('4k')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  resolution === '4k'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                3840x2160 (4K)
              </button>
              <button
                type="button"
                onClick={() => setResolution('2k')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  resolution === '2k'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                2560x1440 (2K)
              </button>
              <button
                type="button"
                onClick={() => setResolution('1080p')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  resolution === '1080p'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                1920x1080 (FHD)
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              *В EFT на вашем ПК вы также можете в любой момент нажать <kbd className="px-1 bg-slate-800 rounded font-mono text-slate-300">F3</kbd> над гексагоном для точнейшей калибровки.
            </p>
          </div>

          {/* Trigger Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Клавиша нажатия:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['LMB', 'Space', 'E'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTriggerKey(k)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    triggerKey === k
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {k === 'LMB' ? 'ЛКМ (Мышь)' : k}
                </button>
              ))}
            </div>
          </div>

          {/* Hotkeys */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Вкл / Выкл:</label>
              <select
                value={toggleHotkey}
                onChange={(e) => setToggleHotkey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
              >
                <option value="F2">F2</option>
                <option value="F4">F4</option>
                <option value="F6">F6</option>
                <option value="XButton1">Кнопка мыши 4</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Калибровка F3:</label>
              <select
                value={calibrateHotkey}
                onChange={(e) => setCalibrateHotkey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
              >
                <option value="F3">F3</option>
                <option value="F5">F5</option>
                <option value="F7">F7</option>
              </select>
            </div>
          </div>

          {/* Reaction Delay */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Задержка реакции (Delay):</span>
              <span className="font-mono text-cyan-400 font-bold">{reactionDelay} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={reactionDelay}
              onChange={(e) => setReactionDelay(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Jitter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Античит-джиттер (Разброс):</span>
              <span className="font-mono text-emerald-400 font-bold">±{jitter} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="2"
              value={jitter}
              onChange={(e) => setJitter(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* EFT Quick Run Instructions Box */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-400">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Запуск для EFT Спортзала:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>Установите официальный бесплатный <strong>AutoHotkey v2.0+</strong> (с autohotkey.com).</li>
              <li>Скачайте файл <code className="font-mono text-cyan-400">.ahk</code> справа и запустите его.</li>
              <li>В EFT начните упражнение (гантели/штанга). Наведите мышь на белый контур гексагона и нажмите <kbd className="px-1 rounded bg-slate-800 text-white font-mono">F3</kbd>.</li>
              <li>Нажмите <kbd className="px-1 rounded bg-slate-800 text-white font-mono">F2</kbd> — авто-кликер выполнит все подходы без травм и переломов!</li>
            </ol>
          </div>
        </div>

        {/* Right: Code Viewer & Action Bar */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-white">
                {target === 'python'
                  ? 'eft_gym_autoclicker.py'
                  : target === 'ahk_v2'
                  ? 'eft_gym_autoclicker_v2.ahk'
                  : 'eft_gym_autoclicker_v1.ahk'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Копировать код</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать .{target === 'python' ? 'py' : 'ahk'}</span>
              </button>
            </div>
          </div>

          {/* Code Container */}
          <div className="relative">
            <pre className="p-4 bg-slate-950/90 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-cyan-500/30">
              <code>{scriptCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
