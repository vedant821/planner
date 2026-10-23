import React from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  BookOpen,
  GraduationCap,
  Layers,
  BotMessageSquare,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { TabId } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: TabId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    profile,
    subjects,
    tasks,
    exams,
    timetable,
    toggleTaskStatus,
    flashcards,
  } = useStudy();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  const todayCompletedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const todayProgressPercent = todayTasks.length > 0 ? Math.round((todayCompletedCount / todayTasks.length) * 100) : 0;

  // Upcoming exams with day countdown
  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = sortedExams[0];
  const nextExamDaysLeft = nextExam
    ? Math.max(0, Math.ceil((new Date(nextExam.date).getTime() - Date.now()) / (1000 * 3600 * 24)))
    : null;

  // Today's scheduled timetable slots
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = daysOfWeek[new Date().getDay()];
  const todaySlots = timetable.filter((s) => s.day === currentDayName || s.day === 'Monday');

  // Flashcards due today
  const dueFlashcardsCount = flashcards.filter(
    (c) => !c.nextReviewDate || c.nextReviewDate <= todayStr
  ).length;

  // Weak subjects prompt
  const weakSubjectsList = profile.weakSubjects || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner & AI Motivation */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Personalized Study Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {profile.name}! 🚀
            </h1>
            <p className="text-sm text-indigo-100/90 max-w-xl leading-relaxed">
              You are on a <span className="font-bold text-amber-300">{profile.streak}-day study streak</span>.
              {nextExam ? (
                <span>
                  {' '}Your <span className="font-semibold text-white">{nextExam.subject}</span> exam is in{' '}
                  <span className="font-bold text-amber-300 underline decoration-amber-400">{nextExamDaysLeft} days</span>.
                </span>
              ) : (
                ' Ready to crush today’s learning objectives?'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('focus')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-indigo-900" />
              <span>Start Focus Session</span>
            </button>
            <button
              onClick={() => onNavigate('chatbot')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm border border-white/15 transition-all"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>Ask AI Mentor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Study Target */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Today's Target</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {profile.dailyHours} <span className="text-sm font-semibold text-slate-500">hrs/day</span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (profile.totalStudyMinutes % 300) / 3)}%` }} />
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              {Math.round(profile.totalStudyMinutes / 60)}h logged
            </span>
          </div>
        </div>

        {/* Tasks Progress */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Tasks Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {completedTasks.length} <span className="text-sm font-semibold text-slate-500">/ {tasks.length}</span>
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {todayCompletedCount} completed today
            </span>
            <span className="text-slate-400 font-medium">{pendingTasks.length} pending</span>
          </div>
        </div>

        {/* Next Exam Countdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Nearest Exam</span>
            <GraduationCap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {nextExamDaysLeft !== null ? `${nextExamDaysLeft} Days` : 'None'}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
            {nextExam?.subject || 'All exams cleared!'}
          </p>
        </div>

        {/* Spaced Flashcards Due */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Revision Queue</span>
            <Layers className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {dueFlashcardsCount} <span className="text-sm font-semibold text-slate-500">cards</span>
          </p>
          <button
            onClick={() => onNavigate('flashcards')}
            className="mt-2 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
          >
            <span>Review now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Schedule & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule & Actionable Tasks (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Timeline */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Today's Planned Schedule ({currentDayName})
                </h2>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todaySlots.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-sm text-slate-500">No scheduled study blocks for today.</p>
                  <button
                    onClick={() => onNavigate('timetable')}
                    className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    Generate Smart Schedule
                  </button>
                </div>
              ) : (
                todaySlots.slice(0, 5).map((slot) => {
                  const isBreak = slot.type === 'Break';
                  return (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                        isBreak
                          ? 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60'
                          : slot.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40'
                          : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isBreak
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {slot.duration}m
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {slot.subject}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isBreak
                                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  : slot.priority === 'Critical'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              }`}
                            >
                              {slot.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {slot.topic} • <span className="font-mono text-[11px]">{slot.time}</span>
                          </p>
                        </div>
                      </div>

                      {!isBreak && (
                        <button
                          onClick={() => onNavigate('focus')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors"
                        >
                          Focus
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* High Priority Tasks List */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-500" />
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Active Tasks & Target Deadlines
                </h2>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({pendingTasks.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 4).map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {task.subjectName} • Due: {task.dueDate} • est. {task.estimatedMinutes}m
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: AI Mentor Insights & Exam Radar */}
        <div className="space-y-6">
          {/* AI Mentor Daily Brief Card */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-900/10 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI Study Mentor Recommendation</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "Based on your upcoming <strong className="text-indigo-600 dark:text-indigo-400">{nextExam?.subject || 'exams'}</strong> in {nextExamDaysLeft || 5} days, I recommend dedicating your first 50-minute block to <strong className="text-indigo-600 dark:text-indigo-400">Normalization and Indexing</strong>. You have 2 weak topics identified in this syllabus."
            </p>

            <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/50 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('chatbot')}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all"
              >
                <BotMessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI to Adjust Plan</span>
              </button>
              <button
                onClick={() => onNavigate('summarizer')}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Generate Revision Summary</span>
              </button>
            </div>
          </div>

          {/* Weak Areas Watchlist */}
          {weakSubjectsList.length > 0 && (
            <div className="rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Identified Weak Subjects</span>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mb-3">
                Target extra spaced recall and practice questions for these subjects before exams.
              </p>
              <div className="space-y-1.5">
                {weakSubjectsList.map((subj, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-800/40 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{subj}</span>
                    <button
                      onClick={() => onNavigate('flashcards')}
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      Quiz Me
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Mastery Progress Bars */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Subject Mastery
              </h3>
              <button
                onClick={() => onNavigate('subjects')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3.5">
              {subjects.map((subj) => (
                <div key={subj.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                      {subj.name}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">{subj.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${subj.progress}%`,
                        backgroundColor: subj.color || '#6366F1',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
