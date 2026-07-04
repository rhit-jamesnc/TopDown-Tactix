import './ReportedBugsModal.css';

interface Bug {
  id: string;
  timestamp: string;
  email: string;
  bug: string;
  status: 'active' | 'in-progress' | 'closed';
}

interface ReportedBugsModalProps {
  bugs: Bug[];
  isAdmin: boolean;
}

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