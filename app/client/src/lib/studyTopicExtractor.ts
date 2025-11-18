interface Note {
  id: number;
  title: string;
  content?: string;
}

interface Concept {
  concept_title: string;
  concept_summary: string;
  examples?: string[] | null;
  id?: number;
  dashboard_id?: number;
  mastery_score?: number;
  updated_at?: string;
}

export function extractStudyTopics(
  notes: Note[],
  concepts?: Concept[]
): string[] {
  const topics: string[] = [];

  if (concepts && concepts.length > 0) {
    concepts.forEach((c) => {
      if (c.concept_title && c.concept_title.trim()) {
        topics.push(c.concept_title.trim());
      }
    });
  }

  if (topics.length < 3 && notes && notes.length > 0) {
    notes.forEach((note) => {
      if (note.title && note.title.trim() && !topics.includes(note.title.trim())) {
        topics.push(note.title.trim());
      }
    });
  }

  return Array.from(new Set(topics)).slice(0, 10);
}

export function getStudySessionTitle(dashboardTitle?: string): string {
  if (!dashboardTitle) {
    return 'Study Session';
  }
  return `${dashboardTitle} - Study Session`;
}
