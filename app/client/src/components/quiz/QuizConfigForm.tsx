import { useState } from "react";
import { SelectInput, TextInput, ToggleInput } from "../form";
import { showErrorToast } from "../../lib/toasts";
import type { Difficulty } from "../../schemas/quiz";

interface QuizConfigFormProps {
  onGenerate: (
    numQuestions: number,
    questionTypes: Array<'multiple-choice' | 'short-answer'>,
    difficulty: Difficulty
  ) => Promise<void>;
  isGenerating: boolean;
  disabled?: boolean;
}

export function QuizConfigForm({
  onGenerate,
  isGenerating,
  disabled = false,
}: QuizConfigFormProps) {
  const [numQuestions, setNumQuestions] = useState<string>("5");
  const [includeMultipleChoice, setIncludeMultipleChoice] = useState(true);
  const [includeShortAnswer, setIncludeShortAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const difficultyOptions = [
    { value: 'easy', label: 'Easy - Basic Recall & Understanding' },
    { value: 'medium', label: 'Medium - Applied Knowledge & Analysis' },
    { value: 'hard', label: 'Hard - Critical Thinking & Synthesis' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionTypes: Array<'multiple-choice' | 'short-answer'> = [];
    if (includeMultipleChoice) questionTypes.push('multiple-choice');
    if (includeShortAnswer) questionTypes.push('short-answer');

    if (questionTypes.length === 0) {
      showErrorToast("Please select at least one question type");
      return;
    }

    const num = parseInt(numQuestions, 10);
    if (isNaN(num) || num < 1 || num > 20) {
      showErrorToast("Number of questions must be between 1 and 20");
      return;
    }

    await onGenerate(num, questionTypes, difficulty);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary-700 mb-4">
          Quiz Configuration
        </h3>
        <p className="text-primary-600 mb-6">
          Customize your quiz by selecting the number of questions, difficulty level, and question types.
        </p>
      </div>

      <TextInput
        label="Number of Questions"
        type="text"
        value={numQuestions}
        onChange={setNumQuestions}
        placeholder="5"
        required
      />

      <SelectInput
        label="Difficulty Level"
        value={difficulty}
        onChange={(val) => setDifficulty(val as Difficulty)}
        options={difficultyOptions}
        required
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Question Types *
        </label>
        <ToggleInput
          label="Multiple Choice"
          checked={includeMultipleChoice}
          onChange={setIncludeMultipleChoice}
        />
        <ToggleInput
          label="Short Answer"
          checked={includeShortAnswer}
          onChange={setIncludeShortAnswer}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isGenerating || disabled}
        className="btn w-full"
      >
        {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
      </button>

      {disabled && (
        <p className="text-custom-red-500 text-sm text-center">
          Add some notes to your dashboard first
        </p>
      )}
    </form>
  );
}
