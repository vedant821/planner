import { UserProfile, Subject, Task, Exam, Flashcard, TimetableSlot, FocusSession, AppNotification } from '../types';

export const initialProfile: UserProfile = {
  name: 'Alex Chen',
  email: 'alex.chen@student.edu',
  educationLevel: 'Undergraduate (Computer Science)',
  dailyHours: 4.5,
  preferredTimes: ['Morning (08:00 - 12:00)', 'Evening (18:00 - 22:00)'],
  goals: {
    shortTerm: 'Score above 90% in DBMS & OS midterms and build consistent 4-hour daily streak',
    longTerm: 'Secure top-tier software engineering internship and maintain 3.8+ GPA',
  },
  strongSubjects: ['Data Structures & Algorithms', 'Web Development'],
  weakSubjects: ['Database Management Systems', 'Computer Networks'],
  weeklyHolidays: ['Sunday'],
  streak: 5,
  lastStudyDate: new Date().toISOString().split('T')[0],
  totalStudyMinutes: 2180,
  completedOnboarding: true,
  theme: 'dark',
  notificationsEnabled: true,
  reminderMinutesBefore: 15,
  timezone: 'America/New_York (EST)',
};

export const initialSubjects: Subject[] = [
  {
    id: 'subj-1',
    name: 'Data Structures & Algorithms',
    code: 'CS 301',
    color: '#6366F1', // indigo
    icon: 'Code2',
    difficulty: 'Medium',
    progress: 72,
    targetScore: '95%',
    notes: 'Focus on time complexities, dynamic programming recurrence, and graph traversal edge cases.',
    resources: [
      { id: 'res-1', title: 'NeetCode Roadmap', url: 'https://neetcode.io' },
      { id: 'res-2', title: 'Visualgo Algorithm Visualizer', url: 'https://visualgo.net' }
    ],
    topics: [
      { id: 'top-1', title: 'Binary Search & Two Pointers', completed: true, priority: 'High', difficulty: 'Medium' },
      { id: 'top-2', title: 'Graphs (BFS/DFS, Dijkstra, Topological Sort)', completed: true, priority: 'Critical', difficulty: 'Hard' },
      { id: 'top-3', title: 'Dynamic Programming (1D & 2D Memoization)', completed: false, priority: 'Critical', difficulty: 'Hard' },
      { id: 'top-4', title: 'Trie and Segment Trees', completed: false, priority: 'Medium', difficulty: 'Hard' }
    ]
  },
  {
    id: 'subj-2',
    name: 'Database Management Systems',
    code: 'CS 310',
    color: '#10B981', // emerald
    icon: 'Database',
    difficulty: 'Hard',
    progress: 58,
    targetScore: '90%',
    notes: 'Midterm covers Relational Algebra, B+ Trees indexing, and BCNF normalization anomalies.',
    resources: [
      { id: 'res-3', title: 'CMU Database Group Lectures', url: 'https://15445.courses.cs.cmu.edu' }
    ],
    topics: [
      { id: 'top-5', title: 'Relational Algebra & SQL Joins', completed: true, priority: 'Medium', difficulty: 'Easy' },
      { id: 'top-6', title: 'Normalization (1NF, 2NF, 3NF, BCNF)', completed: false, priority: 'Critical', difficulty: 'Hard' },
      { id: 'top-7', title: 'Transaction ACID Properties & 2PL Locking', completed: false, priority: 'High', difficulty: 'Hard' },
      { id: 'top-8', title: 'B+ Tree Indexing & Hash Indices', completed: false, priority: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'subj-3',
    name: 'Operating Systems & System Architecture',
    code: 'CS 330',
    color: '#8B5CF6', // violet
    icon: 'Cpu',
    difficulty: 'Hard',
    progress: 45,
    targetScore: '88%',
    notes: 'Core emphasis on memory paging, virtual memory page replacement, and semaphore deadlocks.',
    resources: [
      { id: 'res-4', title: 'OSTEP Operating Systems Three Easy Pieces', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/' }
    ],
    topics: [
      { id: 'top-9', title: 'Process Scheduling (Round Robin, CFS, SJF)', completed: true, priority: 'Medium', difficulty: 'Medium' },
      { id: 'top-10', title: 'Deadlock Detection & Banker\'s Algorithm', completed: false, priority: 'High', difficulty: 'Hard' },
      { id: 'top-11', title: 'Virtual Memory, TLB & LRU Paging', completed: false, priority: 'Critical', difficulty: 'Hard' },
      { id: 'top-12', title: 'File Systems & Inode Allocation', completed: false, priority: 'Low', difficulty: 'Medium' }
    ]
  },
  {
    id: 'subj-4',
    name: 'Machine Learning & Linear Algebra',
    code: 'CS 450',
    color: '#0ea5e9', // sky
    icon: 'BrainCircuit',
    difficulty: 'Medium',
    progress: 80,
    targetScore: '92%',
    notes: 'Gradient descent, cross-entropy loss, backpropagation, and matrix eigenvalues.',
    resources: [
      { id: 'res-5', title: '3Blue1Brown Essence of Linear Algebra', url: 'https://www.3blue1brown.com' }
    ],
    topics: [
      { id: 'top-13', title: 'Matrix SVD & Eigenvalue Decompositions', completed: true, priority: 'High', difficulty: 'Medium' },
      { id: 'top-14', title: 'Gradient Descent & Convex Optimization', completed: true, priority: 'High', difficulty: 'Easy' },
      { id: 'top-15', title: 'Multi-layer Perceptrons & Backprop', completed: true, priority: 'Critical', difficulty: 'Medium' },
      { id: 'top-16', title: 'Attention Mechanism & Transformers', completed: false, priority: 'Medium', difficulty: 'Hard' }
    ]
  }
];

const todayStr = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
const inFiveDays = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Solve 4 Dynamic Programming (Knapsack & Coin Change)',
    subjectId: 'subj-1',
    subjectName: 'Data Structures & Algorithms',
    topicTitle: 'Dynamic Programming',
    priority: 'Critical',
    status: 'in_progress',
    dueDate: todayStr,
    estimatedMinutes: 60,
    scheduledTime: '09:00 - 10:00',
    dayOfWeek: 'Monday',
    notes: 'Review space optimization technique from O(N*W) to O(W).',
  },
  {
    id: 'task-2',
    title: 'BCNF Normalization Decomposition practice problems',
    subjectId: 'subj-2',
    subjectName: 'Database Management Systems',
    topicTitle: 'Normalization',
    priority: 'Critical',
    status: 'pending',
    dueDate: todayStr,
    estimatedMinutes: 50,
    scheduledTime: '10:30 - 11:20',
    dayOfWeek: 'Monday',
    notes: 'Check for dependency preservation vs lossless join properties.',
  },
  {
    id: 'task-3',
    title: 'Banker\'s Algorithm deadlock avoidance code simulation',
    subjectId: 'subj-3',
    subjectName: 'Operating Systems & System Architecture',
    topicTitle: 'Deadlock Detection',
    priority: 'High',
    status: 'pending',
    dueDate: tomorrow,
    estimatedMinutes: 45,
    scheduledTime: '18:00 - 18:45',
    dayOfWeek: 'Tuesday',
    notes: 'Calculate Need Matrix = Max - Allocation.',
  },
  {
    id: 'task-4',
    title: 'Review Transformer Self-Attention mathematical derivations',
    subjectId: 'subj-4',
    subjectName: 'Machine Learning & Linear Algebra',
    topicTitle: 'Attention Mechanism',
    priority: 'Medium',
    status: 'pending',
    dueDate: inThreeDays,
    estimatedMinutes: 40,
    scheduledTime: '19:00 - 19:40',
    dayOfWeek: 'Wednesday',
  },
  {
    id: 'task-5',
    title: 'Dijkstra shortest path algorithm implementation & tests',
    subjectId: 'subj-1',
    subjectName: 'Data Structures & Algorithms',
    topicTitle: 'Graphs',
    priority: 'High',
    status: 'completed',
    dueDate: todayStr,
    estimatedMinutes: 45,
    actualMinutes: 42,
    completedAt: todayStr,
    notes: 'Used min-heap with priority queue in O((V + E) log V).',
  },
  {
    id: 'task-6',
    title: 'Relational Algebra syntax quiz review',
    subjectId: 'subj-2',
    subjectName: 'Database Management Systems',
    topicTitle: 'Relational Algebra',
    priority: 'Medium',
    status: 'completed',
    dueDate: todayStr,
    estimatedMinutes: 30,
    actualMinutes: 28,
    completedAt: todayStr,
  }
];

export const initialExams: Exam[] = [
  {
    id: 'exam-1',
    title: 'DBMS Midterm Examination',
    subject: 'Database Management Systems',
    date: inFiveDays,
    targetScore: '92%',
    syllabus: 'Chapters 1-7: ER diagrams, Relational Algebra, SQL, Normalization 1NF-BCNF, B+ Trees Indexing, Transaction ACID & Recovery.',
    priority: 'Critical',
    weightagePercent: 30,
    prepMilestones: [
      { phase: 'Phase 1: Normalization & Indexing Mastery', days: 'Days 1 - 2', focus: 'BCNF, 3NF decomposition, B+ tree split and merge operations.' },
      { phase: 'Phase 2: Transactions & ACID Protocol', days: 'Days 3 - 4', focus: '2-Phase Locking, Serializability, WAL logs and undo/redo protocols.' },
      { phase: 'Phase 3: Timed Past Exam Simulation', days: 'Day 5', focus: 'Simulate 2-hour paper under real test constraints.' }
    ]
  },
  {
    id: 'exam-2',
    title: 'Operating Systems Comprehensive Final',
    subject: 'Operating Systems & System Architecture',
    date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    targetScore: '90%',
    syllabus: 'Processes, CPU Scheduling, Synchronization & Deadlocks, Memory Management, Paging, Virtual Memory, File Systems.',
    priority: 'High',
    weightagePercent: 40,
    prepMilestones: [
      { phase: 'Phase 1: Concurrency & Semaphores', days: 'Days 1 - 5', focus: 'Reader-Writer problem, Dining Philosophers, Peterson algorithm.' },
      { phase: 'Phase 2: Memory & Page Replacement', days: 'Days 6 - 10', focus: 'FIFO vs LRU vs Optimal, Belady anomaly, TLB hit rates.' },
      { phase: 'Phase 3: Revision & Practice Tests', days: 'Days 11 - 14', focus: 'Mock exams, cheat sheet consolidation, speed problem drills.' }
    ]
  }
];

export const initialFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    subject: 'Database Management Systems',
    topic: 'Normalization',
    front: 'What is the strict condition for a relation R to be in Boyce-Codd Normal Form (BCNF)?',
    back: 'For every non-trivial functional dependency X → Y, X must be a superkey of relation R.',
    tags: ['DBMS', 'BCNF', 'Keys'],
    difficulty: 'Hard',
    lastReviewed: todayStr,
    nextReviewDate: tomorrow,
    reviewCount: 3,
    masteryLevel: 4
  },
  {
    id: 'fc-2',
    subject: 'Database Management Systems',
    topic: 'ACID Properties',
    front: 'What does the "I" (Isolation) in ACID guarantee during concurrent transaction execution?',
    back: 'The intermediate states of a transaction are invisible to other concurrently executing transactions, ensuring the schedule is equivalent to a serial execution.',
    tags: ['DBMS', 'ACID', 'Transactions'],
    difficulty: 'Medium',
    lastReviewed: todayStr,
    nextReviewDate: inThreeDays,
    reviewCount: 4,
    masteryLevel: 5
  },
  {
    id: 'fc-3',
    subject: 'Operating Systems & System Architecture',
    topic: 'Deadlocks',
    front: 'State the 4 necessary Coffman conditions for a deadlock to occur in an operating system.',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
    tags: ['OS', 'Deadlocks', 'Coffman'],
    difficulty: 'Medium',
    lastReviewed: todayStr,
    nextReviewDate: tomorrow,
    reviewCount: 2,
    masteryLevel: 3
  },
  {
    id: 'fc-4',
    subject: 'Data Structures & Algorithms',
    topic: 'Graphs',
    front: 'What is the time complexity of Dijkstra’s Algorithm using a Fibonacci Heap vs a Standard Binary Min-Heap?',
    back: 'Binary Min-Heap: O((V + E) log V)\nFibonacci Heap: O(E + V log V)\nNote: Dijkstra fails with negative edge weights!',
    tags: ['DSA', 'Graphs', 'Dijkstra'],
    difficulty: 'Hard',
    lastReviewed: todayStr,
    nextReviewDate: inThreeDays,
    reviewCount: 5,
    masteryLevel: 5
  },
  {
    id: 'fc-5',
    subject: 'Machine Learning & Linear Algebra',
    topic: 'Attention',
    front: 'Write the formula for Scaled Dot-Product Attention in the Transformer architecture.',
    back: 'Attention(Q, K, V) = softmax((Q · K^T) / sqrt(d_k)) · V\nThe scaling factor 1/sqrt(d_k) prevents extremely small gradients when d_k is large.',
    tags: ['ML', 'Transformers', 'Math'],
    difficulty: 'Hard',
    lastReviewed: todayStr,
    nextReviewDate: tomorrow,
    reviewCount: 1,
    masteryLevel: 2
  }
];

