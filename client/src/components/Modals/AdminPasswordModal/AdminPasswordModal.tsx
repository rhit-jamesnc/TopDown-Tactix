import { useState } from 'react';
import './AdminPasswordModal.css';

export const AdminPasswordModal = ({ onVerify, onClose }: { onVerify: (password: string) => void, onClose: () => void }) => {
  const [password, setPassword] = useState('');

  const handleEnter = () => {
    onVerify(password);
    setPassword('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="admin-password-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Administrator Access</h3>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password" 
            />

            <div className="button-group">
                <button className="enter-btn" onClick={handleEnter}>Enter</button>
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
        </div>
    </div>
  );
};