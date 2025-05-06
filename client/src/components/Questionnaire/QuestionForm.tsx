import React, { useState, useEffect } from "react";
import { FormContainer } from "../ui/container";
import { questions } from "../../data/questions";
import { useQuestionnaire } from "../../lib/stores/useQuestionnaire";
import { useJournal } from "../../lib/stores/useJournal";
import { useFlower } from "../../lib/stores/useFlower";
import { useAnswerStore } from "../../lib/stores/useAnswerStore";
import { AnswerOption } from "../../types";
import { useAudio } from "../../lib/stores/useAudio";
import { v4 as uuidv4 } from 'uuid';

interface QuestionFormProps {
  onComplete: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerOption[]>([]);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { setAnswers: storeAnswers } = useQuestionnaire();
  const { currentEntry } = useJournal();
  const { addFlower } = useFlower();
  const { playHit, playSuccess } = useAudio();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Handle answer selection
  const handleAnswer = (answer: AnswerOption) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    playHit();
    
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, process results
      setIsSubmitting(true);
      storeAnswers(newAnswers);
      
      // Create flower data with random position in garden
      const randomPosition: [number, number, number] = [
        Math.floor(Math.random() * 10) - 5,
        0,
        Math.floor(Math.random() * 10) - 5
      ];
      
      if (currentEntry) {
        const flowerData = {
          id: uuidv4(),
          journalId: currentEntry.id,
          answers: newAnswers,
          journalDate: currentEntry.date,
          journalTitle: currentEntry.title,
          created: new Date().toISOString(),
          position: randomPosition,
          stemHeight: 0.5 + Math.random() * 1.2 // Random height between 0.5 and 1.7
        };
        
        addFlower(flowerData);
        playSuccess();
        
        // Slight delay for better UX
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setError("No journal entry found. Please create a journal entry first.");
        setIsSubmitting(false);
      }
    }
  };

  // We no longer need the specific styles for options since we're using a common style

  if (!currentQuestion) {
    return (
      <FormContainer>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Loading questions...</h1>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <div className="w-full h-full overflow-auto text-white p-6">
        <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-white/10">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 text-red-200 p-3 rounded-md border border-red-400">
                {error}
              </div>
            )}
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-yellow-300 mb-1">Self-Reflection</h1>
              <p className="text-yellow-100 mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="py-4">
              <h2 className="text-xl font-medium mb-6 text-white">{currentQuestion.text}</h2>
              
              <div className="space-y-4">
                {(["A", "B", "C", "D"] as AnswerOption[]).map((option) => (
                  <button
                    key={option}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left border border-white/20"
                    onClick={() => !isSubmitting && handleAnswer(option)}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-start">
                      <span className="font-bold mr-3 text-yellow-300">{option}.</span>
                      <span>{currentQuestion.options[option]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center text-sm text-yellow-100/80">
              <p>
                Your answers will influence the appearance of your flower.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default QuestionForm;
