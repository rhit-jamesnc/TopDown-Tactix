import { useState } from 'react';
import './AdminPasswordModal.css';

export const AdminPasswordModal = ({ onVerify, onClose }: { onVerify: (password: string) => void, onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onVerify(password);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-password-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Administrator Access</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password" 
            />
            <button 
              type="button" 
              className="toggle-visibility" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
          </div>

        <div className="button-group">
          <button className="enter-btn">Enter</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
        </form>
      </div>
    </div>
  );
};