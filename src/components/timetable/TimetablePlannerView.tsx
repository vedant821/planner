import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Sparkles,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Play,
  RotateCcw,
  Coffee,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Priority, TimetableSlot } from '../../types';

interface TimetablePlannerViewProps {
  onNavigateToFocus: () => void;
}

export const TimetablePlannerView: React.FC<TimetablePlannerViewProps> = ({ onNavigateToFocus }) => {
  const {
    timetable,
    subjects,
    profile,
    exams,
    addTimetableSlot,
    deleteTimetableSlot,
    toggleSlotCompletion,
    setTimetable,
    addNotification,
  } = useStudy();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New slot form state
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Core Subject');
  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('09:00 - 09:50');
  const [newDuration, setNewDuration] = useState(50);
  const [newType, setNewType] = useState<TimetableSlot['type']>('Focus Session');
  const [newPriority, setNewPriority] = useState<Priority>('High');

  const filteredSlots = selectedDay === 'All'
    ? timetable
    : timetable.filter((s) => s.day === selectedDay);

  // Total daily scheduled minutes
  const totalFocusMinutes = filteredSlots
    .filter((s) => s.type !== 'Break')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalBreakMinutes = filteredSlots
    .filter((s) => s.type === 'Break')
    .reduce((sum, s) => sum + s.duration, 0);

  const handleRegenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({ name: s.name, difficulty: s.difficulty, progress: s.progress })),
          exams: exams.map((e) => ({ subject: e.subject, date: e.date, daysLeft: 5 })),
          dailyHours: profile.dailyHours,
          timeframe: selectedDay,
        }),
      });

      const data = await response.json();
      if (data.slots && Array.isArray(data.slots)) {
        // Replace current day slots with newly generated AI slots
        const newDaySlots: TimetableSlot[] = data.slots.map((s: any, idx: number) => ({
          id: `tt-ai-${Date.now()}-${idx}`,
          day: selectedDay === 'All' ? 'Monday' : selectedDay,
          time: s.time || '10:00 - 10:50',
          subject: s.subject || 'Study Block',
          topic: s.topic || 'Concept Mastery & Problems',
          type: s.type || 'Focus Session',
          priority: s.priority || 'High',
          duration: s.duration || 50,
          completed: false,
        }));

        const otherDaysSlots = timetable.filter((s) => selectedDay !== 'All' && s.day !== selectedDay);
        setTimetable([...otherDaysSlots, ...newDaySlots]);

        addNotification(
          '✨ Smart Schedule Generated!',
          `AI created a balanced timetable for ${selectedDay} (${Math.round(totalFocusMinutes / 60)} hrs focus).`
        );
      }
    } catch (err: any) {
      console.error('Failed to generate timetable with AI:', err);
      addNotification('Schedule generation error', err?.message || 'Check network connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    addTimetableSlot({
      day: selectedDay === 'All' ? 'Monday' : selectedDay,
      time: newTime,
      subject: newType === 'Break' ? 'Break' : newSubject,
      topic: newTopic.trim(),
      type: newType,
      priority: newPriority,
      duration: Number(newDuration),
      completed: false,
    });

    setNewTopic('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Plan Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Smart Timetable & Schedule
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Scientifically balanced study blocks, spaced revision intervals, and relaxation buffers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>

          <button
            onClick={handleRegenerateWithAI}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Optimizing Plan...' : 'Regenerate Plan with AI'}</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', ...days].map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Day Stats Pill */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Scheduled Focus</span>
          <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
            {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Scheduled Breaks</span>
          <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
            {totalBreakMinutes} mins
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Slots Count</span>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            {filteredSlots.length} sessions
          </span>
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-3">
        {filteredSlots.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <p className="text-sm font-semibold text-slate-500">
              No sessions scheduled for {selectedDay}.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "Regenerate Plan with AI" to automatically synthesize a high-yield schedule from your subjects and exam goals.
            </p>
            <button
              onClick={handleRegenerateWithAI}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Generate AI Schedule
            </button>
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const isBreak = slot.type === 'Break';
            return (
              <div
                key={slot.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all gap-4 ${
                  isBreak
                    ? 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                    : slot.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Completion check or break icon */}
                  {isBreak ? (
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleSlotCompletion(slot.id)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        slot.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 fill-current" />
                    </button>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {slot.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isBreak
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : slot.type === 'Revision'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            : slot.type === 'Practice'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}
                      >
                        {slot.type}
                      </span>
                      {selectedDay === 'All' && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {slot.day}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {slot.topic}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{slot.time} ({slot.duration}m)</span>
                  </div>

                  {!isBreak && (
                    <button
                      onClick={onNavigateToFocus}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Focus</span>
                    </button>
                  )}

                  <button
                    onClick={() => deleteTimetableSlot(slot.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Add New Study Slot
            </h3>

            <form onSubmit={handleCreateSlot} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Session Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Focus Session', 'Practice', 'Revision', 'Break'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        newType === t
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {newType !== 'Break' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Topic / Goal Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Programming (0/1 Knapsack)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="09:00 - 09:50"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
