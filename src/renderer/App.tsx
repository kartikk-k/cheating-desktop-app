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
    <div className="flex flex-col h-screen overflow-y-auto overflow-x-hidden justify-between text-white bg-neutral-800/50">
      <div className="p-3">

        <div className="flex items-center justify-between w-full bg-white/10 p-2 px-3 rounded-xl">
          <button className="px-2 opacity-70 hover:opacity-100 duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
            >
              <title>plus</title>
              <g
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <line x1="10.75" y1="6" x2="1.25" y2="6"></line>
                <line x1="6" y1="10.75" x2="6" y2="1.25"></line>
              </g>
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <button className="opacity-70 hover:opacity-100 duration-200">
              <svg
                className="size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <title>link</title>
                <g
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path d="M8.36909 6.8934C8.06649 7.0539 7.78239 7.2617 7.52799 7.517L7.51799 7.527C6.13699 8.908 6.13699 11.146 7.51799 12.527L9.69299 14.702C11.074 16.083 13.312 16.083 14.693 14.702L14.703 14.692C16.084 13.311 16.084 11.073 14.703 9.692L13.9406 8.9296"></path>{' '}
                  <path d="M9.63289 11.1066C9.93549 10.9461 10.2196 10.7383 10.474 10.483L10.484 10.473C11.865 9.09199 11.865 6.85399 10.484 5.47299L8.30899 3.29799C6.92799 1.91699 4.68999 1.91699 3.30899 3.29799L3.29899 3.30799C1.91799 4.68899 1.91799 6.92699 3.29899 8.30799L4.06139 9.07039"></path>
                </g>
              </svg>
            </button>
            <h1 className="text-sm  opacity-80 font-light">Scira.ai</h1>
          </div>

          <button className="opacity-70 px-2 hover:opacity-100 duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <title>circle-user</title>
              <g
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <circle cx="9" cy="7.75" r="2"></circle>
                <path d="M5.154,15.147c.479-1.673,2.019-2.897,3.846-2.897s3.367,1.224,3.846,2.897"></path>
                <circle cx="9" cy="9" r="7.25"></circle>
              </g>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <p className="text-xl font-light mb-6">What do you want to explore?</p>

        <div className="flex flex-col gap-2 mb-20">
          <div className="flex items-center justify-center gap-2 mb-1 pl-8">
            <p className="shrink-0 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-[13px]">
              Core Search & Information
            </p>
            <p className="shrink-0 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-[13px]">
              Academic & Research
            </p>
            <p className="shrink-0 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-[13px]">
              Entertainment & Media
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pr-10">
            <p className="shrink-0 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-[13px]">
              Financial & Data Analysis
            </p>
            <p className="shrink-0 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-[13px]">
              Location & Travel
            </p>
            <p className="shrink-0 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-[13px]">
              Productivity & Utilities
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center p-4 pb-2">
        <div className="bg-black/30 w-full p-3 rounded-3xl">
          <textarea
            spellCheck={false}
            name=""
            id=""
            className="w-full bg-transparent resize-none outline-none px-2 text-sm"
            placeholder="Ask a question..."
          ></textarea>

          <div className="text-xs mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 opacity-70 hover:opacity-100 duration-200 h-8 px-3 pr-4 bg-white/10 rounded-full">
                <svg
                  className="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <title>globe</title>
                  <g
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    stroke="currentColor"
                  >
                    <ellipse cx="9" cy="9" rx="7.25" ry="3"></ellipse>
                    <ellipse cx="9" cy="9" rx="3" ry="7.25"></ellipse>
                    <circle cx="9" cy="9" r="7.25"></circle>
                  </g>
                </svg>
                Web
                <svg
                  className="size-2.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                >
                  <title>chevron-down</title>
                  <g
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    stroke="currentColor"
                  >
                    <polyline points="1.75 4.25 6 8.5 10.25 4.25"></polyline>
                  </g>
                </svg>
              </button>
              <button className="flex items-center gap-2 opacity-70 hover:opacity-100 duration-200 h-8 px-3 bg-whit e/10 rounded-full"></button>
            </div>

            <button className="bg-white/20 h-7 w-7 rounded-full flex items-center justify-center">
              <svg
                className="size-3"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
              >
                <title>return-key</title>
                <g
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path d="m1.25,6.75h8.5c.5523,0,1-.4477,1-1v-2.5c0-.5523-.4477-1-1-1h-1.75"></path>
                  <polyline points="3.75 4 1 6.75 3.75 9.5"></polyline>
                </g>
              </svg>
            </button>
          </div>
        </div>
        <div>
          <button className="flex opacity-60 hover:opacity-100 duration-200 gap-2 items-center group transition-all">
            <span className="text-xs">Grok 3.0 mini</span>
            <svg
              className="group-hover:w-3 w-0 duration-200"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
            >
              <title>chevron-down</title>
              <g
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <polyline points="1.75 4.25 6 8.5 10.25 4.25"></polyline>
              </g>
            </svg>
          </button>
        </div>
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
