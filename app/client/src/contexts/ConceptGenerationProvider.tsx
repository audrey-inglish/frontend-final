import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useGetConcepts, useGenerateConcepts } from '../hooks';
import type { Note } from '../schemas/note';
import { 
  ConceptGenerationContext,
  type ConceptGenerationContextValue,
  type ConceptGenerationStatus 
} from './ConceptGenerationContext';

interface ConceptGenerationProviderProps {
  dashboardId: number;
  notes: Note[] | undefined;
  children: ReactNode;
}

export function ConceptGenerationProvider({ 
  dashboardId, 
  notes,
  children 
}: ConceptGenerationProviderProps) {
  const { data: conceptsData } = useGetConcepts(dashboardId);
  const generateConcepts = useGenerateConcepts();
  
  // Track the last notes state to detect changes
  const lastNotesHash = useRef<string>('');
  const isInitialMount = useRef(true);
  const hasTriggeredGeneration = useRef(false);

  const createNotesHash = (notesList: Note[] | undefined): string => {
    if (!notesList || notesList.length === 0) return '';
    return notesList
      .map(note => `${note.id}-${note.title}-${note.content}-${note.uploaded_at}`)
      .sort()
      .join('|');
  };

  const getStatus = (): ConceptGenerationStatus => {
    if (generateConcepts.isPending) return 'generating';
    if (!notes || notes.length === 0) return 'idle';
    
    const currentHash = createNotesHash(notes);

    if (conceptsData?.concepts && conceptsData.concepts.length > 0) {
      if (lastNotesHash.current === '') {
        lastNotesHash.current = currentHash;
        return 'ready';
      }
            if (currentHash === lastNotesHash.current) {
        return 'ready';
      }
      return 'stale';
    }
    
    return 'idle';
  };

  const status = getStatus();
  const isReady = status === 'ready' && !generateConcepts.isPending;

  const regenerateConcepts = async () => {
    if (!notes || notes.length === 0) return;

    hasTriggeredGeneration.current = true;
    const combinedText = notes
      .map((note) => `${note.title}\n\n${note.content}`)
      .join("\n\n---\n\n");

    await generateConcepts.mutateAsync({
      text: combinedText,
      dashboard_id: dashboardId,
    });

    lastNotesHash.current = createNotesHash(notes);
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastNotesHash.current = createNotesHash(notes);
      return;
    }

    if (!notes || notes.length === 0 || generateConcepts.isPending) {
      return;
    }

    const currentHash = createNotesHash(notes);
    const notesChanged = currentHash !== lastNotesHash.current;

    if (notesChanged && currentHash !== '') {
      regenerateConcepts().catch(error => {
        console.error('Background concept generation failed:', error);
      });
    }
  }, [notes, dashboardId]); // eslint-disable-line react-hooks/exhaustive-deps

  const value: ConceptGenerationContextValue = {
    status,
    isGenerating: generateConcepts.isPending,
    isReady,
    regenerateConcepts,
    concepts: conceptsData?.concepts,
  };

  return (
    <ConceptGenerationContext.Provider value={value}>
      {children}
    </ConceptGenerationContext.Provider>
  );
}
