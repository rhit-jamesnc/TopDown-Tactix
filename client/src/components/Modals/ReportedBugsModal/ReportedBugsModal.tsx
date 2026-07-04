import type { ReportedBugsModalProps } from '../../../../../shared/types/props';
import './ReportedBugsModal.css';

export const ReportedBugsModal = ({ bugs, isAdmin }: ReportedBugsModalProps) => {
  return (
    <div className="reported-bugs-list">
      {bugs.map(bug => (
        <div key={bug.id} className="bug-item">
          <span>{bug.timestamp}</span>
          {isAdmin && <span>{bug.email}</span>}
          <p>{bug.bug}</p>
          <span className={`status-${bug.status}`}>{bug.status}</span>
        </div>
      ))}
    </div>
  );
};