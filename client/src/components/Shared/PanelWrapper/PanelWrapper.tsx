import type { PanelWrapperProps } from '../../../../../shared/types/props';
import './PanelWrapper.css';


export const PanelWrapper = ({ children }: PanelWrapperProps) => {
  return (
    <div style={{ height: '100%', width: '100%', minHeight: 0 }}>
      {children}
    </div>
  );
};