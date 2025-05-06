import { useState, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import JournalEntry from "./components/Journal/JournalEntry";
import JournalView from "./components/Journal/JournalView";
import QuestionForm from "./components/Questionnaire/QuestionForm";
import Garden from "./components/Garden/Garden";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { AppPhase } from "./types";
import "./index.css";

// Define control keys for navigation in 3D view
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
];

function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>("start");
  const [showCanvas, setShowCanvas] = useState(false);
  const { phase: gamePhase } = useGame();
  
  // Reference to audio for background music
  const { setBackgroundMusic, setHitSound, setSuccessSound, toggleMute } = useAudio();

  // Initialize sound effects
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    setSuccessSound(success);

    setShowCanvas(true);
    
    // Start with sound muted by default
    toggleMute();
    
    return () => {
      bgMusic.pause();
      hit.pause();
      success.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, toggleMute]);

  const handleJournalComplete = () => {
    setAppPhase("questionnaire");
  };

  const handleQuestionnaireComplete = () => {
    setAppPhase("garden");
  };

  const handleStartNew = () => {
    setAppPhase("journal");
  };

  const handleViewGarden = () => {
    setAppPhase("garden");
  };

  const renderContent = () => {
    switch (appPhase) {
      case "start":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-indigo-900 to-purple-800 text-white p-6">
            <h1 className="text-5xl font-bold mb-3 text-center text-yellow-300 drop-shadow-lg">The Lion's Den</h1>
            <h2 className="text-2xl mb-8 text-center italic text-yellow-100">Mental Health Interactive Environment</h2>
            <p className="text-lg mb-8 max-w-md text-center bg-black/30 p-4 rounded-lg">
              Welcome to your personal 3D flower garden. Write journal entries and answer questions to grow unique flowers that represent your thoughts and feelings.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleStartNew} 
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Create New Flower
              </button>
              <button 
                onClick={handleViewGarden} 
                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium hover:bg-secondary/90 transition-colors"
              >
                View Garden
              </button>
            </div>
          </div>
        );
      case "journal":
        return <JournalEntry onComplete={handleJournalComplete} />;
      case "journal-view":
        return <JournalView onBack={() => setAppPhase("start")} />;
      case "questionnaire":
        return <QuestionForm onComplete={handleQuestionnaireComplete} />;
      case "garden":
        return (
          <KeyboardControls map={controls}>
            <Garden onBack={() => setAppPhase("start")} />
          </KeyboardControls>
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {showCanvas && renderContent()}
    </div>
  );
}

export default App;
