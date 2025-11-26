import { useContext } from 'react';
import { ConceptGenerationContext } from './ConceptGenerationContext';

export function useConceptGeneration() {
  const context = useContext(ConceptGenerationContext);
  
  if (!context) {
    throw new Error('useConceptGeneration must be used within ConceptGenerationProvider');
  }
  
  return context;
}
