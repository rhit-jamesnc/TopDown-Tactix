import type { ReportedBugsModalProps } from '../../../../../shared/types/props';
import './ReportedBugsModal.css';

export const ReportedBugsModal = ({ bugs, isAdmin }: ReportedBugsModalProps) => {
  return (
    <div className="reported-bugs-list">
      {bugs.map(bug => (
        <div key={bug.id} className="bug-item">
          <div className="bug-header">
            <span className="timestamp">{bug.timestamp}</span>
            {isAdmin && <span className="email">{bug.email}</span>}
          </div>
          <p className="bug-description">{bug.bug}</p>
          <span className="status-active">{bug.status}</span>
        </div>
      ))}
    </div>
  );
};