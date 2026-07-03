import { useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const adminType = localStorage.getItem('adminType'); 

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      {adminType === 'owner' ? (
        <button>Force Stop Game</button>
      ) : (
        <button title="Must have owner permissions" disabled>
          Force Stop Game
        </button>
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