import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Plus,
  Calendar,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Trash2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const ChatbotView: React.FC = () => {
  const {
    profile,
    subjects,
    tasks,
    exams,
    chatHistory,
    addChatMessage,
    clearChatHistory,
    addTask,
    addTimetableSlot,
  } = useStudy();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Create a 7-day DBMS revision plan',
    'I have an exam in 5 days, how should I prioritize?',
    'Plan 2 hours of DSA and 1 hour of Database today',
    'I missed yesterday\'s targets. Adjust my schedule',
    'Show my weak subjects and recommend a practice plan',
    'Explain the Feynman Technique for tough concepts',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');

    // Add user message to state
    addChatMessage({
      role: 'user',
      content: textToSend.trim(),
    });

    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
          userContext: {
            name: profile.name,
            educationLevel: profile.educationLevel,
            dailyHours: profile.dailyHours,
            preferredTimes: profile.preferredTimes,
            streak: profile.streak,
            subjects: subjects.map((s) => ({
              name: s.name,
              difficulty: s.difficulty,
              progress: s.progress,
              topics: s.topics.map((t) => t.title),
            })),
            tasks: tasks.map((t) => ({
              title: t.title,
              subject: t.subjectName,
              priority: t.priority,
              status: t.status,
              duration: t.estimatedMinutes,
            })),
            exams: exams.map((e) => ({
              subject: e.subject,
              date: e.date,
              targetScore: e.targetScore,
            })),
            weakSubjects: profile.weakSubjects,
          },
        }),
      });

      const data = await response.json();
      if (data.reply) {
        addChatMessage({
          role: 'assistant',
          content: data.reply,
          actionSuggestions: data.actionSuggestions,
        });
      } else {
        throw new Error(data.error || 'No response from assistant');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      addChatMessage({
        role: 'assistant',
        content: `I encountered an issue connecting to the AI mentor engine (${err.message || 'Network error'}). However, based on your active goals, remember to keep your focus blocks under 50 minutes and test yourself actively using flashcards!`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddSlot = (actionId: string, title: string, duration: number) => {
    addTimetableSlot({
      day: 'Monday',
      time: '14:00 - 15:00',
      subject: subjects[0]?.name || 'Core Study',
      topic: title,
      type: 'Focus Session',
      priority: 'High',
      duration: duration || 50,
    });
    setAddedItems((prev) => ({ ...prev, [actionId]: true }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                StudyMate AI Mentor
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized for {profile.name} • {profile.dailyHours} hrs daily availability
            </p>
          </div>
        </div>

        <button
          onClick={clearChatHistory}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatHistory.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2 font-normal">
                  {msg.content}
                </div>

                {/* Optional structured action suggestions */}
                {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Suggested Actions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.actionSuggestions.map((action, idx) => {
                        const key = `${msg.id}-${idx}`;
                        const isAdded = addedItems[key];
                        return (
                          <button
                            key={key}
                            disabled={isAdded}
                            onClick={() => handleQuickAddSlot(key, action.title, action.duration || 50)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Scheduled in Timetable</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add: {action.title}</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-2 text-[10px] ${
                    isUser ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/90 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Analyzing schedule, syllabus priorities & drafting recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-1">
          Quick queries:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 sm:gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask StudyMate anything (e.g. 'Plan 2 hours of DBMS', 'Reschedule missed tasks', 'Quiz me')..."
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-hidden transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
