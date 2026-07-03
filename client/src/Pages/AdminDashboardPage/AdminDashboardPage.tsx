import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminType = sessionStorage.getItem('adminType');
    if (!adminType) {
      navigate('/');
    }
  }, [navigate]);

  const handleClose = () => {
    sessionStorage.removeItem('adminType');
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <header className="header-section">
        <div className="header-left">
          <h2>Admin Dashboard</h2>
          <h3>Owner View</h3>
        </div>
        <div className="header-right">
          <button>Switch View</button>
          <button onClick={handleClose}>Close</button>
        </div>
      </header>

      <section className="panel left-panel">
        <h3 className="panel-title">Active Games</h3>
        <div className="panel-content">
        </div>
      </section>

      <section className="right-panel-container">
        <div className="panel">
          <h3 className="panel-title">Game Statistics</h3>
          <div className="panel-content">
          </div>
        </div>
        <div className="panel">
          <h3 className="panel-title">Reported Bugs</h3>
          <div className="panel-content">
          </div>
        </div>
      </section>
    </div>
  );
};