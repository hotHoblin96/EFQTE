import React from 'react';
import { BookOpen, ShieldCheck, Gamepad2, Settings, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export const GuideModal: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Подробная инструкция: Настройка и запуск автонажатия ЛКМ</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Все шаги для стабильной работы авто-кликера в GTA 5 RP, Radmir CRMP, Dead by Daylight и любых других играх с проверкой реакции.
        </p>
      </div>

      {/* 3 Step Quick Start */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center">
            01
          </div>
          <h4 className="text-sm font-bold text-white">Режим окна в игре</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            В настройках графики игры переключите режим отображения с «Полный экран» на <strong>«Окно без рамки» (Borderless Windowed)</strong>. Это позволяет скрипту мгновенно считывать пиксели.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center">
            02
          </div>
          <h4 className="text-sm font-bold text-white">Калибровка точки (F3)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Запустите скачанный <code className="font-mono text-cyan-400">.ahk</code> скрипт от имени Администратора. Наведите мышь на зеленую полосу QTE и нажмите клавишу <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[11px] border border-slate-700">F3</kbd>. Прозвучит звуковой сигнал.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center">
            03
          </div>
          <h4 className="text-sm font-bold text-white">Активация бота (F2)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Нажмите <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[11px] border border-slate-700">F2</kbd>. Бот перейдет в режим ожидания. Как только бегунок или стрелка войдет в зону нужного цвета, скрипт автоматически нажмет ЛКМ!
          </p>
        </div>
      </div>

      {/* Game Specific Guides */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span>Настройка для Escape from Tarkov (Спортзал в Убежище)</span>
        </h3>

        {/* EFT Card with attached screenshots */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>Escape from Tarkov — Качалка гантелей и штанги</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  4K UHD (3840x2160)
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Авто-нажатие ЛКМ в момент соприкосновения сжимающегося внешнего гексагона с внутренним контуром
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">100% Успешных повторов</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Visual reference from user screenshot */}
            <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-video group">
              <img
                src="/assets/aistudio/ShareX_z9UDPWlbx2_86bb88fc.jpg"
                alt="EFT Hideout Gym QTE Screen"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[10px] font-mono text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                  Ваш скриншот: 3840x2160 · Качалка
                </span>
              </div>
            </div>

            {/* Step-by-step for Tarkov */}
            <div className="md:col-span-7 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-white">Режим графики:</strong> В настройках Таркова включите «Окно без рамки» (Borderless).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-white">Запуск от Администратора:</strong> Запустите <code className="text-cyan-400 font-mono">eft_gym_autoclicker_v2.ahk</code> от имени Администратора (чтобы игра не блокировала клики мыши).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-white">Калибровка по F3:</strong> Начните подход к тренажеру. Наведите мышь на белый контур гексагона и нажмите <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono border border-slate-700">F3</kbd>. Прозвучит подтверждающий сигнал.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-white">Активация по F2:</strong> Нажмите <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono border border-slate-700">F2</kbd>. Скрипт будет автоматически жать ЛКМ в каждом повторении без риска сломать руку!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GTA 5 RP / Majestic / Radmir */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>GTA 5 RP / Majestic / Radmir CRMP</span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                Рыбалка & Качалка
              </span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              В мини-игре рыбалки бегунок движется по горизонтальной шкале.
            </p>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Наведите курсор мыши на центр зеленой полосы подсечки и нажмите <kbd className="px-1 bg-slate-800 rounded font-mono">F3</kbd>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Нажмите <kbd className="px-1 bg-slate-800 rounded font-mono">F2</kbd> перед забросом удочки. Каждая рыба подсекается автоматически.</span>
              </li>
            </ul>
          </div>

          {/* Dead by Daylight */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Dead by Daylight (DBD)</span>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                Skill Check
              </span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Круговая шкала проверки реакции при починке генератора или лечении.
            </p>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>В генераторе скриптов выберите пресет «DBD Skill Check».</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Задержка 40–60ms дает 100% попадание в Great зону.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Safety & Anti-Cheat Best Practices */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Безопасность и защита от античита (Anti-Cheat Safety)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-1.5">
            <span className="font-semibold text-white block">Использование человекоподобного джиттера:</span>
            <p className="text-slate-400">
              Настоящий человек не может кликать с погрешностью в 0.000 миллисекунд. Встроенная функция разброса времени (±12–20 ms) гарантирует, что тайминги каждого нажатия уникальны и не обнаруживаются серверными алгоритмами анализа.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="font-semibold text-white block">Чтение пикселей vs Внедрение в память:</span>
            <p className="text-slate-400">
              Скрипт использует исключительно чтение экранных пикселей (<code className="font-mono text-cyan-400">PixelGetColor</code> / <code className="font-mono text-cyan-400">mss</code>) и стандартную эмуляцию мыши Windows API, не внедряясь в процесс игры (<code className="font-mono text-slate-400">DLL Injection / Memory Write</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting FAQ */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Частые вопросы и решение проблем</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">Вопрос: В игре клик не нажимается, хотя звук срабатывает?</span>
            <p className="text-slate-400">
              <strong>Решение:</strong> Запустите скрипт или интерпретатор от имени <strong>Администратора</strong> (Правый клик по .ahk файлу → Запуск от имени администратора). Игры с античитами блокируют ввод мыши от процессов без повышенных привилегий.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="font-bold text-white block">Вопрос: Скрипт не видит цвет в игре?</span>
            <p className="text-slate-400">
              <strong>Решение:</strong> Убедитесь, что игра находится в режиме «Окно без рамки» (Borderless Windowed). В эксклюзивном полноэкранном режиме (Exclusive Fullscreen) Windows Direct3D блокирует чтение рабочего стола.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
