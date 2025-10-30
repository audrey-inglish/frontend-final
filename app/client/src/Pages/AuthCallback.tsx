import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";

export default function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        type AuthWithCallback = {
          signinRedirectCallback?: () => Promise<void>;
        };
        const maybeAuth = auth as unknown as AuthWithCallback;
        await maybeAuth.signinRedirectCallback?.();
      } catch (err) {
        console.error("Signin callback error", err);
      } finally {
        navigate("/");
      }
    })();
  }, [auth, navigate]);

  return <div className="p-4">Completing sign-in...</div>;
}