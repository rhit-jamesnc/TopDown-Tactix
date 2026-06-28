import './InDevelopmentModal.css';

export const InDevelopmentModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="dev-modal-overlay" onClick={onClose}>
      <div className="dev-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Notice</h2>
        <p>This project is currently <b>In Development</b>.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};