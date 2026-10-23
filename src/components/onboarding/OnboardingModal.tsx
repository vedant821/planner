import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  BookOpen,
  Calendar,
  Clock,
  Target,
  GraduationCap,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, completeOnboarding } = useStudy();

  const [step, setStep] = useState(1);

  // Step 1: Basics
  const [name, setName] = useState(profile.name || 'Alex Chen');
  const [educationLevel, setEducationLevel] = useState(
    profile.educationLevel || 'Undergraduate (Computer Science)'
  );

  // Step 2: Subjects & Weak Areas
  const [subjectInputs, setSubjectInputs] = useState<string[]>([
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Operating Systems',
    'Machine Learning',
  ]);
  const [newSubText, setNewSubText] = useState('');
  const [weakSubjects, setWeakSubjects] = useState<string[]>(['Database Management Systems']);

  // Step 3: Availability & Preferred Windows
  const [dailyHours, setDailyHours] = useState(4.5);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([
    'Morning (08:00 - 12:00)',
    'Evening (18:00 - 22:00)',
  ]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<string[]>(['Sunday']);

  // Step 4: Goals & Exam Target
  const [shortTermGoal, setShortTermGoal] = useState(
    'Score 90%+ in upcoming midterms and establish consistent 4h study rhythm'
  );
  const [longTermGoal, setLongTermGoal] = useState(
    'Ace technical interviews and graduate with honors GPA'
  );

  if (!isOpen) return null;

  const handleToggleTime = (time: string) => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleToggleWeak = (subj: string) => {
    setWeakSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleAddSubject = () => {
    if (!newSubText.trim()) return;
    setSubjectInputs((prev) => [...prev, newSubText.trim()]);
    setNewSubText('');
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjectInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleComplete = () => {
    completeOnboarding(
      {
        name,
        educationLevel,
        dailyHours,
        preferredTimes,
        weeklyHolidays,
        weakSubjects,
        goals: {
          shortTerm: shortTermGoal,
          longTerm: longTermGoal,
        },
      },
      subjectInputs
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                StudyMate AI Onboarding
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">Step {step} of 4</span>
          </div>

          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Welcome! Let's personalize your study mentor 🎓
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tell us a bit about your current academic level so we can calibrate study density.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What should your AI mentor call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Academic Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="High School">High School</option>
                    <option value="Undergraduate (Computer Science)">Undergraduate (Computer Science)</option>
                    <option value="Undergraduate (Engineering / STEM)">Undergraduate (Engineering / STEM)</option>
                    <option value="Medical / Pre-Med">Medical / Pre-Med</option>
                    <option value="Law / Humanities">Law / Humanities</option>
                    <option value="Graduate / Master / PhD">Graduate / Master / PhD</option>
                    <option value="Competitive Exam Prep (GRE, MCAT, USMLE, GATE)">Competitive Exam Prep</option>
                    <option value="Self-Directed Lifelong Learner">Self-Directed Lifelong Learner</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  What subjects are you studying? 📚
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Add your courses and highlight any subjects where you need extra AI practice.
                </p>
              </div>

              {/* Add Subject Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Linear Algebra, Chemistry..."
                  value={newSubText}
                  onChange={(e) => setNewSubText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Add
                </button>
              </div>

              {/* Subjects List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">Active Subjects:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {subjectInputs.map((subj, idx) => {
                    const isWeak = weakSubjects.includes(subj);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{subj}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleWeak(subj)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                              isWeak
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isWeak ? '★ Weak Area' : 'Mark as Weak'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(idx)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Available Study Hours & Peak Windows ⏰
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How many hours can you realistically dedicate to focused studying daily?
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-700 dark:text-slate-300">Daily Study Target:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 text-base">
                    {dailyHours} Hours / Day
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  When do you focus best? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Early Morning (06:00 - 09:00)',
                    'Morning (09:00 - 12:00)',
                    'Afternoon (13:00 - 17:00)',
                    'Evening (18:00 - 22:00)',
                    'Night Owl (22:00 - 02:00)',
                  ].map((windowTime) => {
                    const isSelected = preferredTimes.includes(windowTime);
                    return (
                      <button
                        key={windowTime}
                        type="button"
                        onClick={() => handleToggleTime(windowTime)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {windowTime}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Academic Milestones & Exam Vision 🎯
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Define your primary exam goals and long-term targets to anchor your daily momentum.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Goal for the Next 30 Days:
                  </label>
                  <textarea
                    rows={2}
                    value={shortTermGoal}
                    onChange={(e) => setShortTermGoal(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Long-Term Academic or Career Aspiration:
                  </label>
                  <textarea
                    rows={2}
                    value={longTermGoal}
                    onChange={(e) => setLongTermGoal(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    StudyMate AI will immediately synthesize an initial timetable and active recall queue!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My Study Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
