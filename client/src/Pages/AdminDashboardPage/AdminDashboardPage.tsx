import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPasswordModal } from '../../components/Modals/AdminPasswordModal/AdminPasswordModal';
import { FeedbackModal } from '../../components/Modals/FeedbackModal/FeedbackModal';
import { logoutAdmin } from '../../../../shared/utils/auth';
import { ADMIN_CONFIG } from '../../../../shared/config/adminConfig';
import  { LoadingSymbol } from '../../../../shared/LoadingSymbol/LoadingSymbol'
import  '../../../../shared/LoadingSymbol/LoadingSymbol.css'
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const adminType = sessionStorage.getItem('adminType')
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminType) {
      navigate('/');
    }
  }, [adminType, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = (password: string) => {
    if (password === ADMIN_CONFIG.PASSWORDS.OWNER) {
      sessionStorage.setItem('adminType', ADMIN_CONFIG.TYPES.OWNER);
      setShowPasswordModal(false);
      window.location.reload(); 
    } else if (password === ADMIN_CONFIG.PASSWORDS.ADMIN) {
      sessionStorage.setItem('adminType', ADMIN_CONFIG.TYPES.ADMIN);
      setShowPasswordModal(false);
      window.location.reload();
    } else {
      setFeedback({ show: true, message: 'Incorrect password.' });
    }
  };

  const handleClose = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
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

      <header className="header-section">
        <div className="header-left">
          <h2>Admin Dashboard</h2>
          <h3>{adminType ? adminType.charAt(0).toUpperCase() + adminType.slice(1) : ''} View</h3>
        </div>
        <div className="header-right">
          <button onClick={() => setShowPasswordModal(true)}>Switch View</button>
          <button onClick={handleClose}>Close</button>
        </div>
      </header>

      <section className="panel left-panel">
        <h3 className="panel-title">Active Games</h3>
        <div className="panel-content">
          {isLoading ? <LoadingSymbol /> : <LoadingSymbol />}
        </div>
      </section>

      <section className="right-panel-container">
        <div className="panel">
          <h3 className="panel-title">Game Statistics</h3>
          <div className="panel-content">
            {isLoading ? <LoadingSymbol /> : <LoadingSymbol />}
          </div>
        </div>
        <div className="panel">
          <h3 className="panel-title">Reported Bugs</h3>
          <div className="panel-content">
            {isLoading ? <LoadingSymbol /> : <LoadingSymbol />}
          </div>
        </div>
      </section>
    </div>
  );
};