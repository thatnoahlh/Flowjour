import React, { useState, useEffect } from "react";
import { useJournal } from "../../lib/stores/useJournal";
import { FormContainer } from "../ui/container";
import { JournalEntry } from "../../types";

interface JournalViewProps {
  onBack: () => void;
}

const JournalView: React.FC<JournalViewProps> = ({ onBack }) => {
  const { entries } = useJournal();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    entries.length > 0 ? entries[0].id : null
  );

  useEffect(() => {
    // Ensure mouse cursor is visible when journal view is open
    document.body.style.cursor = 'auto';
    
    // Exit pointer lock if it's active
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId);

  if (entries.length === 0) {
    return (
      <FormContainer>
        <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-8 text-white">
          
          <div className="text-center py-8 relative">
            <div className="w-20 h-20 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-yellow-300 w-full h-full">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8C12 8 8 10 8 12C8 14 10 16 12 16" fill="currentColor" />
                <path d="M12 8C12 8 16 10 16 12C16 14 14 16 12 16" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-yellow-300">Your Garden Journal</h1>
            <p className="text-yellow-100 mb-6">Your journal is empty. Write your first entry to grow a flower!</p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 px-5 py-2 rounded-lg font-medium shadow hover:shadow-lg transform hover:scale-105 transition-all flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Return to Garden
            </button>
          </div>
        </div>
      </FormContainer>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <FormContainer className="max-w-5xl">
      <div className="relative bg-black/20 backdrop-blur-sm text-white rounded-xl shadow-lg p-6 border border-white/10">
        
        <div className="text-center mb-6 relative">
          <h1 className="text-3xl font-bold tracking-tight text-yellow-300">Your Garden Journal</h1>
          <p className="text-yellow-100 mt-1 italic">
            A collection of your thoughts and growth
          </p>
          <div className="mt-2 flex justify-center">
            <div className="w-24 h-1 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-4">
            <h2 className="font-semibold text-lg text-yellow-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Journal Entries
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
              {entries.map((entry: JournalEntry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedEntryId === entry.id
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 shadow-md"
                      : "bg-black/30 hover:bg-white/10 text-white border border-white/20 hover:border-white/30"
                  }`}
                >
                  <div className="font-medium truncate">{entry.title}</div>
                  <div className={`text-sm ${selectedEntryId === entry.id ? "text-indigo-900" : "text-yellow-100"}`}>
                    {formatDate(entry.date)}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={onBack}
              className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-900 px-4 py-2 rounded-lg font-medium shadow hover:shadow-md transform hover:scale-[1.02] transition-all flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Return to Garden
            </button>
          </div>

          <div className="md:w-2/3 bg-black/30 p-6 rounded-lg border border-white/20 shadow-md">
            {selectedEntry ? (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-yellow-300">{selectedEntry.title}</h1>
                  <p className="text-sm text-yellow-100 mt-1 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {formatDate(selectedEntry.date)}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="whitespace-pre-wrap text-white leading-relaxed">{selectedEntry.content}</p>
                </div>
                
                {/* Decorative starry element */}
                <div className="absolute bottom-4 right-4 opacity-20 w-40 h-40 pointer-events-none">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="5" fill="#ffffff" />
                    <circle cx="30" cy="40" r="2" fill="#ffffff" />
                    <circle cx="70" cy="30" r="3" fill="#ffffff" />
                    <circle cx="80" cy="60" r="2" fill="#ffffff" />
                    <circle cx="20" cy="70" r="4" fill="#ffffff" />
                    <circle cx="60" cy="80" r="2" fill="#ffffff" />
                    <circle cx="40" cy="20" r="3" fill="#ffffff" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-yellow-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-70">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p className="text-lg">Select an entry to view its contents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default JournalView;
