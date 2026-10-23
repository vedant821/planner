import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabId } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChatbotView } from './components/chat/ChatbotView';
import { TimetablePlannerView } from './components/timetable/TimetablePlannerView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { TasksView } from './components/tasks/TasksView';
import { ExamPrepView } from './components/exams/ExamPrepView';
import { FlashcardsView } from './components/revision/FlashcardsView';
import { SummarizerView } from './components/revision/SummarizerView';
import { FocusRoomView } from './components/focus/FocusRoomView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

function MainApp() {
  const { profile } = useStudy();
  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!profile.completedOnboarding);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'chatbot':
        return <ChatbotView />;
      case 'timetable':
        return <TimetablePlannerView onNavigateToFocus={() => setCurrentTab('focus')} />;
      case 'subjects':
        return <SubjectsView />;
      case 'tasks':
        return <TasksView onNavigateToFocus={() => setCurrentTab('focus')} />;
      case 'exams':
        return <ExamPrepView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'summarizer':
        return <SummarizerView />;
      case 'focus':
        return <FocusRoomView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView onRestartOnboarding={() => setShowOnboarding(true)} />;
      default:
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigateToFocus={() => setCurrentTab('focus')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <MainApp />
    </StudyProvider>
  );
}
