import { useState } from 'react';
import './AdminPasswordModal.css';

export const AdminPasswordModal = ({ onVerify, onClose }: { onVerify: (password: string) => void, onClose: () => void }) => {
  const [password, setPassword] = useState('');

  const handleEnter = () => {
    onVerify(password);
    setPassword('');
  };

  return (
    <div className="admin-password-modal">
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Enter password" 
      />

      <button onClick={handleEnter}>Enter</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};