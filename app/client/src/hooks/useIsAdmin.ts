import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import apiFetch, { HttpError } from "../lib/apiFetch";

export function useIsAdmin() {
  const auth = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      if (!auth.isAuthenticated) {
        if (mounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const res = await apiFetch("/api/admin");
        const text = await res.text();

        if (!mounted) return;

        setIsAdmin(text.toLowerCase().includes("user is an admin"));
      } catch (err) {
        if (!mounted) return;

        if (err instanceof HttpError && err.status === 403) {
          setIsAdmin(false);
        } else {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void checkAdmin();

    return () => {
      mounted = false;
    };
  }, [auth.isAuthenticated]);

  return { isAdmin, isLoading };
}
