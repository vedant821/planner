import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint (used by Render health checks)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'StudyMate AI',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Server-side Gemini client with recommended telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.8-flash';

// AI Study Assistant Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const {
      name = 'Student',
      educationLevel = 'College/University',
      dailyHours = 4,
      preferredTimes = ['Evening'],
      subjects = [],
      tasks = [],
      exams = [],
      streak = 3,
      weakSubjects = [],
    } = userContext;

    const subjectsSummary = subjects.length
      ? subjects.map((s: any) => `${s.name} (${s.difficulty || 'Medium'}, ${s.progress || 0}% completed, topics: ${(s.topics || []).slice(0, 3).map((t: any) => t.title || t).join(', ')})`).join('; ')
      : 'None added yet';

    const upcomingExamsSummary = exams.length
      ? exams.map((e: any) => `${e.subject} on ${e.date} (${e.daysLeft ?? '?'} days left, target score: ${e.targetScore || '85%'}` ).join('; ')
      : 'No upcoming exams';

    const pendingTasksSummary = tasks.length
      ? tasks.filter((t: any) => t.status !== 'completed').slice(0, 8).map((t: any) => `[${t.priority || 'Medium'}] ${t.title} (${t.subject}, est: ${t.duration || 45}m)`).join('; ')
      : 'No pending tasks';

    const systemInstruction = `You are StudyMate AI, an intelligent, empathetic, and highly effective personal AI study mentor and academic coach.
Student Profile:
- Name: ${name}
- Level: ${educationLevel}
- Daily Study Availability: ${dailyHours} hours/day
- Preferred Study Windows: ${Array.isArray(preferredTimes) ? preferredTimes.join(', ') : preferredTimes}
- Current Streak: ${streak} days
- Subjects: ${subjectsSummary}
- Upcoming Exams: ${upcomingExamsSummary}
- Pending/Active Tasks: ${pendingTasksSummary}
- Identified Weak Areas: ${Array.isArray(weakSubjects) ? weakSubjects.join(', ') : 'None specified'}

Your mission:
1. Provide realistic, scientifically sound academic scheduling and revision plans (Pomodoro, Active Recall, Spaced Repetition, Feynman Technique).
2. Never overwhelm the student: break complex topics into actionable 25-50 minute study blocks with built-in 5-10 minute breaks.
3. If the user asks to create, adjust, plan, or reschedule tasks, provide both a warm, motivational explanation AND structured schedule blocks in your response.
4. If the student missed targets, be encouraging and offer a realistic rebalancing strategy without guilt.
5. If the student asks for explanations, clarify concepts clearly with intuition, quick examples, and high-yield test tips.

Response Format Guidelines:
- Use clean Markdown with headers (## or ###), bullet points, and bold text for key terms.
- When generating schedule recommendations, structure them clearly by time/block, subject, topic, and expected outcome.
- When answering syllabus or exam queries, highlight priority weightings (High/Medium/Low).
- Always conclude with an actionable next step or a motivational check-in.`;

    if (!apiKey) {
      // Graceful fallback response if no API key is set
      return res.json({
        reply: `Hi ${name}! I'm StudyMate AI. I see you have ${dailyHours} available study hours today. Here is a balanced plan for your schedule:\n\n### 🎯 Recommended Today's Focus\n1. **High Priority Block (50 min)**: Work on your primary subject (${subjects[0]?.name || 'Core Subject'}). Focus on foundational concepts.\n2. **Break (10 min)**: Hydrate and step away from the screen.\n3. **Active Practice Block (45 min)**: Solve 5-10 practice questions.\n4. **Quick Review (15 min)**: Spaced repetition flashcards on yesterday's notes.\n\n*Tip: Connect your Gemini API key in Settings > Secrets to unlock personalized live AI reasoning!*`,
        actionSuggestions: [
          { type: 'schedule', title: `50m Focus: ${subjects[0]?.name || 'Core Study'}`, duration: 50, priority: 'High' },
          { type: 'schedule', title: '15m Spaced Revision Flashcards', duration: 15, priority: 'Medium' }
        ]
      });
    }

    // Format chat history for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Include recent history (last 8 messages)
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.content) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm here to help you optimize your study routine. What would you like to plan or review next?";

    return res.json({ reply });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return res.status(500).json({
      error: 'Failed to generate AI response',
      details: err?.message || 'Internal error',
      reply: "I had a brief hiccup connecting to the mentor brain, but I'm ready to keep planning. Could you rephrase your question or try once more?"
    });
  }
});

