import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  return (
    <div className="admin-dashboard">
      <header className="header-section">
        <div className="header-left">
          <h2>Admin Dashboard</h2>
          <h3>Owner View</h3>
        </div>
        <div className="header-right">
          <button>Switch View</button>
          <button>Close</button>
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