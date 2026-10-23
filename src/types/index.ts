export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface UserProfile {
  name: string;
  email: string;
  educationLevel: string;
  dailyHours: number;
  preferredTimes: string[];
  goals: {
    shortTerm: string;
    longTerm: string;
  };
  strongSubjects: string[];
  weakSubjects: string[];
  weeklyHolidays: string[];
  streak: number;
  lastStudyDate: string;
  totalStudyMinutes: number;
  completedOnboarding: boolean;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  reminderMinutesBefore: number;
  timezone: string;
}

export interface SubjectTopic {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  difficulty: Difficulty;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color: string;
  icon: string;
  difficulty: Difficulty;
  progress: number; // 0 to 100
  targetScore: string;
  notes?: string;
  resources: Array<{ id: string; title: string; url: string }>;
  topics: SubjectTopic[];
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  topicTitle?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  actualMinutes?: number;
  scheduledTime?: string; // e.g. "09:00 - 09:45"
  dayOfWeek?: string; // 'Monday', 'Tuesday', etc.
  notes?: string;
  resources?: string[];
  completedAt?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  targetScore: string;
  syllabus: string;
  priority: Priority;
  weightagePercent?: number;
  prepMilestones?: Array<{
    phase: string;
    days: string;
    focus: string;
  }>;
}

export interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: Difficulty;
  lastReviewed?: string;
  nextReviewDate?: string;
  reviewCount: number;
  masteryLevel: number; // 0 to 5
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  userSelectedIndex?: number;
}

export interface FocusSession {
  id: string;
  timestamp: string;
  durationMinutes: number;
  subject: string;
  taskTitle?: string;
  type: 'pomodoro' | 'short_break' | 'long_break';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionSuggestions?: Array<{
    type: 'task' | 'schedule' | 'flashcard';
    title: string;
    duration?: number;
    priority?: Priority;
    details?: any;
  }>;
}

export interface TimetableSlot {
  id: string;
  day: string; // 'Monday', 'Tuesday', etc.
  time: string; // '09:00 - 09:50'
  subject: string;
  topic: string;
  type: 'Focus Session' | 'Practice' | 'Revision' | 'Break';
  priority: Priority;
  duration: number;
  completed?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'reminder' | 'streak' | 'exam' | 'system';
}