// AI Timetable & Daily/Weekly Schedule Generator
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { subjects = [], exams = [], dailyHours = 4, timeframe = 'daily', focusGoal = '' } = req.body;

    if (!apiKey) {
      // Fallback structured plan
      const defaultSlots = [
        { time: '09:00 - 09:50', subject: subjects[0]?.name || 'Mathematics', topic: 'Core Problem Solving & Theory', type: 'Focus Session', priority: 'High', duration: 50 },
        { time: '09:50 - 10:00', subject: 'Break', topic: 'Hydration & Eye Rest', type: 'Break', priority: 'Low', duration: 10 },
        { time: '10:00 - 10:50', subject: subjects[1]?.name || 'Computer Science', topic: 'Code Implementation & Exercises', type: 'Practice', priority: 'High', duration: 50 },
        { time: '10:50 - 11:10', subject: 'Break', topic: 'Walk & Light Stretch', type: 'Break', priority: 'Low', duration: 20 },
        { time: '11:10 - 12:00', subject: subjects[0]?.name || 'Mathematics', topic: 'Active Recall & Quick Flashcards', type: 'Revision', priority: 'Medium', duration: 50 },
      ];
      return res.json({ slots: defaultSlots, summary: 'Standard spaced focus schedule generated.' });
    }

    const prompt = `Create a realistic, scientifically optimized study schedule for a student.
Timeframe: ${timeframe}
Total Daily Available Study Time: ${dailyHours} hours
Current Focus / Target Goal: ${focusGoal || 'Exam preparation & subject mastery'}
Subjects: ${JSON.stringify(subjects.map((s: any) => ({ name: s.name, difficulty: s.difficulty, progress: s.progress })))}
Upcoming Exams: ${JSON.stringify(exams.map((e: any) => ({ subject: e.subject, date: e.date, daysLeft: e.daysLeft })))}

Requirements:
- Plan realistic blocks (30-60 min each) interspersed with 5-15 min breaks.
- Prioritize subjects with closer exams or 'Hard' difficulty.
- Allocate a dedicated spaced revision or recall session.
- Return ONLY valid JSON with this exact schema:
{
  "summary": "Brief 2-sentence rationale for this timetable balance",
  "slots": [
    {
      "time": "09:00 - 09:50",
      "subject": "Subject Name",
      "topic": "Specific actionable topic or task",
      "type": "Focus Session" | "Practice" | "Revision" | "Break",
      "priority": "High" | "Medium" | "Low" | "Critical",
      "duration": 50
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Generate Plan Error:', err);
    return res.status(500).json({ error: 'Failed to generate study timetable', details: err?.message });
  }
});

// AI Flashcards Generator
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { subject, topic, notesText, count = 6 } = req.body;

    if (!apiKey) {
      return res.json({
        flashcards: [
          {
            id: 'fc-1',
            front: `What is the core principle behind ${topic || subject || 'this concept'}?`,
            back: `It provides a systematic framework to break down complex tasks and verify understanding through active recall.`,
            tags: [subject || 'General', 'Fundamentals'],
            difficulty: 'Medium',
          },
          {
            id: 'fc-2',
            front: `Name two high-yield application scenarios for ${topic || subject || 'this topic'}.`,
            back: `1. Efficient problem analysis and algorithmic structuring.\n2. Optimization and error prevention in exam conditions.`,
            tags: [subject || 'General', 'Application'],
            difficulty: 'Easy',
          },
          {
            id: 'fc-3',
            front: `What is the most common pitfall students encounter in ${topic || subject || 'this area'}?`,
            back: `Confusing passive familiarity with active comprehension. Always test yourself without looking at the solution.`,
            tags: [subject || 'General', 'Pitfalls'],
            difficulty: 'Hard',
          }
        ]
      });
    }

    const prompt = `Generate ${count} high-yield, effective spaced-repetition flashcards for students.
Subject: ${subject || 'General Academic'}
Topic: ${topic || 'Key Concepts'}
Context Notes (if provided): ${notesText ? notesText.slice(0, 1500) : 'Standard academic syllabus requirements'}

Flashcard requirements:
- Front should pose a clear, thought-provoking question, formula prompt, or scenario.
- Back should provide a crisp, accurate, easy-to-digest answer with key terms highlighted.
- Include difficulty rating ('Easy', 'Medium', 'Hard').
- Return ONLY valid JSON with this schema:
{
  "flashcards": [
    {
      "id": "unique-string",
      "front": "Question/Prompt",
      "back": "Answer explanation",
      "tags": ["tag1", "tag2"],
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Generate Flashcards Error:', err);
    return res.status(500).json({ error: 'Failed to generate flashcards', details: err?.message });
  }
});

