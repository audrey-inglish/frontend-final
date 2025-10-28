import { useEffect, useState } from 'react';
import './App.css'

interface User {
  id: number;
  name: string;
  created_at: string;
}

function App() {

  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetch("/api/hello")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error('Failed to fetch hello:', err);
        setMessage('');
      });
  }, []);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ users?: User[] }>;
      })
      .then(data => setUsers(data.users ?? []))
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      });
  }, []);

  return (
    <>
      <div>
        <p>And the final project begins...</p>
        <p>Message from backend: {message}</p>
        <p>I can get this user from the API: {users.length > 0 ? users[0].name : "No user found"}</p>
      </div>
    </>
  )
}

export default App
