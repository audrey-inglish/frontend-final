import { createContext } from 'react';

export type ConceptGenerationStatus = 'idle' | 'generating' | 'ready' | 'stale';

export interface ConceptGenerationContextValue {
  status: ConceptGenerationStatus;
  isGenerating: boolean;
  isReady: boolean;
  regenerateConcepts: () => Promise<void>;
  concepts: Array<{
    id?: number;
    concept_title: string;
    concept_summary: string;
    examples?: string[] | null;
  }> | undefined;
}

export const ConceptGenerationContext = createContext<ConceptGenerationContextValue | null>(null);
