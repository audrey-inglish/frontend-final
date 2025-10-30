import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";
import apiFetch, { setTokenProvider } from "./lib/apiFetch";

interface User {
  id: number;
  name: string;
  created_at: string;
}

function App() {
  const auth = useAuth();
  {
    console.log(
      "User email:",
      (auth.user?.profile as { email?: string })?.email
    );
  }

  const [message, setMessage] = useState<string>("");
  const [adminMessage, setAdminMessage] = useState<string>("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("Failed to fetch hello:", err);
        setMessage("");
      });
  }, []);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ users?: User[] }>;
      })
      .then((data) => setUsers(data.users ?? []))
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      });
  }, []);

  const onCheckAdmin = () => {
    apiFetch("/api/admin")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // server now returns plain text
        return res.text();
      })
      .then((text) => {
        setAdminMessage(text);
      })
      .catch((err) => {
        console.error("Failed to check admin:", err);
        setAdminMessage("");
      });
  };

  // Provide apiFetch with the access token from react-oidc-context so
  // Authorization: Bearer <token> is set on API requests.
  useEffect(() => {
    setTokenProvider(() => (auth.user?.access_token as string | undefined) ?? null);
  }, [auth.user]);

  return (
    <>
      <div>
        <p>And the final project begins...</p>
        <p>Message from backend: {message}</p>
        <p>
          I can get this user from the API:{" "}
          {users.length > 0 ? users[0].name : "No user found"}
        </p>

        <hr />
        <div className="p-2">
          <p>
            Auth status: {auth.isAuthenticated ? "Signed in" : "Signed out"}
          </p>
          {auth.isAuthenticated && (
            <div>
              <p>
                Username:{" "}
                {auth.user?.profile?.preferred_username ??
                  auth.user?.profile?.name ??
                  "unknown"}
              </p>
              <button
                onClick={() => auth.removeUser() || auth.signoutRedirect()}
                className="btn"
              >
                Sign out
              </button>
              <hr />
              <button onClick={() => onCheckAdmin()} className="btn">Check Admin</button>
              <div>Admin message: {adminMessage}</div>

            </div>
          )}
          {!auth.isAuthenticated && (
            <div>
              <button onClick={() => auth.signinRedirect()} className="btn">
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
