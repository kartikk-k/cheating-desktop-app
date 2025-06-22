import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect, useRef } from 'react';

function Hello() {

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Listen for window focus events from main process
    const unsubscribe = window.electron?.ipcRenderer.on('window-focus', (...args: unknown[]) => {
      const isFocused = args[0] as boolean;
      setIsFocused(isFocused);
    });

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isFocused]);

  return (
    <div className="bg-black text-white flex flex-col justify-center items-center h-screen">
      <h1 className="">Hello World</h1>
      <input type="text" autoFocus ref={inputRef} className='bg-white/30 h-12 w-[400px] rounded-md' />
      <p className="mt-4">Window focused: {isFocused ? 'Yes' : 'No'}</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