export const initialTimetableSlots: TimetableSlot[] = [
  { id: 'tt-1', day: 'Monday', time: '08:30 - 09:20', subject: 'Data Structures & Algorithms', topic: 'DP: Knapsack Variations', type: 'Focus Session', priority: 'Critical', duration: 50, completed: true },
  { id: 'tt-2', day: 'Monday', time: '09:20 - 09:30', subject: 'Break', topic: 'Water & Visual Rest', type: 'Break', priority: 'Low', duration: 10, completed: true },
  { id: 'tt-3', day: 'Monday', time: '09:30 - 10:20', subject: 'Database Management Systems', topic: 'BCNF Functional Dependencies', type: 'Practice', priority: 'Critical', duration: 50, completed: false },
  { id: 'tt-4', day: 'Monday', time: '10:20 - 10:35', subject: 'Break', topic: 'Short Walk & Posture Check', type: 'Break', priority: 'Low', duration: 15, completed: false },
  { id: 'tt-5', day: 'Monday', time: '10:35 - 11:15', subject: 'Database Management Systems', topic: 'Spaced Recall Flashcards', type: 'Revision', priority: 'High', duration: 40, completed: false },
  { id: 'tt-6', day: 'Tuesday', time: '09:00 - 09:50', subject: 'Operating Systems & System Architecture', topic: 'Virtual Memory & Page Tables', type: 'Focus Session', priority: 'High', duration: 50, completed: false },
  { id: 'tt-7', day: 'Tuesday', time: '10:00 - 10:50', subject: 'Data Structures & Algorithms', topic: 'Trie & Prefix Tree Drills', type: 'Practice', priority: 'Medium', duration: 50, completed: false },
  { id: 'tt-8', day: 'Wednesday', time: '08:30 - 09:20', subject: 'Database Management Systems', topic: 'Transaction Isolation Levels', type: 'Focus Session', priority: 'Critical', duration: 50, completed: false },
  { id: 'tt-9', day: 'Thursday', time: '09:00 - 10:00', subject: 'Machine Learning & Linear Algebra', topic: 'Transformer Attention Code', type: 'Focus Session', priority: 'Medium', duration: 60, completed: false },
  { id: 'tt-10', day: 'Friday', time: '09:00 - 10:30', subject: 'Database Management Systems', topic: 'Full Midterm Mock Exam', type: 'Practice', priority: 'Critical', duration: 90, completed: false },
  { id: 'tt-11', day: 'Saturday', time: '10:00 - 11:30', subject: 'Operating Systems & System Architecture', topic: 'Weekly Spaced Revision', type: 'Revision', priority: 'High', duration: 90, completed: false },
];

