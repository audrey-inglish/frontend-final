import { useEffect, useRef, useState } from "react";

interface UseDraftAutoSaveProps {
  title: string;
  content: string;
  draftKey?: string;
}

export function useDraftAutoSave({
  title,
  content,
  draftKey,
}: UseDraftAutoSaveProps) {
  const [draftSaved, setDraftSaved] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!draftKey) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (title || content) {
        localStorage.setItem(draftKey, JSON.stringify({ title, content }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, draftKey]);

  const clearDraft = () => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  };

  return { draftSaved, clearDraft };
}