// AI MCQ Quiz Generator
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { subject, topic, difficulty = 'Medium', count = 5 } = req.body;

    if (!apiKey) {
      return res.json({
        quiz: [
          {
            id: 'q-1',
            question: `In ${subject || 'general study'}, which technique yields the highest retention rate according to cognitive science?`,
            options: ['Active Recall and Spaced Repetition', 'Passive Re-reading of Highlighted Notes', 'Cramming the night before an exam', 'Copying notes word for word'],
            correctIndex: 0,
            explanation: 'Active recall forces retrieval from memory pathways, strengthening neural synapses far better than passive re-reading.',
            topic: topic || 'Cognitive Science'
          },
          {
            id: 'q-2',
            question: `What is the optimal recommended length for a standard Pomodoro focus interval?`,
            options: ['10 minutes', '25 minutes', '90 minutes without breaks', '180 minutes'],
            correctIndex: 1,
            explanation: 'The standard Pomodoro interval is 25 minutes of sustained focus followed by a 5-minute break.',
            topic: topic || 'Time Management'
          }
        ]
      });
    }

    const prompt = `Generate an academic multiple-choice quiz of ${count} questions.
Subject: ${subject || 'General Academic'}
Topic: ${topic || 'Key Concepts'}
Difficulty Level: ${difficulty}

Quiz Rules:
- Exactly 4 realistic options per question.
- Exactly 1 clear correct answer.
- Provide a concise 1-2 sentence explanation of why the correct option is right.
- Return ONLY valid JSON with this schema:
{
  "quiz": [
    {
      "id": "q-1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why option 0 is correct...",
      "topic": "${topic || subject}"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Generate Quiz Error:', err);
    return res.status(500).json({ error: 'Failed to generate quiz', details: err?.message });
  }
});

// AI Quick Revision Summarizer & Weak Topic Analyzer
app.post('/api/summarize', async (req, res) => {
  try {
    const { subject, topic, notesText } = req.body;

    if (!notesText && !topic) {
      return res.status(400).json({ error: 'Topic or notesText is required.' });
    }

    if (!apiKey) {
      return res.json({
        summary: `### Quick Revision: ${topic || subject}\n\n- **Core Concept**: Understanding fundamental mechanisms and terminology is crucial for high exam scores.\n- **Key Formula/Rule**: Break complex operations into sequential atomic stages.\n- **Common Exam Trap**: Overlooking boundary cases and forgetting to review edge conditions.\n- **Quick Mnemonic**: **P.A.C.E** — Plan, Act, Check, Evaluate.`,
        keyTakeaways: ['Focus on active retrieval', 'Test edge cases', 'Practice timed problems'],
        mnemonics: 'P.A.C.E (Plan, Act, Check, Evaluate)'
      });
    }

    const prompt = `Create a high-impact revision cheat sheet and study summary.
Subject: ${subject || 'Academic Subject'}
Topic: ${topic || 'Core Concept'}
User Content / Notes: ${notesText || 'Standard academic curriculum'}

Provide:
1. "summaryMarkdown": Clean, structured Markdown with high-yield bullet points, core definitions, and formulas.
2. "keyTakeaways": Array of 3-5 critical test points.
3. "mnemonics": Helpful memory acronym or analogy if applicable.
4. "commonPitfalls": Array of 2-3 common student misconceptions in exams.

Return ONLY valid JSON with this schema:
{
  "summaryMarkdown": "string",
  "keyTakeaways": ["string"],
  "mnemonics": "string",
  "commonPitfalls": ["string"]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Summarize Error:', err);
    return res.status(500).json({ error: 'Failed to generate summary', details: err?.message });
  }
});

// AI Exam Prep Breakdown
app.post('/api/exam-breakdown', async (req, res) => {
  try {
    const { subject, examDate, daysLeft, targetScore = '90%', syllabus = '', dailyHours = 3 } = req.body;

    if (!apiKey) {
      return res.json({
        milestones: [
          { phase: 'Phase 1: Syllabus Coverage', days: `Days 1 to ${Math.max(1, Math.floor(daysLeft * 0.4))}`, focus: 'Cover all primary high-weightage chapters and take chapter-wise notes.' },
          { phase: 'Phase 2: Intensive Practice', days: `Days ${Math.max(2, Math.floor(daysLeft * 0.4) + 1)} to ${Math.max(2, Math.floor(daysLeft * 0.75))}`, focus: 'Solve past papers, timed questions, and identify weak topics.' },
          { phase: 'Phase 3: Final Spaced Revision & Mock Exams', days: `Days ${Math.max(3, Math.floor(daysLeft * 0.75) + 1)} to ${daysLeft}`, focus: 'Mock exam simulations, formula sheet revision, and confidence-building review.' }
        ],
        studyTips: [
          'Spend 60% of time solving problems, not just reading theory.',
          'Review error log every night for 15 minutes before bed.',
          'Take a full-length mock test at the exact time of the real exam.'
        ]
      });
    }

    const prompt = `Break down an upcoming exam preparation plan into structured phases and daily priorities.
Subject: ${subject}
Exam Date: ${examDate} (${daysLeft} days remaining)
Target Score: ${targetScore}
Daily Available Study Hours: ${dailyHours}
Syllabus / Key Topics: ${syllabus || 'Full subject syllabus'}

Return ONLY valid JSON with this schema:
{
  "milestones": [
    {
      "phase": "string (e.g. Phase 1: Foundation & Coverage)",
      "days": "string (e.g. Days 1-5)",
      "focus": "string detailed description of focus areas and targets"
    }
  ],
  "studyTips": ["string"]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Exam Breakdown Error:', err);
    return res.status(500).json({ error: 'Failed to break down exam syllabus', details: err?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`StudyMate AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
