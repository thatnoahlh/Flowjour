import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnswerOption } from '../../types';

interface AnswerState {
  // Store all answers from questionnaires
  answers: AnswerOption[];
  
  // Recent answers (e.g., from the most recent flower)
  recentAnswers: AnswerOption[];
  
  // Actions
  addAnswer: (answer: AnswerOption) => void;
  addAnswers: (answers: AnswerOption[]) => void;
  clearRecentAnswers: () => void;
  resetAllAnswers: () => void;
}

export const useAnswerStore = create<AnswerState>()(
  persist(
    (set) => ({
      // Initial state
      answers: [],
      recentAnswers: [],
      
      // Add a single answer (e.g., from a questionnaire)
      addAnswer: (answer) => set((state) => ({
        answers: [...state.answers, answer],
        recentAnswers: [...state.recentAnswers, answer]
      })),
      
      // Add multiple answers at once (e.g., from an existing flower)
      addAnswers: (answers) => set((state) => ({
        answers: [...state.answers, ...answers],
        recentAnswers: answers
      })),
      
      // Clear recent answers after creating a flower
      clearRecentAnswers: () => set({ recentAnswers: [] }),
      
      // Reset everything (mainly for testing)
      resetAllAnswers: () => set({ answers: [], recentAnswers: [] }),
    }),
    {
      name: 'garden-answers',
      // Only persist the answers list
      partialize: (state) => ({ 
        answers: state.answers,
      }),
    }
  )
);