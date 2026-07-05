import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPasswordModal } from '../../components/Modals/AdminPasswordModal/AdminPasswordModal';
import { FeedbackModal } from '../../components/Modals/FeedbackModal/FeedbackModal';
import { logoutAdmin } from '../../../../shared/utils/auth';
import { ADMIN_CONFIG } from '../../../../shared/config/adminConfig';
import { LoadingSymbol } from '../../../../shared/LoadingSymbol/LoadingSymbol'
import { PanelWrapper } from '../../components/Shared/PanelWrapper/PanelWrapper';
import { ErrorBoundary } from '../../components/Modals/ErrorBoundary/ErrorBoundary';
import { ReportedBugsModal } from '../../components/Modals/ReportedBugsModal/ReportedBugsModal';
import { fetchReportedBugs } from '../../../../shared/utils/googleSheets'
import { ActiveGamesModal } from '../../components/Modals/ActiveGamesModal/ActiveGamesModal';

import  '../../../../shared/LoadingSymbol/LoadingSymbol.css'
import '../../components/Modals/ErrorBoundary/ErrorBoundary.css'
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bugs, setBugs] = useState([]);
  const [feedback, setFeedback] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const adminType = sessionStorage.getItem('adminType')
  const navigate = useNavigate();

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

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReportedBugs();
      setBugs(data);
    } catch (e) {
      console.error("Failed to refresh bugs", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!adminType) {
      navigate('/');
    }
  }, [adminType, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getBugs = async () => {
      try {
        const data = await fetchReportedBugs();
        setBugs(data);
      } catch (e) {
        console.error("Failed to fetch bugs", e);
      }
    };

    getBugs();
    const interval = setInterval(getBugs, 30000);
    return () => clearInterval(interval);
  }, []);

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
              {isLoading ? <LoadingSymbol /> : <ActiveGamesModal />}
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
          <div className="panel-header-wrapper">
            <h3 className="panel-title">Reported Bugs</h3>
            <button onClick={handleRefresh}>Refresh</button>
          </div>
          <div className="panel-content">
            <ErrorBoundary fallbackMessage="Failed to load Reported Bugs.">
              <PanelWrapper>
                {isLoading ? (
                  <LoadingSymbol />
                ) : (
                  <ReportedBugsModal 
                    bugs={bugs}
                    isAdmin={adminType === 'owner'}
                  />
                )}
              </PanelWrapper>
            </ErrorBoundary>
          </div>
        </div>
      </section>
    </div>
  );
};