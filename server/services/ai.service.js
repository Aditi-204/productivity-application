const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy',
});

const isAIEnabled = () => {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
};

const generateReport = async (type, data) => {
  if (!isAIEnabled()) {
    return fallbackReport(type, data);
  }

  const periodLabel = type === 'weekly' ? 'this week' : 'this month';
  const days = type === 'weekly' ? 7 : 30;

  const prompt = `You are a productivity coach analyzing a team member's work data for ${periodLabel}.

Data for the last ${days} days:
- Total working days tracked: ${data.totalDays}
- Days present: ${data.presentDays}
- Days absent: ${data.absentDays}
- Days with EOD completed: ${data.eodCompletedDays}
- Attendance rate: ${data.attendanceRate}%
- Total tasks created: ${data.totalTasks}
- Total tasks completed: ${data.completedTasks}
- Overall completion rate: ${data.completionRate}%
- High priority completed: ${data.highPriorityCompleted} / ${data.totalHighPriority}
- Most productive day (most tasks done): ${data.bestDay || 'N/A'}
- Total estimated hours worked on completed tasks: ${data.totalHoursWorked}

${data.taskSummary ? `Task breakdown: ${data.taskSummary}` : ''}

Write a friendly, motivational report in plain text. Include:
1. A warm greeting
2. Key achievements this ${type}
3. Areas for improvement
4. A specific, actionable tip for next ${type}
5. A motivational closing

Keep it concise (3-4 paragraphs). Use emojis sparingly. Make it feel personal and encouraging.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a friendly productivity coach. Write encouraging, insightful work reports.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || fallbackReport(type, data);
  } catch (error) {
    console.error('AI report generation failed:', error.message);
    return fallbackReport(type, data);
  }
};

const generateEODSummary = async (todos) => {
  const completed = todos.filter(t => t.status === 'done');
  const total = todos.length;
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  const highPriorityCompleted = completed.filter(t => t.priority === 'high').length;
  const totalHighPriority = todos.filter(t => t.priority === 'high').length;
  const totalMinutes = completed.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  if (!isAIEnabled()) {
    return fallbackEODSummary(completed.length, total, completionRate, highPriorityCompleted, totalHighPriority, totalMinutes);
  }

  const taskList = todos.map(t =>
    `- [${t.status === 'done' ? 'x' : ' '}] ${t.title} (priority: ${t.priority}, ${t.estimatedMinutes || 0}min)`
  ).join('\n');

  const prompt = `Here is today's task list for a team member:

${taskList}

Write a brief, friendly end-of-day summary (2-3 sentences) that:
1. Mentions how many tasks were completed
2. Acknowledges the effort
3. Offers a gentle encouragement for tomorrow

Keep it warm and concise. Use emojis sparingly.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a friendly productivity coach writing end-of-day summaries.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || fallbackEODSummary(completed.length, total, completionRate, highPriorityCompleted, totalHighPriority, totalMinutes);
  } catch (error) {
    console.error('AI EOD summary failed:', error.message);
    return fallbackEODSummary(completed.length, total, completionRate, highPriorityCompleted, totalHighPriority, totalMinutes);
  }
};

const fallbackReport = (type, data) => {
  const period = type === 'weekly' ? 'week' : 'month';
  const { completionRate, attendanceRate, completedTasks, totalTasks, presentDays, totalDays } = data;

  let summary = `📊 ${type === 'weekly' ? 'Weekly' : 'Monthly'} Performance Report\n\n`;
  summary += `Hey there! Here's how your ${period} went:\n\n`;

  if (completionRate >= 80) {
    summary += `🔥 You crushed it this ${period}! Completing ${completedTasks}/${totalTasks} tasks (${completionRate}%) is impressive. Keep that momentum going!`;
  } else if (completionRate >= 50) {
    summary += `💪 Solid effort this ${period}! You wrapped up ${completedTasks}/${totalTasks} tasks (${completionRate}%). Good progress with room to push further.`;
  } else {
    summary += `🌱 This ${period} was a learning curve with ${completedTasks}/${totalTasks} tasks done (${completionRate}%). Every step counts — try breaking big tasks into smaller ones.`;
  }

  summary += `\n\n📅 Attendance: ${presentDays}/${totalDays} days present (${attendanceRate}%). `;

  if (attendanceRate >= 90) {
    summary += `Great consistency!`;
  } else if (attendanceRate >= 75) {
    summary += `Pretty reliable! Try to show up a bit more next ${period}.`;
  } else {
    summary += `Let's aim for better attendance next ${period}. You've got this!`;
  }

  summary += `\n\n💡 Tip for next ${period}: `;
  if (completionRate < 60) {
    summary += `Try the "Pomodoro Technique" — work in 25-minute focused bursts with 5-minute breaks. It helps tackle big tasks without feeling overwhelmed.`;
  } else {
    summary += `Set one "big win" goal each day — the task that matters most. Complete that first, and everything else feels easier.`;
  }

  summary += `\n\nKeep showing up for yourself. Progress > perfection! 🚀`;

  return summary;
};

const fallbackEODSummary = (completedCount, totalCount, completionRate, highPriorityCompleted, totalHighPriority, totalMinutes) => {
  let summary = `Today you completed ${completedCount} out of ${totalCount} tasks (${completionRate}% completion rate). `;

  if (completedCount > 0) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    summary += `You spent approximately ${hours}h ${mins}m on completed tasks. `;
  }

  if (totalHighPriority > 0) {
    summary += `You completed ${highPriorityCompleted} out of ${totalHighPriority} high-priority tasks. `;
  }

  if (completionRate >= 80) {
    summary += 'Great productivity today!';
  } else if (completionRate >= 50) {
    summary += 'Good progress. Try to finish remaining tasks tomorrow.';
  } else {
    summary += 'Consider breaking tasks into smaller chunks for better progress tomorrow.';
  }

  return summary;
};

module.exports = { generateReport, generateEODSummary };
