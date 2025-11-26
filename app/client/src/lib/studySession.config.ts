export const STUDY_SESSION_CONFIG = {

  agent: {
    // Prefer an explicit environment variable set at build time. If missing,
    // default to the same-origin server proxy we added at `/api/agent` so the
    // browser doesn't attempt to call an insecure HTTP host directly.
    endpoint: import.meta.env.VITE_AGENT_ENDPOINT || "/api/agent",
    model: import.meta.env.VITE_AGENT_MODEL || "gpt-oss-120b",
    timeout: 60000,
  },

  mastery: {
    masteryThreshold: 80,

    // Difficulty thresholds
    difficultyThresholds: {
      easy: { min: 0, max: 40 }, // 0-40% mastery
      medium: { min: 41, max: 70 }, // 41-70% mastery
      hard: { min: 71, max: 100 }, // 71-100% mastery
    },

    // Mastery adjustment amounts
    adjustments: {
      correctAnswerBonus: 15, // +15% for correct answer
      incorrectAnswerPenalty: 10, // -10% for incorrect answer
    },
  },

  session: {
    minQuestions: 1,
    maxQuestionsPerTopic: 20,

    // Auto-save session state interval (ms)
    autoSaveInterval: 30000,
  },


  ui: {
    showReasoning: import.meta.env.DEV,
    animationsEnabled: true,
  },

  questionTypes: {
    // Question types with preference weights (higher = prioritize more)
    preferences: {
      "multiple-choice": 3,
      "true-false": 2,
      "short-answer": 1,
      "flashcard": 1,
    },
    // "multiple-choice", "true-false",
    enabled: [ "short-answer"] as const,
  },

  /**
   * Feature Flags
   */
  features: {
    // Allow users to reject evaluations
    allowEvaluationRejection: true,
    showHints: true,
    enablePersistence: true,
    enableBackendSync: false,
  },
} as const;

export function getAgentEndpoint(): string {
  return STUDY_SESSION_CONFIG.agent.endpoint;
}

export function getAgentModel(): string {
  return STUDY_SESSION_CONFIG.agent.model;
}

export function isTopicMastered(masteryLevel: number): boolean {
  return masteryLevel >= STUDY_SESSION_CONFIG.mastery.masteryThreshold;
}

export function getDifficultyForMastery(
  masteryLevel: number
): "easy" | "medium" | "hard" {
  const { difficultyThresholds } = STUDY_SESSION_CONFIG.mastery;

  if (masteryLevel <= difficultyThresholds.easy.max) {
    return "easy";
  } else if (masteryLevel <= difficultyThresholds.medium.max) {
    return "medium";
  } else {
    return "hard";
  }
}

export function getQuestionTypeGuidance(): string {
  const { preferences, enabled } = STUDY_SESSION_CONFIG.questionTypes;
  
  const sortedTypes = enabled
    .map(type => ({ type, weight: preferences[type] || 1 }))
    .sort((a, b) => b.weight - a.weight);
  
  const primary = sortedTypes.filter(t => t.weight === sortedTypes[0].weight).map(t => t.type);
  const secondary = sortedTypes.filter(t => t.weight < sortedTypes[0].weight && t.weight > sortedTypes[sortedTypes.length - 1].weight).map(t => t.type);
  const occasional = sortedTypes.filter(t => t.weight === sortedTypes[sortedTypes.length - 1].weight && t.weight < sortedTypes[0].weight).map(t => t.type);
  
  let guidance = `Available question types: ${enabled.join(', ')}.\n`;
  
  if (primary.length > 0) {
    guidance += `Prioritize: ${primary.join(', ')} (use these most frequently).\n`;
  }
  if (secondary.length > 0) {
    guidance += `Use regularly: ${secondary.join(', ')}.\n`;
  }
  if (occasional.length > 0 && occasional.some(t => !primary.includes(t))) {
    guidance += `Use occasionally for variety: ${occasional.join(', ')}.`;
  }
  
  return guidance;
}
