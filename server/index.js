const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const conversationHistory = new Map();

function getHistory(userId) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
}

function recordInteraction(userId, role, content) {
  const history = getHistory(userId);
  history.push({ role, content, timestamp: Date.now() });
  // keep only last 10 exchanges to limit prompt size
  if (history.length > 20) {
    history.splice(0, history.length - 20);
  }
}

async function callModel({ userId, systemPrompt, userPrompt, model = 'gpt-3.5-turbo', temperature = 0.7 }) {
  if (!OPENAI_API_KEY) {
    const error = new Error('Missing OpenAI API key');
    error.status = 503;
    throw error;
  }

  const history = getHistory(userId).map(({ role, content }) => ({ role, content }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userPrompt },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error('Failed to fetch completion');
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  const data = await response.json();
  const aiMessage = data.choices?.[0]?.message?.content?.trim() || '';

  recordInteraction(userId, 'user', userPrompt);
  recordInteraction(userId, 'assistant', aiMessage);

  return aiMessage;
}

function buildTaskSummary(tasks = []) {
  if (!tasks.length) {
    return 'No specific tasks provided.';
  }
  return tasks
    .map((task, index) => {
      const status = task.status ? `Status: ${task.status}` : 'Status: pending';
      const due = task.dueDate ? `Due: ${task.dueDate}` : 'No due date';
      const priority = task.priority ? `Priority: ${task.priority}` : 'Priority not set';
      return `${index + 1}. ${task.title} - ${status}; ${due}; ${priority}.`;
    })
    .join('\n');
}

app.post('/api/ai/daily-suggestions', async (req, res) => {
  const { userId = 'default', tasks = [], preferences = {}, notes } = req.body || {};

  const systemPrompt = `You are a helpful productivity assistant who knows how to prioritise tasks and encourage focused work.
Respond with actionable suggestions formatted in markdown bullet lists.`;
  const taskSummary = buildTaskSummary(tasks);
  const preferenceSummary = Object.entries(preferences)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const userPrompt = `Here is the latest task list and context for planning the day:\n\nTasks:\n${taskSummary}\n\nPreferences:\n${preferenceSummary || 'None provided.'}\n\nAdditional notes: ${notes || 'None.'}\n\nPlease recommend up to five focus suggestions for today, highlight any blockers, and suggest an energising break idea.`;

  try {
    const aiMessage = await callModel({ userId, systemPrompt, userPrompt, temperature: 0.6 });
    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Daily suggestions error:', error);
    res.status(error.status || 500).json({
      error: 'Unable to generate daily suggestions',
      details: error.body || error.message,
    });
  }
});

app.post('/api/ai/smart-schedule', async (req, res) => {
  const { userId = 'default', tasks = [], dayStart = '09:00', dayEnd = '17:00', focusBlocks = [] } = req.body || {};

  const systemPrompt = `You are an expert scheduler who creates achievable plans based on workload, constraints, and task context.
Return schedules as JSON with keys: blocks (array of { label, start, end, notes }) and summary.`;

  const blockSummary = focusBlocks
    .map((block) => `${block.start || '?'}-${block.end || '?'}: ${block.label || 'Focus block'}`)
    .join('\n');

  const userPrompt = `The user needs a smart schedule for today. Workday runs from ${dayStart} to ${dayEnd}.
Existing focus blocks:\n${blockSummary || 'None.'}\n\nTasks:\n${buildTaskSummary(tasks)}\n\nProduce a concise JSON schedule that respects due dates, priorities, and estimated durations. Provide a short summary explaining the rationale.`;

  try {
    const aiMessage = await callModel({ userId, systemPrompt, userPrompt, temperature: 0.4 });
    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Smart schedule error:', error);
    res.status(error.status || 500).json({
      error: 'Unable to generate smart schedule',
      details: error.body || error.message,
    });
  }
});

app.post('/api/ai/recap', async (req, res) => {
  const { userId = 'default', tasks = [], accomplishments = [], reflections = '' } = req.body || {};

  const systemPrompt = `You are a reflective coach who helps users celebrate wins and learn from their day.
Provide responses in markdown with sections for Wins, Lessons, and Tomorrow.`;

  const accomplishmentsText = accomplishments.length
    ? accomplishments.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : 'No accomplishments listed yet.';

  const userPrompt = `Help the user recap their day. Here are the tasks they worked on and their current status:\n${buildTaskSummary(tasks)}\n\nAccomplishments:\n${accomplishmentsText}\n\nPersonal reflections:\n${reflections || 'None provided.'}`;

  try {
    const aiMessage = await callModel({ userId, systemPrompt, userPrompt, temperature: 0.5 });
    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Recap error:', error);
    res.status(error.status || 500).json({
      error: 'Unable to generate recap',
      details: error.body || error.message,
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', hasApiKey: Boolean(OPENAI_API_KEY) });
});

app.listen(PORT, () => {
  console.log(`AI proxy server listening on port ${PORT}`);
});
