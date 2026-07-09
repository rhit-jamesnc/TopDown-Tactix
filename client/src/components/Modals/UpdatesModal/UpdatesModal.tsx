import type { UpdatesModalProps } from '../../../../../shared/types/props';
import './UpdatesModal.css';

export const UpdatesModal = ({ onClose }: UpdatesModalProps) => {
  return (
    <div className="updates-modal">
      <div className="updates-content">
        <button className="close-x" onClick={onClose}>&times;</button>
        <h2>Recent Updates</h2>
        <div className="updates-list">
          <ul>
            <li>Added CPU difficulty selection.</li>
            <li>Improved admin authentication flow.</li>
            <li>UI refinements and bug fixes.</li>
          </ul>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};