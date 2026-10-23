import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Check,
  Clock,
  Sparkles,
  Shield,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface SettingsViewProps {
  onRestartOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRestartOnboarding }) => {
  const {
    profile,
    updateProfile,
    exportDataJson,
    importDataJson,
    resetToDefaultData,
    requestNotificationPermission,
    addNotification,
  } = useStudy();

  const [name, setName] = useState(profile.name);
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel);
  const [dailyHours, setDailyHours] = useState(profile.dailyHours);
  const [shortGoal, setShortGoal] = useState(profile.goals.shortTerm);
  const [longGoal, setLongGoal] = useState(profile.goals.longTerm);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      educationLevel,
      dailyHours: Number(dailyHours),
      goals: {
        shortTerm: shortGoal,
        longTerm: longGoal,
      },
    });

    setSavedSuccess(true);
    addNotification('✅ Profile Updated', 'Your study targets and personal preferences have been saved.');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importDataJson(text);
      if (!success) {
        setImportError('Invalid JSON format or corrupted backup file.');
      } else {
        setImportError('');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Profile & Study Preferences
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your daily schedule constraints, academic goals, alerts, and data storage.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile & Academic Stage */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Student Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Education Level
              </label>
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Daily Study Availability (Hours/Day)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value={profile.timezone}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Academic Goals */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Short-Term Academic Goal (Next 30 Days)
              </label>
              <input
                type="text"
                value={shortGoal}
                onChange={(e) => setShortGoal(e.target.value)}
                placeholder="e.g. Score 90%+ in DBMS Midterm and maintain 4-hour daily streak"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Long-Term Vision / Career Target
              </label>
              <input
                type="text"
                value={longGoal}
                onChange={(e) => setLongGoal(e.target.value)}
                placeholder="e.g. Secure Top Software Engineering Internship & maintain 3.8 GPA"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onRestartOnboarding}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Re-run Onboarding Setup Wizard
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Notifications & Reminders */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-500" />
          <span>Notifications & Spaced Reminders</span>
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">
                Browser Push Notifications
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive study-session reminders and deadline countdown alerts on your device.
              </p>
            </div>
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors"
            >
              {profile.notificationsEnabled ? 'Enabled ✓' : 'Enable Permission'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-500" />
          <span>Data Storage & Portability</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your complete study roadmap, flashcards, timetable, and notes are securely stored. You can export a full JSON backup anytime or restore from an existing file.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (.JSON)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo subjects, exams, and timetable back to default?')) {
                resetToDefaultData();
              }
            }}
            className="px-4 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {importError && (
          <p className="text-xs text-rose-600 font-semibold">{importError}</p>
        )}
      </div>
    </div>
  );
};
