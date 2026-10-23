import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Coffee,
  CloudRain,
  Radio,
  Sliders,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { playChime, startAmbientSound, stopAmbientSound } from '../../utils/audio';

export const FocusRoomView: React.FC = () => {
  const { subjects, tasks, recordFocusSession, profile } = useStudy();

  // Mode: Pomodoro (Work), Short Break, Long Break
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Link to task or subject
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Deep Work');
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');

  // Audio settings
  const [ambientMode, setAmbientMode] = useState<'off' | 'rain' | 'whitenoise' | 'binaural'>('off');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Motivational quote
  const motivationalQuotes = [
    'Focus on the step in front of you, not the whole staircase.',
    'Small, disciplined study sessions beat all-night cramming every time.',
    'Active retrieval builds long-lasting neural pathways.',
    'Deep focus is a muscle: the more you train it, the stronger it gets.',
    'Your future self will thank you for this 25-minute block.',
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Duration in seconds for current mode
  const currentTotalSeconds =
    mode === 'work'
      ? workDuration * 60
      : mode === 'short_break'
      ? shortBreakDuration * 60
      : longBreakDuration * 60;

  // Reset timer on mode change
  useEffect(() => {
    let targetMins = workDuration;
    if (mode === 'short_break') targetMins = shortBreakDuration;
    if (mode === 'long_break') targetMins = longBreakDuration;
    setTimeLeft(targetMins * 60);
    setIsRunning(false);
  }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

  // Timer interval loop
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed session!
      setIsRunning(false);
      playChime('success');
      stopAmbientSound();

      if (mode === 'work') {
        recordFocusSession(workDuration, selectedSubject, selectedTaskTitle || undefined);
        setMode('short_break');
      } else {
        setMode('work');
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, workDuration, selectedSubject, selectedTaskTitle]);

  // Ambient sound handler
  useEffect(() => {
    if (ambientMode !== 'off' && isRunning) {
      startAmbientSound(ambientMode);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [ambientMode, isRunning]);

  const toggleTimer = () => {
    if (!isRunning) {
      playChime('start');
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    stopAmbientSound();
    let targetMins = workDuration;
    if (mode === 'short_break') targetMins = shortBreakDuration;
    if (mode === 'long_break') targetMins = longBreakDuration;
    setTimeLeft(targetMins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.round(((currentTotalSeconds - timeLeft) / currentTotalSeconds) * 100);

  // SVG Circular progress radius
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`space-y-6 max-w-4xl mx-auto pb-12 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-8 flex flex-col justify-center items-center max-w-none overflow-y-auto'
          : ''
      }`}
    >
      {/* Header bar */}
      <div className="w-full flex items-center justify-between p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Pomodoro Focus Room
            </h1>
            <p className="text-xs text-slate-400">
              Flow state timer with ambient noise & automatic streak logging
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Focus Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Focus Dashboard Card */}
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-8">
        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode('work')}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'work'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Deep Focus ({workDuration}m)
          </button>
          <button
            onClick={() => setMode('short_break')}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Short Break ({shortBreakDuration}m)
          </button>
          <button
            onClick={() => setMode('long_break')}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'long_break'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Long Break ({longBreakDuration}m)
          </button>
        </div>

        {/* Circular Progress Gauge & Clock Display */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 300 300">
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={mode === 'work' ? '#6366F1' : mode === 'short_break' ? '#10B981' : '#8B5CF6'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Central timer numbers */}
          <div className="absolute flex flex-col items-center justify-center space-y-1">
            <span className="font-mono text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              {mode === 'work' ? selectedSubject : 'Recharge & Hydrate'}
            </span>
          </div>
        </div>

        {/* Control Buttons: Play/Pause, Reset */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-lg transition-all hover:scale-105 active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>

        {/* Ambient Sound Mode Selector */}
        <div className="w-full max-w-md p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <CloudRain className="w-4 h-4 text-indigo-500" />
            <span>Ambient Audio:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'off', label: 'Mute' },
              { id: 'rain', label: 'Rain' },
              { id: 'whitenoise', label: 'White Noise' },
              { id: 'binaural', label: 'Alpha Waves' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => setAmbientMode(snd.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  ambientMode === snd.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject & Task Linker */}
        <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Link Existing Task
            </label>
            <select
              value={selectedTaskTitle}
              onChange={(e) => setSelectedTaskTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold truncate"
            >
              <option value="">(None - General Focus)</option>
              {tasks
                .filter((t) => t.status !== 'completed')
                .map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Supportive Study Insight */}
        <div className="max-w-md p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 text-xs text-slate-600 dark:text-slate-300 italic border border-indigo-100 dark:border-indigo-900/40">
          "{motivationalQuotes[quoteIndex]}"
        </div>
      </div>
    </div>
  );
};
