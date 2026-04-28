function compact(text) {
  return String(text || '').trim().replace(/\s+/g, ' ');
}

export function buildAssistantReply({ prompt, teacherSkill, learnerSkill, recentMessages = [] }) {
  const cleanPrompt = compact(prompt);
  const topic = teacherSkill?.name || 'the lesson topic';
  const learnerContext = learnerSkill?.name || 'their current skill set';
  const history = recentMessages.filter(Boolean).slice(-4).join(' | ');

  if (!cleanPrompt) {
    return `I can help with ${topic}. Ask for a short explanation, a step-by-step plan, examples, quiz questions, or a recap of what the teacher just covered.`;
  }

  const lower = cleanPrompt.toLowerCase();

  if (lower.includes('quiz') || lower.includes('question')) {
    return `Quick ${topic} quiz:\n1. Explain the core concept in one sentence.\n2. Give one practical example.\n3. What is a common mistake beginners make?\n4. How would you practice this after class?`;
  }

  if (lower.includes('summary') || lower.includes('recap')) {
    return `Recap for ${topic}:\n- Focus on the main concept the teacher is explaining.\n- Connect it to ${learnerContext} so the learner sees how it applies.\n- End with one example, one pitfall, and one next practice step.${history ? `\nRecent class context: ${history}` : ''}`;
  }

  if (lower.includes('example')) {
    return `Example for ${topic}:\n- Concept: explain the idea in simple words.\n- Use case: show where it appears in a real project.\n- Walkthrough: teacher demonstrates one small example, then learner repeats it.\n- Checkpoint: ask the learner to explain why the example works.`;
  }

  if (lower.includes('next') || lower.includes('plan')) {
    return `Suggested lesson flow for ${topic}:\n1. Start with the basic concept.\n2. Show one practical example.\n3. Let the learner try it.\n4. Review mistakes together.\n5. End with one small homework task.`;
  }

  return `Here’s a helpful response for this ${topic} session:\n- Keep the explanation simple and tied to one concept at a time.\n- Relate it back to ${learnerContext} so it feels familiar.\n- After the teacher explains, ask the learner to repeat the idea in their own words.\n- Use one short example before moving to the next topic.${history ? `\nRecent class context: ${history}` : ''}`;
}
