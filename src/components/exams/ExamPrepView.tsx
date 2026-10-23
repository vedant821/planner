import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Clock,
  Target,
  ArrowRight,
  CheckCircle,
  FileText,
  RotateCw,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Priority, Exam } from '../../types';

export const ExamPrepView: React.FC = () => {
  const { exams, subjects, profile, addExam, editExam, deleteExam, addNotification } = useStudy();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(exams[0] || null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.name || 'Database Management Systems');
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [targetScore, setTargetScore] = useState('90%');
  const [syllabus, setSyllabus] = useState('');
  const [priority, setPriority] = useState<Priority>('Critical');

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newExam = addExam({
      title: title.trim(),
      subject,
      date,
      targetScore,
      syllabus: syllabus.trim(),
      priority,
      prepMilestones: [
        { phase: 'Phase 1: Syllabus Coverage', days: 'Days 1-3', focus: 'High-weightage concept review and notes consolidation.' },
        { phase: 'Phase 2: Timed Practice & Problem Solving', days: 'Days 4-5', focus: 'Past exam problems, edge cases, and weak topic identification.' },
        { phase: 'Phase 3: Mock Exam & Final Spaced Recall', days: 'Days 6-7', focus: 'Simulate full exam under strict timed conditions.' }
      ]
    });

    setSelectedExam(newExam);
    setShowAddModal(false);
    setTitle('');
    setSyllabus('');
  };

  const handleGenerateAiBreakdown = async (exam: Exam) => {
    setIsGeneratingRoadmap(true);
    const daysLeft = Math.max(1, Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 3600 * 24)));

    try {
      const response = await fetch('/api/exam-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: exam.subject,
          examDate: exam.date,
          daysLeft,
          targetScore: exam.targetScore,
          syllabus: exam.syllabus,
          dailyHours: profile.dailyHours,
        }),
      });

      const data = await response.json();
      if (data.milestones && Array.isArray(data.milestones)) {
        editExam(exam.id, {
          prepMilestones: data.milestones,
        });
        setSelectedExam((prev) => (prev ? { ...prev, prepMilestones: data.milestones } : null));

        addNotification(
          '🎯 Exam Preparation Roadmap Updated',
          `AI regenerated a 3-phase revision plan for ${exam.subject}.`
        );
      }
    } catch (err: any) {
      console.error('Failed to generate exam breakdown:', err);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Exam Preparation Command Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Countdowns, structured revision milestones, and syllabus load balancers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Main Grid: Exam List Cards + Selected Exam Detailed Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Exam Cards (1 Col) */}
        <div className="space-y-3">
          <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 pl-1">
            Upcoming Examinations ({exams.length})
          </h2>

          {exams.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500">
              No exams scheduled yet.
            </div>
          ) : (
            exams.map((exam) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 3600 * 24)));
              const isSelected = selectedExam?.id === exam.id;

              return (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {exam.subject}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {exam.title}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          daysLeft <= 3
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                            : daysLeft <= 7
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}
                      >
                        {daysLeft} Days Left
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exam.date}</span>
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Target: {exam.targetScore}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Exam Prep Plan (2 Cols) */}
        <div className="lg:col-span-2">
          {selectedExam ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Selected Exam Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Active Preparation Plan
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-bold text-slate-500">{selectedExam.priority} Priority</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedExam.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Date: <strong className="text-slate-800 dark:text-slate-200">{selectedExam.date}</strong> • Target Score: <strong className="text-indigo-600 dark:text-indigo-400">{selectedExam.targetScore}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateAiBreakdown(selectedExam)}
                    disabled={isGeneratingRoadmap}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingRoadmap ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingRoadmap ? 'Synthesizing...' : 'Recalculate with AI'}</span>
                  </button>

                  <button
                    onClick={() => {
                      deleteExam(selectedExam.id);
                      setSelectedExam(exams[1] || null);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Syllabus Context */}
              {selectedExam.syllabus && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Syllabus / Focus Scope:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedExam.syllabus}
                  </p>
                </div>
              )}

              {/* Prep Milestones Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span>Phase-by-Phase Preparation Timeline</span>
                </div>

                <div className="space-y-3">
                  {(selectedExam.prepMilestones || []).map((milestone, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {milestone.phase}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 pl-8 leading-relaxed">
                          {milestone.focus}
                        </p>
                      </div>

                      <span className="self-end sm:self-center font-mono font-bold text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {milestone.days}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Advice */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold text-indigo-700 dark:text-indigo-400">💡 Exam Day Rule:</p>
                <p>
                  Avoid cramming new topics in the final 24 hours. Focus exclusively on error logs, formula sheets, and active recall flashcards to consolidate memory.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
              Select or add an exam to view the automated preparation roadmap.
            </div>
          )}
        </div>
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Schedule New Examination
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Final Exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
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
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Target Score
                  </label>
                  <input
                    type="text"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    placeholder="90%"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Syllabus / Key Topics
                </label>
                <textarea
                  rows={2}
                  placeholder="Chapters, topics, and specific concepts covered..."
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
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
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
