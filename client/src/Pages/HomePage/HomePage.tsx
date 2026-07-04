import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InDevelopmentModal } from '../../components/Modals/InDevelopmentModal/InDevelopmentModal';
import { SideMenu } from '../../components/Modals/SideMenuModal/SideMenuModal'
import { HelpModal } from '../../components/Modals/HelpModal/HelpModal';
import { DifficultySelection } from '../../components/Modals/DifficultySelection/DifficultySelection';
import { AdminPasswordModal } from '../../components/Modals/AdminPasswordModal/AdminPasswordModal'
import { FeedbackModal } from '../../components/Modals/FeedbackModal/FeedbackModal';
import type { HomePageProps } from "../../../../shared/types/props"
import './HomePage.css';

export const HomePage = ({ onStartOffline, onStartOnline, onStartCpu }: HomePageProps) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showDevModal, setShowDevModal] = useState(true);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const navigate = useNavigate();

  const handleVerify = async (password: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || ''; 
      const response = await fetch(`${API_BASE}/api/verify-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.authorized) {
        sessionStorage.setItem('adminType', data.type);
        setShowPasswordModal(false);
        navigate('/admin');
      } else {
        setFeedback({ show: true, message: data.message });
      }
    } catch (error) {
      console.log('Error connecting to server: ' + error);
      setFeedback({ show: true, message: 'Error connecting to server.' });
    }
  };
  
  return (
    <div className="home-screen">
      {showPasswordModal && (
        <AdminPasswordModal 
          onClose={() => setShowPasswordModal(false)} 
          onVerify={handleVerify}
        />
      )}

      {feedback.show && (
        <FeedbackModal 
            message={feedback.message} 
            onClose={() => setFeedback({ show: false, message: '' })} 
        />
      )}

      {showDifficulty && (
        <DifficultySelection 
            onSelect={(diff) => onStartCpu(diff)} 
            onBack={() => setShowDifficulty(false)} 
        />
      )}
      
      {showDevModal && <InDevelopmentModal onClose={() => setShowDevModal(false)} />}

      <button 
        className={`menu-trigger-btn ${showSideMenu ? 'pushed' : ''}`} 
        onClick={() => setShowSideMenu(!showSideMenu)}
      >
        ☰
      </button>

      <SideMenu 
        isOpen={showSideMenu} 
        onOpenAdmin={() => setShowPasswordModal(true)} 
      />

      <button className="help-btn" onClick={() => setShowHelp(true)}>
        ?
      </button>
      
      {showHelp && <HelpModal initialView="main" onClose={() => setShowHelp(false)} />}

      <h1>TopDown Tactix</h1>
      <p className="creator">Created By Noah James</p>

      <button className="preview-btn" onClick={onStartOffline}>Offline</button>
      <button className="preview-btn" onClick={onStartOnline}>Online</button>
      <button className="preview-btn" onClick={() => setShowDifficulty(true)}>Play CPU</button>
    </div>
  )
};