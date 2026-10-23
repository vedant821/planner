import React from 'react';
import {
  LayoutDashboard,
  BotMessageSquare,
  CalendarDays,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Layers,
  FileText,
  Timer,
  BarChart3,
  Settings,
  X,
  Target,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export type TabId =
  | 'dashboard'
  | 'chatbot'
  | 'timetable'
  | 'subjects'
  | 'tasks'
  | 'exams'
  | 'flashcards'
  | 'summarizer'
  | 'focus'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { tasks, exams } = useStudy();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const criticalTasksCount = tasks.filter((t) => t.status !== 'completed' && t.priority === 'Critical').length;
  const upcomingExamsCount = exams.length;

  const navItems: Array<{ id: TabId; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chatbot', label: 'AI Study Mentor', icon: <BotMessageSquare className="w-4 h-4" />, badge: 'AI', badgeColor: 'bg-indigo-500 text-white' },
    { id: 'timetable', label: 'Smart Timetable', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'subjects', label: 'Subjects & Syllabus', icon: <BookOpen className="w-4 h-4" /> },
    {
      id: 'tasks',
      label: 'Tasks & Deadlines',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: criticalTasksCount > 0 ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    },
    {
      id: 'exams',
      label: 'Exam Prep Mode',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: upcomingExamsCount > 0 ? `${upcomingExamsCount} Upcoming` : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'flashcards', label: 'Flashcards & Quizzes', icon: <Layers className="w-4 h-4" /> },
    { id: 'summarizer', label: 'AI Revision Assistant', icon: <FileText className="w-4 h-4" />, badge: 'Smart', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'focus', label: 'Focus & Pomodoro', icon: <Timer className="w-4 h-4" /> },
    { id: 'analytics', label: 'Productivity Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Profile & Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: TabId) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 md:w-60 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header inside drawer */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-slate-900 dark:text-white">StudyMate AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Study Workspace
          </p>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Helper Box */}
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-2 mb-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            <Target className="w-3.5 h-3.5" />
            <span>AI Study Tip</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Spaced recall within 24h boosts retention by 80%. Test yourself with 3 quick flashcards today!
          </p>
        </div>
      </aside>
    </>
  );
};
