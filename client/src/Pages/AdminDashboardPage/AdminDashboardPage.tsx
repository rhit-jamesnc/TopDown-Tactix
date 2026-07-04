import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPasswordModal } from '../../components/Modals/AdminPasswordModal/AdminPasswordModal';
import { FeedbackModal } from '../../components/Modals/FeedbackModal/FeedbackModal';
import { logoutAdmin } from '../../../../shared/utils/auth';
import { LoadingSymbol } from '../../../../shared/LoadingSymbol/LoadingSymbol'
import { PanelWrapper } from '../../components/Shared/PanelWrapper/PanelWrapper';
import { ErrorBoundary } from '../../components/Modals/ErrorBoundary/ErrorBoundary';
import  '../../../../shared/LoadingSymbol/LoadingSymbol.css'
import '../../components/Modals/ErrorBoundary/ErrorBoundary.css'
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
      } else {
        setFeedback({ show: true, message: data.message });
      }
    } catch (error) {
      console.log('Error connecting to server: ' + error);
      setFeedback({ show: true, message: 'Error connecting to server.' });
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
          <ErrorBoundary fallbackMessage="Failed to load Active Games.">
            <PanelWrapper>
              {isLoading ? <LoadingSymbol /> : <LoadingSymbol />}
            </PanelWrapper>
          </ErrorBoundary>
        </div>
      </section>

      <section className="right-panel-container">
        <div className="panel">
          <h3 className="panel-title">Game Statistics</h3>
          <div className="panel-content">
            <ErrorBoundary fallbackMessage="Failed to load Statistics.">
              <PanelWrapper>
                {isLoading ? <LoadingSymbol /> : <LoadingSymbol />}
              </PanelWrapper>
            </ErrorBoundary>
          </div>
        </div>
        <div className="panel">
          <h3 className="panel-title">Reported Bugs</h3>
          <div className="panel-content">
            <ErrorBoundary fallbackMessage="Failed to load Reported Bugs.">
              <PanelWrapper>
                {isLoading ? <LoadingSymbol /> : <LoadingSymbol />}
              </PanelWrapper>
            </ErrorBoundary>
          </div>
        </div>
      </section>
    </div>
  );
};