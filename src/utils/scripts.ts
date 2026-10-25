import { ScriptPreset, ScriptTarget } from '../types/qte';

export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: 'eft_gym',
    name: 'Escape from Tarkov — Спортзал (Гексагон QTE)',
    game: 'Escape from Tarkov (EFT)',
    description: 'Автонажатие ЛКМ при совпадении сжимающегося гексагона в спортзале Убежища EFT. Поддержка 4K (3840x2160), 2K и Full HD с авто-калибровкой на F3.',
    defaultKey: 'LButton',
    triggerColor: '0xD4D3C5',
    detectionType: 'pixel_fixed',
  },
  {
    id: 'universal_lmb',
    name: 'Универсальный Автокликер ЛКМ по пикселю',
    game: 'Любая игра / Браузер / Тест',
    description: 'Универсальное авто-нажатие ЛКМ при появлении нужного цвета в заданной точке экрана с авто-калибровкой на F3.',
    defaultKey: 'LButton',
    triggerColor: '0x2ECC71',
    detectionType: 'pixel_fixed',
  },
  {
    id: 'gta5_fishing',
    name: 'GTA 5 RP / Majestic / Radmir (Рыбалка)',
    game: 'GTA V RP / Radmir CRMP',
    description: 'Авто-подсечка и удержание рыбы в зеленой зоне. Автоматически кликает ЛКМ при совпадении цвета индикатора.',
    defaultKey: 'LButton',
    triggerColor: '0x00FF00',
    detectionType: 'pixel_fixed',
  },
  {
    id: 'dbd_skillcheck',
    name: 'Dead by Daylight (DBD Skill Check)',
    game: 'Dead by Daylight',
    description: 'Авто-нажатие Пробела / ЛКМ при попадании стрелки в Great / Good зону при ремонте или лечении.',
    defaultKey: 'Space',
    triggerColor: '0xFFFFFF',
    detectionType: 'radial_needle',
  },
  {
    id: 'gym_spam',
    name: 'Качалка / Замки / Взлом (Спам ЛКМ)',
    game: 'GTA V / Radmir / Cyberpunk',
    description: 'Авто-спам ЛКМ с контролем скорости кликов (CPS) и авто-остановкой при выходе из зоны.',
    defaultKey: 'LButton',
    triggerColor: '0xE74C3C',
    detectionType: 'pixel_search',
  },
];

export interface ScriptOptions {
  target: ScriptTarget;
  presetId: string;
  triggerKey: string;
  reactionDelayMs: number;
  jitterMs: number;
  pressDurationMs: number;
  toggleHotkey: string;
  calibrateHotkey: string;
  targetColorHex: string;
  tolerance: number;
  targetX: number;
  targetY: number;
}

