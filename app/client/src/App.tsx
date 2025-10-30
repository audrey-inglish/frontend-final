import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";
import { setTokenProvider } from "./lib/apiFetch";

function App() {
  const [username, setUsername] = useState<string | null>(null);

  const auth = useAuth();
  {
    console.log(
      "User email:",
      (auth.user?.profile as { email?: string })?.email
    );
  }

  useEffect(() => {
    setTokenProvider(
      () => (auth.user?.access_token as string | undefined) ?? null
    );
  }, [auth.user]);

  return (
    <>
      <div>
        <h1>Welcome to Mindset!</h1>

        <div className="p-2">
          <p>{auth.isAuthenticated ? "" : "Please sign in."}</p>
          {auth.isAuthenticated && (
            <div>
              <p>
                Welcome,{" "}
                {auth.user?.profile?.preferred_username ??
                  auth.user?.profile?.name ??
                  "unknown"}
                !
              </p>
              <button
                onClick={() => auth.removeUser() || auth.signoutRedirect()}
                className="btn mt-8"
              >
                Sign out
              </button>
            </div>
          )}
          {!auth.isAuthenticated && (
            <div>
              <button onClick={() => auth.signinRedirect()} className="btn mt-8">
                Sign in
              </button>
              {auth.error && (
                <p className="text-red-600">Auth error: {String(auth.error)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
