import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Layers,
  Sparkles,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Flashcard, QuizQuestion } from '../../types';

export const FlashcardsView: React.FC = () => {
  const {
    flashcards,
    subjects,
    reviewFlashcard,
    addMultipleFlashcards,
    deleteFlashcard,
    addNotification,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');

  // Flashcard review state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAiGenerateModal, setShowAiGenerateModal] = useState(false);

  // AI Generator state
  const [genSubject, setGenSubject] = useState(subjects[0]?.name || 'Core Study');
  const [genTopic, setGenTopic] = useState('');
  const [genNotes, setGenNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 'demo-q1',
      question: 'Which normal form eliminates partial dependencies on candidate keys?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctIndex: 1,
      explanation: 'Second Normal Form (2NF) requires that no non-prime attribute is functionally dependent on any proper subset of any candidate key.',
      topic: 'Database Normalization',
    },
    {
      id: 'demo-q2',
      question: 'In Dijkstra’s shortest path algorithm, what happens if an edge has a negative weight?',
      options: [
        'The algorithm runs faster',
        'It produces an optimal solution in O(V^2)',
        'It may produce incorrect results because visited vertices are not revisited',
        'It converts negative edges to positive automatically'
      ],
      correctIndex: 2,
      explanation: 'Dijkstra assumes that adding edges to a path never decreases its cost (greedy property). With negative weights, Bellman-Ford must be used.',
      topic: 'Graph Algorithms',
    },
    {
      id: 'demo-q3',
      question: 'What is the primary role of the Translation Lookaside Buffer (TLB)?',
      options: [
        'To store disk blocks in RAM',
        'A high-speed hardware cache for virtual-to-physical address translations',
        'To schedule thread priorities',
        'To prevent race conditions in semaphores'
      ],
      correctIndex: 1,
      explanation: 'The TLB is a dedicated MMU cache storing recent page table mappings, avoiding slow multi-level memory lookups on page hits.',
      topic: 'Virtual Memory',
    }
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const activeCard = flashcards[currentCardIndex] || flashcards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReviewRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!activeCard) return;
    reviewFlashcard(activeCard.id, rating);
    setIsFlipped(false);
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleGenerateFlashcards = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          topic: genTopic,
          notesText: genNotes,
          count: 5,
        }),
      });

      const data = await response.json();
      if (data.flashcards && Array.isArray(data.flashcards)) {
        addMultipleFlashcards(
          data.flashcards.map((c: any) => ({
            subject: genSubject,
            topic: genTopic || 'Core Concept',
            front: c.front,
            back: c.back,
            tags: c.tags || [genSubject],
            difficulty: c.difficulty || 'Medium',
          }))
        );

        setShowAiGenerateModal(false);
        setGenTopic('');
        setGenNotes('');
        addNotification('🃏 Flashcards Created!', `Added ${data.flashcards.length} spaced-repetition flashcards.`);
      }
    } catch (err: any) {
      console.error('Failed to generate flashcards:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuizWithAI = async () => {
    setIsGeneratingQuiz(true);
    setUserAnswers({});
    setQuizSubmitted(false);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          topic: genTopic || 'Core Syllabus Concepts',
          difficulty: 'Medium',
          count: 5,
        }),
      });

      const data = await response.json();
      if (data.quiz && Array.isArray(data.quiz)) {
        setQuizQuestions(data.quiz);
        addNotification('📝 New Quiz Ready', `Generated 5 questions on ${genSubject}.`);
      }
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Quiz score calculation
  const score = Object.entries(userAnswers).filter(
    ([qIdx, ansIdx]) => quizQuestions[Number(qIdx)]?.correctIndex === ansIdx
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Active Recall & Knowledge Verification
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            SuperMemo SM-2 spaced repetition flashcards and AI-powered diagnostic quizzes.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Spaced Flashcards ({flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Practice Quiz
          </button>
        </div>
      </div>

      {activeTab === 'flashcards' ? (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Card {currentCardIndex + 1} of {flashcards.length}
            </span>

            <button
              onClick={() => setShowAiGenerateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate with AI</span>
            </button>
          </div>

          {/* Flashcard 3D Interactive Card */}
          {flashcards.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <p className="text-sm font-semibold text-slate-500">No flashcards in your deck yet.</p>
              <button
                onClick={() => setShowAiGenerateModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Create Flashcards with AI
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                onClick={handleFlip}
                className="cursor-pointer min-h-[300px] sm:min-h-[340px] rounded-3xl p-8 sm:p-12 flex flex-col justify-between transition-all duration-300 bg-gradient-to-br from-white via-slate-50 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-lg hover:shadow-xl hover:border-indigo-400"
              >
                {/* Card Top Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {activeCard.subject}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-400 font-medium">{activeCard.topic}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      activeCard.difficulty === 'Hard'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : activeCard.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {activeCard.difficulty}
                  </span>
                </div>

                {/* Card Main Body */}
                <div className="py-6 sm:py-8 text-center space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {isFlipped ? 'Answer & Explanation' : 'Active Recall Prompt'}
                  </span>
                  <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap">
                    {isFlipped ? activeCard.back : activeCard.front}
                  </p>
                </div>

                {/* Card Footer Hint */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Reviewed: {activeCard.reviewCount} times</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click card to {isFlipped ? 'view prompt' : 'reveal answer'}</span>
                  </span>
                </div>
              </div>

              {/* SM-2 Spaced Repetition Buttons */}
              {isFlipped ? (
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <p className="text-center text-xs font-bold text-slate-500">
                    Rate recall difficulty (Adjusts spaced repetition interval):
                  </p>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleReviewRating('again')}
                      className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs transition-colors"
                    >
                      Again (1 Day)
                    </button>
                    <button
                      onClick={() => handleReviewRating('hard')}
                      className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs transition-colors"
                    >
                      Hard (2 Days)
                    </button>
                    <button
                      onClick={() => handleReviewRating('good')}
                      className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs transition-colors"
                    >
                      Good (4 Days)
                    </button>
                    <button
                      onClick={() => handleReviewRating('easy')}
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs transition-colors"
                    >
                      Easy (7+ Days)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (currentCardIndex > 0) setCurrentCardIndex(currentCardIndex - 1);
                    }}
                    disabled={currentCardIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleFlip}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                  >
                    Reveal Answer
                  </button>
                  <button
                    onClick={() => {
                      if (currentCardIndex < flashcards.length - 1)
                        setCurrentCardIndex(currentCardIndex + 1);
                    }}
                    disabled={currentCardIndex === flashcards.length - 1}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
                  >
                    Next Card
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Practice MCQ Quiz Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Diagnostic Practice Quiz
              </h2>
              <p className="text-xs text-slate-400">
                Test active comprehension and detect weak topics instantly.
              </p>
            </div>

            <button
              onClick={handleGenerateQuizWithAI}
              disabled={isGeneratingQuiz}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingQuiz ? 'animate-spin' : ''}`} />
              <span>{isGeneratingQuiz ? 'Generating...' : 'New AI Quiz'}</span>
            </button>
          </div>

          {/* Quiz Questions */}
          <div className="space-y-4">
            {quizQuestions.map((q, qIndex) => {
              const selectedOpt = userAnswers[qIndex];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={q.id || qIndex}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Q{qIndex + 1}. {q.question}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {q.topic}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((option, optIndex) => {
                      const isChosen = selectedOpt === optIndex;
                      const isCorrect = q.correctIndex === optIndex;

                      let btnStyle =
                        'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-indigo-400';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                        } else if (isChosen && !isCorrect) {
                          btnStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 line-through';
                        }
                      } else if (isChosen) {
                        btnStyle =
                          'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs';
                      }

                      return (
                        <button
                          key={optIndex}
                          disabled={quizSubmitted}
                          onClick={() => setUserAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))}
                          className={`p-3 rounded-2xl border text-xs text-left transition-all flex items-center gap-3 ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Explanation:
                      </p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Score Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {quizSubmitted ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Score: {score} / {quizQuestions.length} ({Math.round((score / quizQuestions.length) * 100)}%)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {score === quizQuestions.length
                      ? 'Perfect mastery! Keep up the great consistency.'
                      : 'Review the explanations above to strengthen your weak spots.'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Answer all questions above, then click submit to verify your score.
              </p>
            )}

            <button
              onClick={() => {
                if (quizSubmitted) {
                  setUserAnswers({});
                  setQuizSubmitted(false);
                } else {
                  setQuizSubmitted(true);
                  if (score / quizQuestions.length >= 0.7) {
                    try {
                      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
                    } catch (e) {}
                  }
                }
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all self-stretch sm:self-auto"
            >
              {quizSubmitted ? 'Retake Quiz' : 'Submit & Review Answers'}
            </button>
          </div>
        </div>
      )}

      {/* AI Generate Flashcards Modal */}
      {showAiGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Generate Flashcards with AI</span>
            </h3>

            <form onSubmit={handleGenerateFlashcards} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject
                </label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
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
                  Topic / Concept Area
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B+ Tree Indexing vs Hash Indexing"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Optional Lecture Notes / Text Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste lecture excerpts, formula lists, or textbook paragraphs..."
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAiGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing...' : 'Generate 5 Cards'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
