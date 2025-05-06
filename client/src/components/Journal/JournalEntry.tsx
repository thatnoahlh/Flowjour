import React, { useState, useEffect } from "react";
import { useJournal } from "../../lib/stores/useJournal";
import { FormContainer } from "../ui/container";
import { v4 as uuidv4 } from 'uuid';
import { useAudio } from "../../lib/stores/useAudio";

interface JournalEntryProps {
  onComplete: () => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ onComplete }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  const { addEntry } = useJournal();
  const { playSuccess } = useAudio();
  
  useEffect(() => {
    // Ensure mouse cursor is visible when journal entry form is open
    document.body.style.cursor = 'auto';
    
    // Exit pointer lock if it's active
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!date || !title || !content) {
      setError("All fields are required");
      return;
    }
    
    // Create new journal entry
    const newEntry = {
      id: uuidv4(),
      date,
      title,
      content,
      createdAt: new Date().toISOString()
    };
    
    // Save entry
    addEntry(newEntry);
    
    // Play success sound
    playSuccess();
    
    // Proceed to next step
    onComplete();
  };

  return (
    <FormContainer>
      <div className="w-full h-full overflow-auto text-white p-6 rounded-xl">
        {/* Main content with transparent background to let page gradient show through */}        
        <div className="relative max-w-3xl mx-auto bg-black/20 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-white/10">
          <div className="space-y-6 relative">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-yellow-300">Your Garden Journal</h1>
              <p className="text-yellow-100 mt-2 italic">
                Share your thoughts to grow your flower's stem
              </p>
              <div className="mt-2 flex justify-center">
                <div className="w-16 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-200 p-4 rounded-lg border border-red-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-yellow-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 bg-indigo-800/50 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-yellow-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="w-full px-4 py-2 bg-indigo-800/50 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-yellow-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Your Thoughts
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your journal entry here... Each entry helps your garden grow!"
                  rows={8}
                  className="w-full px-4 py-3 bg-indigo-800/50 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 rounded-lg px-6 py-3 font-medium shadow-md hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-[1.02] flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Plant Your Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default JournalEntry;
