import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedbackModal } from '../../components/Modals/FeedbackModal/FeedbackModal';
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const adminType = localStorage.getItem('adminType');
  const stopGame = "Force Stop Game"

  useEffect(() => {
    if (!adminType) {
      navigate('/');
    }
  }, [adminType, navigate]);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <h3>{adminType} view</h3>
      
      {adminType === 'owner' ? (
        <button>{stopGame}</button>
      ) : (
        <button title="Must Have Owner Permissions" onClick={() => setShowFeedback(true)}>
          {stopGame}
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