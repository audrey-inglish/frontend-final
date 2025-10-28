import { useEffect, useState } from 'react';
import './App.css'

function App() {

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <>
      <div>
        <p>And the final project begins...</p>
        <p>Message from backend: {message}</p>
      </div>
    </>
  )
}

export default App
