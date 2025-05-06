// Application phase types
export type AppPhase = "start" | "journal" | "journal-view" | "questionnaire" | "garden";

// Journal entry type
export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
}

// Question answer type
export type AnswerOption = "A" | "B" | "C" | "D";

// Question type
export interface Question {
  id: number;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

// Flower data type
export interface FlowerData {
  id: string;
  journalId: string;
  answers: AnswerOption[];
  position: [number, number, number];
  journalDate: string;
  journalTitle: string;
  created: string;
  stemHeight: number;
}

// Storage schemas for database
export interface JournalEntrySchema {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface FlowerSchema {
  id: string;
  journalId: string;
  answers: string; // Answers stored as string of A, B, C, D
  journalDate: string;
  journalTitle: string;
  created: string;
  positionX: number;
  positionY: number;
  positionZ: number;
}

// 3D navigation controls
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
}