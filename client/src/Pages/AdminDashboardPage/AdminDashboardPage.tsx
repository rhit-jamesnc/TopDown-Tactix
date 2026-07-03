import './AdminDashboardPage.css'

export const AdminDashboardPage = ({ isAdmin, onClose }: { isAdmin: boolean, onClose: () => void }) => {
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {isAdmin && <button>Force Stop Game</button>}
      {!isAdmin && <button title="Must have owner permissions to access this feature" disabled>Force Stop Game</button>}
      <button onClick={onClose}>Close</button>
    </div>
  );
};