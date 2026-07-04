import './ReportedBugsModal.css';

interface ReportedBugsModalProps {
  onClose: () => void;
}

export const ReportedBugsModal = ({ onClose }: ReportedBugsModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Reported Bugs</h2>
        {/* We will add the list/table here in the next step */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};