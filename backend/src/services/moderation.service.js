/**
 * Lightweight AI-style moderation:
 *  - keyword overlap with skill name + skill keywords (TF-style scoring)
 *  - off-topic blacklist for clearly irrelevant chatter
 *  - profanity / harassment hard-flag
 *
 * In production this hook would call an NLP API (e.g. classification
 * model). The interface is intentionally swappable: same input/output
 * shape so the socket layer doesn't need to change.
 */

const OFF_TOPIC_HINTS = [
  'movie',
  'movies',
  'netflix',
  'crush',
  'dating',
  'gossip',
  'instagram',
  'snapchat',
  'tiktok',
  'cricket score',
  'football match',
  'weather',
];

const HARD_FLAGS = [
  // Stand-ins for a profanity / harassment list. Keep tame but obvious.
  'idiot',
  'stupid',
  'shut up',
  'hate you',
];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
  'i', 'you', 'we', 'they', 'he', 'she', 'it', 'to', 'of', 'in',
  'on', 'at', 'for', 'with', 'this', 'that', 'be', 'have', 'has',
  'do', 'does', 'did', 'will', 'can', 'could', 'should', 'would',
  'my', 'your', 'our', 'so', 'just', 'how', 'what', 'why', 'when',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w));
}

function buildSkillVocab(skill) {
  if (!skill) return new Set();
  const parts = [skill.name, skill.slug, skill.category, ...(skill.keywords || [])]
    .filter(Boolean)
    .join(' ');
  return new Set(tokenize(parts));
}

/**
 * @returns {{ onTopic: boolean, score: number, reason: string }}
 *   score in [0, 1]; <0.35 is treated as off-topic by callers.
 */
export function moderateMessage(text, { skillA, skillB } = {}) {
  if (!text || !text.trim()) {
    return { onTopic: true, score: 1, reason: '' };
  }
  const lower = text.toLowerCase();

  for (const term of HARD_FLAGS) {
    if (lower.includes(term)) {
      return { onTopic: false, score: 0, reason: `flagged term: "${term}"` };
    }
  }

  const tokens = tokenize(text);
  if (tokens.length < 2) {
    // Greetings / very short messages — treat as on-topic.
    return { onTopic: true, score: 0.9, reason: '' };
  }

  const vocab = new Set([...buildSkillVocab(skillA), ...buildSkillVocab(skillB)]);
  let overlap = 0;
  for (const t of tokens) if (vocab.has(t)) overlap += 1;

  const offTopicHits = OFF_TOPIC_HINTS.filter((h) => lower.includes(h)).length;

  // Coverage of the message vs skill vocab.
  const overlapRatio = overlap / tokens.length;
  let score = 0.5 + overlapRatio * 0.7 - offTopicHits * 0.4;
  score = Math.max(0, Math.min(1, score));

  const onTopic = score >= 0.35 && offTopicHits === 0;
  let reason = '';
  if (!onTopic) {
    reason = offTopicHits > 0 ? 'off-topic phrasing detected' : 'low skill-relevance score';
  }
  return { onTopic, score: Number(score.toFixed(3)), reason };
}
