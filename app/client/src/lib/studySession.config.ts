export const STUDY_SESSION_CONFIG = {

  agent: {
    endpoint:
      import.meta.env.VITE_AGENT_ENDPOINT ||
      "http://ai-snow.reindeer-pinecone.ts.net:9292/v1/chat/completions",
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
