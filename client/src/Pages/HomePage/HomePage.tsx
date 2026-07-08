import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InDevelopmentModal } from '../../components/Modals/InDevelopmentModal/InDevelopmentModal';
import { SideMenu } from '../../components/Modals/SideMenuModal/SideMenuModal'
import { HelpModal } from '../../components/Modals/HelpModal/HelpModal';
import { DifficultySelection } from '../../components/Modals/DifficultySelection/DifficultySelection';
import { AdminPasswordModal } from '../../components/Modals/AdminPasswordModal/AdminPasswordModal';
import { ADMIN_CONFIG } from '../../../../shared/config/adminConfig';
import type { HomePageProps } from "../../../../shared/types/props"
import './HomePage.css';
import { FeedbackModal } from '../../components/Modals/FeedbackModal/FeedbackModal';

export const HomePage = ({ onStartOffline, onStartOnline, onStartCpu }: HomePageProps) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showDevModal, setShowDevModal] = useState(true);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const navigate = useNavigate();

  const handleVerify = (password: string) => {
    if (password === ADMIN_CONFIG.PASSWORDS.OWNER) {
        sessionStorage.setItem('adminType', ADMIN_CONFIG.TYPES.OWNER);
        navigate('/admin');
    } else if (password === ADMIN_CONFIG.PASSWORDS.ADMIN) {
        sessionStorage.setItem('adminType', ADMIN_CONFIG.TYPES.ADMIN);
        navigate('/admin');
    } else {
        setFeedback({ show: true, message: 'Incorrect password. Access denied.' });
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