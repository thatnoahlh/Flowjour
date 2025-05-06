import { create } from "zustand";
import { AnswerOption } from "../../types";
import { getLocalStorage, setLocalStorage } from "../utils";

interface QuestionnaireState {
  answers: AnswerOption[];
  currentQuestionIndex: number;
  
  // Actions
  setAnswers: (answers: AnswerOption[]) => void;
  resetQuestionnaire: () => void;
  setCurrentQuestionIndex: (index: number) => void;
}

export const useQuestionnaire = create<QuestionnaireState>((set) => ({
  answers: getLocalStorage("current_answers") || [],
  currentQuestionIndex: 0,
  
  setAnswers: (answers) => {
    set({ answers });
    setLocalStorage("current_answers", answers);
  },
  
  resetQuestionnaire: () => {
    set({ answers: [], currentQuestionIndex: 0 });
    setLocalStorage("current_answers", []);
  },
  
  setCurrentQuestionIndex: (index) => {
    set({ currentQuestionIndex: index });
  }
}));