export function generateScript(opts: ScriptOptions): string {
  const hexNoPrefix = opts.targetColorHex.replace('#', '').toUpperCase();
  const hexAHK = '0x' + hexNoPrefix;
  const isEft = opts.presetId === 'eft_gym';

  if (opts.target === 'ahk_v2') {
    return `; ========================================================
; ${isEft ? 'Escape from Tarkov (EFT) — Спортзал в Убежище (Гексагон QTE)' : 'QTE Auto-Clicker LMB'}
; Платформа: AutoHotkey v2.0+ (Windows 10/11)
; ========================================================
#Requires AutoHotkey v2.0
#SingleInstance Force

; Настройки координат и цвета
global BotActive := false
global TargetX := ${opts.targetX || 1920}
global TargetY := ${opts.targetY || 1560}
global TargetColor := ${hexAHK}
global ColorTolerance := ${Math.round(opts.tolerance * 2.55)}
global TriggerKey := "${opts.triggerKey === 'LMB' ? 'LButton' : opts.triggerKey}"
global BaseDelay := ${opts.reactionDelayMs}
global Jitter := ${opts.jitterMs}
global PressDuration := ${opts.pressDurationMs}

; Режим координат: относительно всего экрана
CoordMode "Pixel", "Screen"
CoordMode "Mouse", "Screen"

TrayTip "${isEft ? 'EFT Gym Bot' : 'QTE Auto-Clicker'}", "Скрипт запущен!\\n[${opts.toggleHotkey}] - Старт/Пауза бота\\n[${opts.calibrateHotkey}] - Калибровка под курсором", 3

; --------------------------------------------------------
; [${opts.toggleHotkey}] — Включение / Выключение автонажатия ЛКМ
; --------------------------------------------------------
${opts.toggleHotkey}::
{
    global BotActive
    BotActive := !BotActive
    if (BotActive) {
        SoundBeep 1100, 100
        SoundBeep 1500, 120
        SetTimer CheckQTE, 8  ; Скоростной опрос каждые 8 мс (125 FPS)
        ToolTip "${isEft ? 'EFT Спортзал' : 'QTE'} БОТ: [АКТИВЕН] - Ожидание гексагона..."
    } else {
        SoundBeep 600, 150
        SetTimer CheckQTE, 0
        ToolTip "${isEft ? 'EFT Спортзал' : 'QTE'} БОТ: [ВЫКЛЮЧЕН]"
    }
    SetTimer () => ToolTip(), -2000
}

; --------------------------------------------------------
; [${opts.calibrateHotkey}] — Авто-калибровка точки и цвета в игре
; Наведите мышь на белый контур гексагона в качалке и нажмите ${opts.calibrateHotkey}
; --------------------------------------------------------
${opts.calibrateHotkey}::
{
    global TargetX, TargetY, TargetColor
    MouseGetPos &mX, &mY
    TargetX := mX
    TargetY := mY
    TargetColor := PixelGetColor(TargetX, TargetY, "RGB")
    SoundBeep 1300, 200
    ToolTip "Калибровка EFT сохранена!\\nКоординаты: " . TargetX . "x" . TargetY . "\\nЦвет пикселя: " . TargetColor
    SetTimer () => ToolTip(), -3500
}

; --------------------------------------------------------
; Основной цикл детекции QTE
; --------------------------------------------------------
CheckQTE()
{
    global BotActive, TargetX, TargetY, TargetColor, TriggerKey, BaseDelay, Jitter, PressDuration
    if (!BotActive)
        return

    currentColor := PixelGetColor(TargetX, TargetY, "RGB")
    
    ; Проверка совпадения цвета с погрешностью
    if (ColorMatch(currentColor, TargetColor, ColorTolerance))
    {
        ; Человекоподобная задержка для естественности
        actualDelay := BaseDelay
        if (Jitter > 0)
            actualDelay += Random(-Jitter, Jitter)
        
        if (actualDelay > 0)
            Sleep actualDelay

        ; Авто-нажатие ЛКМ (клик вниз и отпускание)
        if (TriggerKey = "LButton") {
            Click "Down"
            Sleep PressDuration
            Click "Up"
        } else {
            Send "{" . TriggerKey . " Down}"
            Sleep PressDuration
            Send "{" . TriggerKey . " Up}"
        }

        ; Звуковой сигнал успешного повтора и пауза перед следующим подходом
        SoundBeep 1700, 45
        Sleep 400 ; Пауза между повторениями в качалке
    }
}

; Функция сравнения RGB цветов с допуском
ColorMatch(c1, c2, tol)
{
    r1 := (c1 >> 16) & 0xFF, g1 := (c1 >> 8) & 0xFF, b1 := c1 & 0xFF
    r2 := (c2 >> 16) & 0xFF, g2 := (c2 >> 8) & 0xFF, b2 := c2 & 0xFF
    return (Abs(r1 - r2) <= tol && Abs(g1 - g2) <= tol && Abs(b1 - b2) <= tol)
}
`;
  }

  if (opts.target === 'ahk_v1') {
    return `; ========================================================
; QTE Auto-Clicker LMB (AutoHotkey v1.1 Classic)
; ========================================================
#NoEnv
#SingleInstance Force
SetBatchLines, -1
CoordMode, Pixel, Screen
CoordMode, Mouse, Screen

BotActive := false
TargetX := ${opts.targetX || 960}
TargetY := ${opts.targetY || 540}
TargetColor := ${hexAHK}
TriggerKey := "${opts.triggerKey === 'LMB' ? 'LButton' : opts.triggerKey}"
BaseDelay := ${opts.reactionDelayMs}
Jitter := ${opts.jitterMs}
PressDuration := ${opts.pressDurationMs}

TrayTip, QTE Auto-Clicker, Бот готов! ${opts.toggleHotkey} - Старт, ${opts.calibrateHotkey} - Калибровка, 3

${opts.toggleHotkey}::
    BotActive := !BotActive
    if (BotActive) {
        SoundBeep, 1000, 100
        SoundBeep, 1400, 120
        SetTimer, CheckQTE, 10
        ToolTip, QTE Auto-Clicker: [АКТИВЕН]
    } else {
        SoundBeep, 600, 150
        SetTimer, CheckQTE, Off
        ToolTip, QTE Auto-Clicker: [ВЫКЛЮЧЕН]
    }
    SetTimer, RemoveToolTip, -2000
return

${opts.calibrateHotkey}::
    MouseGetPos, TargetX, TargetY
    PixelGetColor, TargetColor, %TargetX%, %TargetY%, RGB
    SoundBeep, 1200, 200
    ToolTip, Сохранено!\\nX: %TargetX% Y: %TargetY%\\nЦвет: %TargetColor%
    SetTimer, RemoveToolTip, -3000
return

CheckQTE:
    if (!BotActive)
        return

    PixelGetColor, curColor, %TargetX%, %TargetY%, RGB
    if (curColor = TargetColor)
    {
        delay := BaseDelay
        if (Jitter > 0) {
            Random, rnd, -%Jitter%, %Jitter%
            delay := delay + rnd
        }
        if (delay > 0)
            Sleep, %delay%

        if (TriggerKey = "LButton") {
            Click, Down
            Sleep, %PressDuration%
            Click, Up
        } else {
            Send, {%TriggerKey% Down}
            Sleep, %PressDuration%
            Send, {%TriggerKey% Up}
        }
        SoundBeep, 1600, 50
        Sleep, 300
    }
return

RemoveToolTip:
    ToolTip
return
`;
  }

  // Python Script
  return `# ========================================================
# QTE Auto-Clicker LMB (Python 3)
# Требуется: pip install pyautogui mss keyboard pillow
# ========================================================
import time
import random
import winsound
import pyautogui
import keyboard
import mss
from PIL import Image

# Конфигурация
TARGET_X = ${opts.targetX || 960}
TARGET_Y = ${opts.targetY || 540}
TARGET_HEX = "${opts.targetColorHex}"
TRIGGER_KEY = "${opts.triggerKey === 'LMB' ? 'left' : opts.triggerKey.toLowerCase()}"
BASE_DELAY_SEC = ${opts.reactionDelayMs / 1000}
JITTER_SEC = ${opts.jitterMs / 1000}
TOLERANCE = ${opts.tolerance}

bot_active = False

def hex_to_rgb(hex_str):
    hex_clean = hex_str.lstrip('#')
    return tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))

target_rgb = hex_to_rgb(TARGET_HEX)

print("=" * 50)
print("  QTE Auto-Clicker LMB запущен!")
print("  [${opts.toggleHotkey}] - Включить / Выключить бота")
print("  [${opts.calibrateHotkey}] - Сохранить цвет и координаты под курсором")
print("  [Esc] - Выход")
print("=" * 50)

def toggle_bot():
    global bot_active
    bot_active = not bot_active
    if bot_active:
        winsound.Beep(1200, 150)
        print("[!] БОТ АКТИВИРОВАН: сканирование зоны QTE...")
    else:
        winsound.Beep(600, 150)
        print("[!] Бот приостановлен")

def calibrate():
    global TARGET_X, TARGET_Y, target_rgb, TARGET_HEX
    TARGET_X, TARGET_Y = pyautogui.position()
    with mss.mss() as sct:
        monitor = {"top": TARGET_Y, "left": TARGET_X, "width": 1, "height": 1}
        img = sct.grab(monitor)
        b, g, r, _ = img.pixel(0, 0)
        target_rgb = (r, g, b)
        TARGET_HEX = f"#{r:02x}{g:02x}{b:02x}".upper()
    winsound.Beep(1400, 200)
    print(f"[✓] Откалибровано под курсором: X={TARGET_X}, Y={TARGET_Y}, Цвет={TARGET_HEX}")

keyboard.add_hotkey("${opts.toggleHotkey.toLowerCase()}", toggle_bot)
keyboard.add_hotkey("${opts.calibrateHotkey.toLowerCase()}", calibrate)

# Скоростной цикл детекции через MSS (100+ FPS)
with mss.mss() as sct:
    while not keyboard.is_pressed("esc"):
        if bot_active:
            monitor = {"top": TARGET_Y, "left": TARGET_X, "width": 1, "height": 1}
            img = sct.grab(monitor)
            b, g, r, _ = img.pixel(0, 0)
            
            # Проверка совпадения RGB цвета
            diff = max(abs(r - target_rgb[0]), abs(g - target_rgb[1]), abs(b - target_rgb[2]))
            if diff <= (TOLERANCE * 2.55):
                delay = BASE_DELAY_SEC
                if JITTER_SEC > 0:
                    delay += random.uniform(-JITTER_SEC, JITTER_SEC)
                if delay > 0:
                    time.sleep(delay)
                
                # Клик ЛКМ
                if TRIGGER_KEY == "left":
                    pyautogui.click(button="left")
                else:
                    pyautogui.press(TRIGGER_KEY)
                
                winsound.Beep(1500, 40)
                print(f"[+] QTE сработало! Клик произведен (задержка {delay*1000:.1f}ms)")
                time.sleep(0.3)  # Кулдаун после нажатия
        time.sleep(0.005)
`;
}
