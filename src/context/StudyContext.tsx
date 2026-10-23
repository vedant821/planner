import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  Subject,
  Task,
  Exam,
  Flashcard,
  TimetableSlot,
  FocusSession,
  AppNotification,
  ChatMessage,
  Priority,
  Difficulty,
  TaskStatus,
} from '../types';
import {
  initialProfile,
  initialSubjects,
  initialTasks,
  initialExams,
  initialFlashcards,
  initialTimetableSlots,
  initialFocusSessions,
  initialNotifications,
} from './initialData';

interface StudyContextType {
  profile: UserProfile;
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  flashcards: Flashcard[];
  timetable: TimetableSlot[];
  focusSessions: FocusSession[];
  notifications: AppNotification[];
  chatHistory: ChatMessage[];
  // Profile & preferences
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleTheme: () => void;
  completeOnboarding: (data: Partial<UserProfile>, initialSubjectList: string[]) => void;
  // Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  editSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopicToSubject: (subjectId: string, topic: { title: string; priority: Priority; difficulty: Difficulty }) => void;
  toggleTopicCompletion: (subjectId: string, topicId: string) => void;
  // Tasks
  addTask: (task: Omit<Task, 'id'>) => Task;
  editTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  // Exams
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  editExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  // Flashcards & Spaced Repetition (SM-2)
  addFlashcard: (card: Omit<Flashcard, 'id' | 'reviewCount' | 'masteryLevel'>) => Flashcard;
  addMultipleFlashcards: (cards: Array<Omit<Flashcard, 'id' | 'reviewCount' | 'masteryLevel'>>) => void;
  reviewFlashcard: (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  deleteFlashcard: (id: string) => void;
  // Timetable
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => TimetableSlot;
  editTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  setTimetable: (slots: TimetableSlot[]) => void;
  toggleSlotCompletion: (id: string) => void;
  // Focus & Productivity
  recordFocusSession: (durationMinutes: number, subjectName: string, taskTitle?: string) => void;
  // Notifications
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  // Chatbot
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  // Data management
  resetToDefaultData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEY = 'studymate_app_state_v1';

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialData
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [timetable, setTimetableState] = useState<TimetableSlot[]>(initialTimetableSlots);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(initialFocusSessions);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'chat-welcome',
      role: 'assistant',
      content: `👋 Hello! I'm **StudyMate AI**, your personal study mentor.\n\nI can help you:\n- **Build an optimized study schedule** based on your deadlines\n- **Break down exams** into step-by-step revision phases\n- **Reschedule missed tasks** without stress\n- **Generate smart flashcards & quizzes** to test your active recall\n\nWhat are you focusing on today? You can type commands like *"Create a 7-day DBMS revision plan"* or *"Plan 2 hours of DSA today"*!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Initial load from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.subjects) setSubjects(parsed.subjects);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.exams) setExams(parsed.exams);
        if (parsed.flashcards) setFlashcards(parsed.flashcards);
        if (parsed.timetable) setTimetableState(parsed.timetable);
        if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.chatHistory) setChatHistory(parsed.chatHistory);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to storage on state change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const state = {
        profile,
        subjects,
        tasks,
        exams,
        flashcards,
        timetable,
        focusSessions,
        notifications,
        chatHistory: chatHistory.slice(-20), // keep last 20 messages in storage
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [profile, subjects, tasks, exams, flashcards, timetable, focusSessions, notifications, chatHistory, isLoaded]);

  // Theme synchronization with html element
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [profile.theme]);

  // Update profile
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    setProfile((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const completeOnboarding = (data: Partial<UserProfile>, initialSubjectList: string[]) => {
    const newSubjects: Subject[] = initialSubjectList.map((name, idx) => {
      const colors = ['#6366F1', '#10B981', '#8B5CF6', '#0ea5e9', '#F59E0B', '#EC4899'];
      return {
        id: `subj-onb-${Date.now()}-${idx}`,
        name,
        color: colors[idx % colors.length],
        icon: 'BookOpen',
        difficulty: 'Medium',
        progress: 10,
        targetScore: '90%',
        topics: [
          { id: `top-onb-${idx}-1`, title: 'Fundamentals & Overview', completed: false, priority: 'High', difficulty: 'Easy' },
          { id: `top-onb-${idx}-2`, title: 'Core Problem Sets', completed: false, priority: 'Critical', difficulty: 'Medium' },
        ],
        resources: [],
      };
    });

    setSubjects((prev) => (newSubjects.length ? newSubjects : prev));
    setProfile((prev) => ({
      ...prev,
      ...data,
      completedOnboarding: true,
      lastStudyDate: new Date().toISOString().split('T')[0],
    }));

    addNotification('🚀 Welcome to StudyMate AI!', 'Your personalized study roadmap has been configured. Check your dashboard to begin!');
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // Subjects
  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSub]);
    return newSub;
  };

  const editSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subjectId !== id));
  };

  const addTopicToSubject = (subjectId: string, topic: { title: string; priority: Priority; difficulty: Difficulty }) => {
    const newTopic = {
      id: `top-${Date.now()}`,
      title: topic.title,
      completed: false,
      priority: topic.priority,
      difficulty: topic.difficulty,
    };
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const updatedTopics = [...s.topics, newTopic];
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        const progress = Math.round((completedCount / updatedTopics.length) * 100);
        return { ...s, topics: updatedTopics, progress };
      })
    );
  };

  const toggleTopicCompletion = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const updatedTopics = s.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t));
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        const progress = Math.round((completedCount / updatedTopics.length) * 100);
        return { ...s, topics: updatedTopics, progress };
      })
    );
  };

  // Tasks
  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const editTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: TaskStatus = t.status === 'completed' ? 'pending' : 'completed';
        const isNowCompleted = nextStatus === 'completed';

        if (isNowCompleted) {
          try {
            confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
          } catch (e) {}
        }

        return {
          ...t,
          status: nextStatus,
          completedAt: isNowCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );
  };

  // Exams
  const addExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
    };
    setExams((prev) => [...prev, newExam]);
    return newExam;
  };

  const editExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Flashcards & Spaced Repetition (SM-2 Algorithm)
  const addFlashcard = (cardData: Omit<Flashcard, 'id' | 'reviewCount' | 'masteryLevel'>) => {
    const newCard: Flashcard = {
      ...cardData,
      id: `fc-${Date.now()}`,
      reviewCount: 0,
      masteryLevel: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
    };
    setFlashcards((prev) => [newCard, ...prev]);
    return newCard;
  };

  const addMultipleFlashcards = (cards: Array<Omit<Flashcard, 'id' | 'reviewCount' | 'masteryLevel'>>) => {
    const created: Flashcard[] = cards.map((c, i) => ({
      ...c,
      id: `fc-${Date.now()}-${i}`,
      reviewCount: 0,
      masteryLevel: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
    }));
    setFlashcards((prev) => [...created, ...prev]);
  };

  const reviewFlashcard = (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    setFlashcards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const today = new Date();
        let daysToAdd = 1;
        let nextMastery = c.masteryLevel;

        switch (rating) {
          case 'again':
            daysToAdd = 0; // review today
            nextMastery = Math.max(0, c.masteryLevel - 1);
            break;
          case 'hard':
            daysToAdd = Math.max(1, Math.round((c.reviewCount || 1) * 1.2));
            nextMastery = Math.min(5, c.masteryLevel + 1);
            break;
          case 'good':
            daysToAdd = Math.max(2, Math.round((c.reviewCount + 1) * 2.5));
            nextMastery = Math.min(5, c.masteryLevel + 1);
            break;
          case 'easy':
            daysToAdd = Math.max(4, Math.round((c.reviewCount + 2) * 3.5));
            nextMastery = Math.min(5, c.masteryLevel + 2);
            break;
        }

        const nextDate = new Date(today.getTime() + daysToAdd * 86400000);
        return {
          ...c,
          reviewCount: (c.reviewCount || 0) + 1,
          masteryLevel: nextMastery,
          lastReviewed: today.toISOString().split('T')[0],
          nextReviewDate: nextDate.toISOString().split('T')[0],
        };
      })
    );
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
  };

  // Timetable
  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
    };
    setTimetableState((prev) => [...prev, newSlot]);
    return newSlot;
  };

  const editTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    setTimetableState((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetableState((prev) => prev.filter((s) => s.id !== id));
  };

  const setTimetable = (slots: TimetableSlot[]) => {
    setTimetableState(slots);
  };

  const toggleSlotCompletion = (id: string) => {
    setTimetableState((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  // Record Focus Session
  const recordFocusSession = (durationMinutes: number, subjectName: string, taskTitle?: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const session: FocusSession = {
      id: `fs-${Date.now()}`,
      timestamp: now.toISOString(),
      durationMinutes,
      subject: subjectName,
      taskTitle,
      type: 'pomodoro',
    };

    setFocusSessions((prev) => [session, ...prev]);

    // Update streak and total minutes
    setProfile((prev) => {
      const last = prev.lastStudyDate;
      let newStreak = prev.streak;

      if (last === todayStr) {
        // already studied today, streak stays
      } else {
        const lastDate = new Date(last);
        const diffDays = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      return {
        ...prev,
        streak: newStreak,
        lastStudyDate: todayStr,
        totalStudyMinutes: prev.totalStudyMinutes + durationMinutes,
      };
    });

    addNotification(
      '🎯 Focus Session Completed!',
      `Logged ${durationMinutes} minutes of focused study on ${subjectName}.`
    );

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.65 } });
    } catch (e) {}
  };

  // Notifications
  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'system') => {
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Send browser notification if enabled
    if (profile.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (e) {}
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    const perm = await Notification.requestPermission();
    const granted = perm === 'granted';
    updateProfile({ notificationsEnabled: granted });
    return granted;
  };

  // Chatbot
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, newMsg]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  // Data management
  const resetToDefaultData = () => {
    setProfile(initialProfile);
    setSubjects(initialSubjects);
    setTasks(initialTasks);
    setExams(initialExams);
    setFlashcards(initialFlashcards);
    setTimetableState(initialTimetableSlots);
    setFocusSessions(initialFocusSessions);
    setNotifications(initialNotifications);
    localStorage.removeItem(STORAGE_KEY);
    addNotification('🔄 System Reset', 'All study data restored to default demo state.');
  };

  const exportDataJson = () => {
    const data = {
      profile,
      subjects,
      tasks,
      exams,
      flashcards,
      timetable,
      focusSessions,
      notifications,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) setProfile(data.profile);
      if (data.subjects) setSubjects(data.subjects);
      if (data.tasks) setTasks(data.tasks);
      if (data.exams) setExams(data.exams);
      if (data.flashcards) setFlashcards(data.flashcards);
      if (data.timetable) setTimetableState(data.timetable);
      if (data.focusSessions) setFocusSessions(data.focusSessions);
      addNotification('📥 Data Imported', 'Your study data backup was restored successfully!');
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <StudyContext.Provider
      value={{
        profile,
        subjects,
        tasks,
        exams,
        flashcards,
        timetable,
        focusSessions,
        notifications,
        chatHistory,
        updateProfile,
        toggleTheme,
        completeOnboarding,
        addSubject,
        editSubject,
        deleteSubject,
        addTopicToSubject,
        toggleTopicCompletion,
        addTask,
        editTask,
        deleteTask,
        toggleTaskStatus,
        addExam,
        editExam,
        deleteExam,
        addFlashcard,
        addMultipleFlashcards,
        reviewFlashcard,
        deleteFlashcard,
        addTimetableSlot,
        editTimetableSlot,
        deleteTimetableSlot,
        setTimetable,
        toggleSlotCompletion,
        recordFocusSession,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        requestNotificationPermission,
        addChatMessage,
        clearChatHistory,
        resetToDefaultData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
