import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  BookmarkPlus,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const SummarizerView: React.FC = () => {
  const { subjects, editSubject, addNotification } = useStudy();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [notesText, setNotesText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToSubject, setSavedToSubject] = useState(false);

  const [summaryResult, setSummaryResult] = useState<{
    summaryMarkdown: string;
    keyTakeaways: string[];
    mnemonics: string;
    commonPitfalls: string[];
  } | null>({
    summaryMarkdown: `### 🎯 Core Principles of Relational Database Normalization

- **1NF**: Enforces atomic column values and unique row identification (no repeated groups).
- **2NF**: Achieves 1NF AND eliminates partial functional dependencies (all non-key attributes fully dependent on candidate key).
- **3NF**: Achieves 2NF AND eliminates transitive dependencies (X → Y, Y → Z eliminated unless X is a superkey).
- **BCNF**: Strictly requires that for every non-trivial functional dependency X → Y, X must be a superkey.`,
    keyTakeaways: [
      'BCNF guarantees zero redundancy from functional dependencies, but may not preserve dependencies.',
      '3NF preserves functional dependencies while permitting minor transitive redundancy.',
      'Always test candidate keys using attribute closure computation X+.'
    ],
    mnemonics: '1-2-3-B: Atomicity (1), Full-key (2), No-transit (3), Superkey-only (BCNF)',
    commonPitfalls: [
      'Assuming 3NF decomposition is always in BCNF.',
      'Forgetting that composite primary keys can have partial dependencies.',
      'Over-normalizing read-heavy systems causing expensive join overhead.'
    ]
  });

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !notesText.trim()) return;

    setIsSummarizing(true);
    setSavedToSubject(false);

    const selectedSubject = subjects.find((s) => s.id === subjectId);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject?.name || 'Academic Subject',
          topic: topic.trim(),
          notesText: notesText.trim(),
        }),
      });

      const data = await response.json();
      if (data) {
        setSummaryResult({
          summaryMarkdown: data.summaryMarkdown || data.summary || 'Summary generated.',
          keyTakeaways: data.keyTakeaways || [],
          mnemonics: data.mnemonics || '',
          commonPitfalls: data.commonPitfalls || [],
        });
        addNotification('📑 Revision Summary Generated', `Study guide created for ${topic || 'topic'}.`);
      }
    } catch (err: any) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    const text = `${summaryResult.summaryMarkdown}\n\nKey Takeaways:\n${summaryResult.keyTakeaways.join('\n')}\n\nMnemonic: ${summaryResult.mnemonics}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToSubjectNotes = () => {
    if (!summaryResult || !subjectId) return;
    const currentSub = subjects.find((s) => s.id === subjectId);
    if (!currentSub) return;

    const updatedNotes = currentSub.notes
      ? `${currentSub.notes}\n\n--- [Revision Summary: ${topic || 'Concept'}] ---\n${summaryResult.summaryMarkdown}`
      : summaryResult.summaryMarkdown;

    editSubject(subjectId, { notes: updatedNotes });
    setSavedToSubject(true);
    addNotification('💾 Saved to Subject', `Appended summary to ${currentSub.name} notebook.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            AI Revision Assistant & High-Yield Summarizer
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Transform unstructured lecture notes, chapters, or concept names into structured cheat sheets and exam-ready mnemonics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form (1 Col) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Generate Study Guide</span>
          </h2>

          <form onSubmit={handleGenerateSummary} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Target Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Concept / Topic Name
              </label>
              <input
                type="text"
                placeholder="e.g. Virtual Memory Paging & LRU"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Lecture Notes / Excerpt (Optional)
              </label>
              <textarea
                rows={6}
                placeholder="Paste class slides, code snippets, or textbook definitions here..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSummarizing || (!topic.trim() && !notesText.trim())}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01]"
            >
              <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
              <span>{isSummarizing ? 'Synthesizing Cheat Sheet...' : 'Generate Revision Guide'}</span>
            </button>
          </form>

          {/* Academic notice */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>AI study aids synthesize high-yield summaries for active recall. Verify specific details with your primary course syllabus.</span>
          </div>
        </div>

        {/* Right: Output Cheat Sheet (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {summaryResult ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Output Actions Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  High-Impact Revision Sheet
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToSubjectNotes}
                    disabled={savedToSubject}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{savedToSubject ? 'Saved in Notes' : 'Save to Subject Notes'}</span>
                  </button>
                </div>
              </div>

              {/* Main Markdown Text */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {summaryResult.summaryMarkdown}
              </div>

              {/* Key Takeaways */}
              {summaryResult.keyTakeaways && summaryResult.keyTakeaways.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                  <span className="font-extrabold text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Critical Exam Takeaways</span>
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {summaryResult.keyTakeaways.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mnemonic helper */}
              {summaryResult.mnemonics && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                  <span className="font-extrabold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>Memory Mnemonic / Mental Anchor</span>
                  </span>
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-bold">
                    {summaryResult.mnemonics}
                  </p>
                </div>
              )}

              {/* Common Pitfalls */}
              {summaryResult.commonPitfalls && summaryResult.commonPitfalls.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
                  <span className="font-extrabold text-xs text-rose-800 dark:text-rose-300">
                    ⚠️ Common Student Misconceptions in Exams:
                  </span>
                  <ul className="list-disc list-inside text-xs text-rose-900/90 dark:text-rose-200 space-y-1">
                    {summaryResult.commonPitfalls.map((pitfall, i) => (
                      <li key={i}>{pitfall}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
              Fill in the topic form on the left to generate an AI study summary.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
