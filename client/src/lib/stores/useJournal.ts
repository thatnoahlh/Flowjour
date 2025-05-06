import { create } from "zustand";
import { JournalEntry } from "../../types";
import { getLocalStorage, setLocalStorage } from "../utils";
import { apiRequest } from "../queryClient";

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEntries: () => Promise<void>;
  addEntry: (entry: JournalEntry) => Promise<void>;
  getEntry: (id: string) => JournalEntry | null;
  clearCurrentEntry: () => void;
}

export const useJournal = create<JournalState>((set, get) => ({
  entries: getLocalStorage("journal_entries") || [],
  currentEntry: null,
  loading: false,
  error: null,
  
  fetchEntries: async () => {
    set({ loading: true, error: null });
    
    try {
      // First try to fetch from server
      const response = await apiRequest("GET", "/api/journal/entries", undefined);
      const data = await response.json();
      
      set({ entries: data, loading: false });
      setLocalStorage("journal_entries", data);
    } catch (error) {
      console.log("Failed to fetch from server, using local storage:", error);
      
      // Fallback to local storage if server fails
      const localEntries = getLocalStorage("journal_entries") || [];
      set({ 
        entries: localEntries, 
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch entries"
      });
    }
  },
  
  addEntry: async (entry: JournalEntry) => {
    set({ loading: true, error: null });
    
    try {
      // Try to save to server first
      await apiRequest("POST", "/api/journal/entries", entry);
      
      // Update local state
      const updatedEntries = [...get().entries, entry];
      set({ entries: updatedEntries, currentEntry: entry, loading: false });
      
      // Backup to local storage
      setLocalStorage("journal_entries", updatedEntries);
    } catch (error) {
      console.log("Failed to save to server, saving locally:", error);
      
      // Fallback to just local storage
      const updatedEntries = [...get().entries, entry];
      set({ 
        entries: updatedEntries, 
        currentEntry: entry,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to save entry"
      });
      
      setLocalStorage("journal_entries", updatedEntries);
    }
  },
  
  getEntry: (id: string) => {
    const entry = get().entries.find(e => e.id === id) || null;
    return entry;
  },
  
  clearCurrentEntry: () => {
    set({ currentEntry: null });
  }
}));
