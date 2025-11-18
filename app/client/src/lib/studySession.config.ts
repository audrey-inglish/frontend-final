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
    enabledQuestionTypes: [
      "multiple-choice",
      "true-false",
      "short-answer",
      "flashcard",
    ],
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
