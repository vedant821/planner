import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ExternalLink,
  Edit2,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Priority, Difficulty } from '../../types';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    addSubject,
    deleteSubject,
    addTopicToSubject,
    toggleTopicCompletion,
  } = useStudy();

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // New subject state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [targetScore, setTargetScore] = useState('90%');
  const [notes, setNotes] = useState('');

  // New topic state for inline adding
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicPriority, setNewTopicPriority] = useState<Priority>('High');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<Difficulty>('Medium');
  const [activeSubjectForTopic, setActiveSubjectForTopic] = useState<string | null>(null);

  const colors = ['#6366F1', '#10B981', '#8B5CF6', '#0ea5e9', '#F59E0B', '#EC4899', '#EF4444'];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      name: name.trim(),
      code: code.trim(),
      color,
      icon: 'BookOpen',
      difficulty,
      progress: 0,
      targetScore,
      notes: notes.trim(),
      resources: [],
      topics: [],
    });

    setName('');
    setCode('');
    setNotes('');
    setShowAddSubjectModal(false);
  };

  const handleAddTopic = (subjectId: string) => {
    if (!newTopicTitle.trim()) return;
    addTopicToSubject(subjectId, {
      title: newTopicTitle.trim(),
      priority: newTopicPriority,
      difficulty: newTopicDifficulty,
    });
    setNewTopicTitle('');
    setActiveSubjectForTopic(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Subjects & Syllabus Breakdown
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize academic curriculum, track topic completion rates, and manage learning resources.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjects.map((subj) => {
          const completedTopicsCount = subj.topics.filter((t) => t.completed).length;
          const isExpanded = selectedSubjectId === subj.id;

          return (
            <div
              key={subj.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Subject Title & Bar */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
                    style={{ backgroundColor: subj.color }}
                  >
                    {subj.code ? subj.code.slice(0, 3) : subj.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {subj.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {subj.code || 'Curriculum Subject'} • Target: <span className="font-bold text-indigo-600 dark:text-indigo-400">{subj.targetScore}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      subj.difficulty === 'Hard'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : subj.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {subj.difficulty}
                  </span>

                  <button
                    onClick={() => deleteSubject(subj.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Syllabus Mastery ({completedTopicsCount}/{subj.topics.length} topics)
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {subj.progress}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${subj.progress}%`, backgroundColor: subj.color }}
                  />
                </div>
              </div>

              {/* Notes */}
              {subj.notes && (
                <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic border border-slate-100 dark:border-slate-800">
                  "{subj.notes}"
                </p>
              )}

              {/* Topics Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Syllabus Topics
                  </span>
                  <button
                    onClick={() =>
                      setActiveSubjectForTopic(activeSubjectForTopic === subj.id ? null : subj.id)
                    }
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>
                </div>

                {/* Inline add topic input */}
                {activeSubjectForTopic === subj.id && (
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                    <input
                      type="text"
                      placeholder="Topic name (e.g. Graph Algorithms, Paging)..."
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={newTopicPriority}
                          onChange={(e) => setNewTopicPriority(e.target.value as Priority)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-semibold"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <select
                          value={newTopicDifficulty}
                          onChange={(e) => setNewTopicDifficulty(e.target.value as Difficulty)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-semibold"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveSubjectForTopic(null)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddTopic(subj.id)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Topic rows */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {subj.topics.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No topics added yet.</p>
                  ) : (
                    subj.topics.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleTopicCompletion(subj.id, t.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          t.completed
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30 text-slate-400'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {t.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            t.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reference Resources */}
              {subj.resources && subj.resources.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 mb-1.5">Study Resources</p>
                  <div className="flex flex-wrap gap-2">
                    {subj.resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        <span>{res.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Add New Academic Subject
            </h3>

            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS 420"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Target Score
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 95%"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        difficulty === d
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Key Focus Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Important exam topics, instructor emphasis, or key formulas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
