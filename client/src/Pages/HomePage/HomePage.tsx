import { useState } from 'react';
import { InDevelopmentModal } from '../../components/Modals/InDevelopmentModal/InDevelopmentModal';
import { HelpModal } from '../../components/Modals/HelpModal/HelpModal';
import { DifficultySelection } from '../../components/Modals/DifficultySelection/DifficultySelection';
import type { HomePageProps } from "../../../../shared/types/props"
import './HomePage.css';

export const HomePage = ({ onStartOffline, onStartOnline, onStartCpu }: HomePageProps) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showDevModal, setShowDevModal] = useState(true);
  const [showDifficulty, setShowDifficulty] = useState(false);
  
  return (
    <div className="home-screen">
      {showDifficulty && (
        <DifficultySelection 
            onSelect={(diff) => onStartCpu(diff)} 
            onBack={() => setShowDifficulty(false)} 
        />
      )}
      
      {showDevModal && <InDevelopmentModal onClose={() => setShowDevModal(false)} />}

      <button className="help-btn" onClick={() => setShowHelp(true)}>?</button>
      
      {showHelp && <HelpModal initialView="main" onClose={() => setShowHelp(false)} />}

      <h1>TopDown Tactix</h1>
      <p className="creator">Created By Noah James</p>

      <button className="preview-btn" onClick={onStartOffline}>
          Offline
      </button>

      <button className="preview-btn" onClick={onStartOnline}>
          Online
      </button>

      <button className="preview-btn" onClick={() => setShowDifficulty(true)}>
          Play CPU
      </button>

      <a href="https://github.com/rhit-jamesnc/TopDown-Tactix" target="_blank" rel="noreferrer">
          GitHub Repository
      </a>
    </div>
  )
};