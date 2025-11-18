export interface TopicMastery {
  topic: string;
  level: number; // 0-100 scale
  questionsAnswered: number;
  questionsCorrect: number;
  lastAsked?: string; // ISO timestamp
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'flashcard';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface StudyQuestion {
  id: string;
  type: QuestionType;
  topic: string;
  difficulty: DifficultyLevel;
  question: string;
  options?: string[]; // For multiple-choice
  correctAnswer?: string; // Not shown to user
  hint?: string;
}


export interface UserAnswer {
  questionId: string;
  answer: string;
  timestamp: string; // ISO timestamp
}


export interface EvaluationResult {
  questionId: string;
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  masteryUpdates: TopicMastery[];
}

/**
 * Overall study session state
 */
export interface StudySessionState {
  sessionId: string;
  active: boolean;
  topics: string[];
  masteryLevels: TopicMastery[];
  currentQuestion?: StudyQuestion;
  questionHistory: StudyQuestion[];
  answerHistory: UserAnswer[];
  evaluationHistory: EvaluationResult[];
  pendingEvaluation?: {
    question: StudyQuestion;
    answer: UserAnswer;
    evaluation: EvaluationResult;
  };
}

export interface AgentToolFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>; // Allow any JSON Schema property definition
    required: string[];
  };
}

export interface AgentTool {
  type: 'function';
  function: AgentToolFunction;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: AgentToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface AgentToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface AgentResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: AgentMessage;
    finish_reason: string;
  }>;
}

export interface GetNextStepArgs {
  questionType: QuestionType;
  topic: string;
  difficulty: DifficultyLevel;
  question: string;
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  reasoning: string; // Why this question was chosen
}

export interface EvaluateResponseArgs {
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  masteryUpdates: Array<{
    topic: string;
    newLevel: number;
    reasoning: string;
  }>;
  recommendation: 'continue' | 'change-difficulty' | 'end-session';
}