export const initialFocusSessions: FocusSession[] = [
  { id: 'fs-1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), durationMinutes: 50, subject: 'Data Structures & Algorithms', taskTitle: 'Graph Algorithms', type: 'pomodoro' },
  { id: 'fs-2', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), durationMinutes: 50, subject: 'Database Management Systems', taskTitle: 'Relational Algebra', type: 'pomodoro' },
  { id: 'fs-3', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), durationMinutes: 45, subject: 'Operating Systems & System Architecture', taskTitle: 'CPU Scheduling', type: 'pomodoro' },
  { id: 'fs-4', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), durationMinutes: 60, subject: 'Machine Learning & Linear Algebra', taskTitle: 'Matrix Math', type: 'pomodoro' },
  { id: 'fs-5', timestamp: new Date().toISOString(), durationMinutes: 50, subject: 'Data Structures & Algorithms', taskTitle: 'Binary Search', type: 'pomodoro' },
];

export const initialNotifications: AppNotification[] = [
  { id: 'n-1', title: '🔥 5-Day Study Streak!', message: 'Great job Alex! You have completed your planned focus sessions 5 days in a row.', timestamp: '1 hour ago', read: false, type: 'streak' },
  { id: 'n-2', title: '⏳ DBMS Midterm in 5 Days', message: 'You have 3 critical topics pending: Normalization, Indexing, and ACID.', timestamp: '3 hours ago', read: false, type: 'exam' },
  { id: 'n-3', title: '🧠 Spaced Repetition Due', message: '5 flashcards on Database Normalization are scheduled for review today.', timestamp: 'Today, 08:00 AM', read: true, type: 'reminder' }
];
