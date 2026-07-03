import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedbackModal } from '../../components/Modals/FeedbackModal/FeedbackModal';
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const adminType = localStorage.getItem('adminType'); 

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <h3>{adminType} view</h3>
      
      {adminType === 'owner' ? (
        <button>Force Stop Game</button>
      ) : (
        <button title="Must Have Owner Permissions" onClick={() => setShowFeedback(true)}>
          Force Stop Game
        </button>
      )}

      {showFeedback && (
          <FeedbackModal 
              message="Error: You must have owner permissions to perform this action." 
              onClose={() => setShowFeedback(false)} 
          />
      )}

      <button onClick={() => {
          localStorage.removeItem('adminType');
          navigate('/');
        }}>
        Close
      </button>
    </div>
  );
};