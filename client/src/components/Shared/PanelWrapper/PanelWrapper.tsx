import React from 'react';
import './PanelWrapper.css';

interface PanelWrapperProps {
  children: React.ReactNode;
}

export const PanelWrapper = ({ children }: PanelWrapperProps) => {
  return (
    <div className="panel-container">
      {children}
    </div>
  );
};