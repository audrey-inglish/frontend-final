import { StudyQuestionDisplay } from "./StudyQuestionDisplay";
import { EvaluationConfirmation } from "./EvaluationConfirmation";
import { HintConfirmation } from "./HintConfirmation";
import { HintSuggestionConfirmation } from "./HintSuggestionConfirmation";
import { SessionEndConfirmation } from "./SessionEndConfirmation";
import { StudySessionLoading } from "./StudySessionLoading";
import type { StudySessionState } from "../../hooks/study/useStudySession";

interface StudySessionMainCardProps {
  sessionState: StudySessionState;
  isLoading: boolean;
  onSubmitAnswer: (answer: string) => void;
  onRequestHint: () => void;
  onConfirmEvaluation: () => void;
  onAcceptHint: () => void;
  onRejectHint: () => void;
  onAcceptHintSuggestion: () => void;
  onRejectHintSuggestion: () => void;
  onAcceptSessionEnd: () => void;
  onRejectSessionEnd: () => void;
}

export function StudySessionMainCard({
  sessionState,
  isLoading,
  onSubmitAnswer,
  onRequestHint,
  onConfirmEvaluation,
  onAcceptHint,
  onRejectHint,
  onAcceptHintSuggestion,
  onRejectHintSuggestion,
  onAcceptSessionEnd,
  onRejectSessionEnd,
}: StudySessionMainCardProps) {
  return (
    <div className="card">
      {sessionState.pendingSessionEnd ? (
        <SessionEndConfirmation
          sessionSummary={sessionState.pendingSessionEnd.sessionSummary}
          reasoning={sessionState.pendingSessionEnd.reasoning}
          onAccept={onAcceptSessionEnd}
          onReject={onRejectSessionEnd}
          isLoading={isLoading}
        />
      ) : sessionState.pendingHintSuggestion ? (
        <HintSuggestionConfirmation
          hint={sessionState.pendingHintSuggestion.hint}
          reasoning={sessionState.pendingHintSuggestion.reasoning}
          onAccept={onAcceptHintSuggestion}
          onReject={onRejectHintSuggestion}
          isLoading={isLoading}
        />
      ) : sessionState.pendingHint ? (
        <HintConfirmation
          hint={sessionState.pendingHint}
          onAccept={onAcceptHint}
          onReject={onRejectHint}
          isLoading={isLoading}
        />
      ) : sessionState.pendingEvaluation ? (
        <EvaluationConfirmation
          question={sessionState.pendingEvaluation.question}
          userAnswer={sessionState.pendingEvaluation.answer}
          evaluation={sessionState.pendingEvaluation.evaluation}
          onConfirm={onConfirmEvaluation}
          isLoading={isLoading}
        />
      ) : sessionState.currentQuestion ? (
        <StudyQuestionDisplay
          question={sessionState.currentQuestion}
          onSubmit={onSubmitAnswer}
          onRequestHint={onRequestHint}
          isLoading={isLoading}
        />
      ) : (
        <StudySessionLoading />
      )}
    </div>
  );
}
