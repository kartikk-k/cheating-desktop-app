import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect, useRef } from 'react';

function Hello() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Listen for window focus events from main process
    const unsubscribe = window.electron?.ipcRenderer.on(
      'window-focus',
      (...args: unknown[]) => {
        const isFocused = args[0] as boolean;
        setIsFocused(isFocused);
      },
    );

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
    <div className="flex flex-col h-screen text-white gap-20">
      <div className="flex flex-col justify-center items-center p-4 h-screen bg-neutral-900 rounded-lg gap-6">
        <h1 className="">Hello World</h1>
        <input
          type="text"
          autoFocus
          ref={inputRef}
          className="w-full h-12 text-white bg-transparent rounded-md border-2 border-white"
        />
        <p className="mt-4">Window focused: {isFocused ? 'Yes' : 'No'}</p>
      </div>

      <div className='p-4 bg-neutral-900 text-white rounded-lg'> 
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid qui esse tenetur!
      </div>
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
