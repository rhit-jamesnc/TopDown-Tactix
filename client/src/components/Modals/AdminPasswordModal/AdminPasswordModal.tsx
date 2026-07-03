import { useState } from 'react';
import './AdminPasswordModal.css';

export const AdminPasswordModal = ({ onVerify, onClose }: { onVerify: (password: string) => void, onClose: () => void }) => {
  const [password, setPassword] = useState('');
  return (
    <div className="admin-password-modal">
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
      <button onClick={() => onVerify(password)}>Enter</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};