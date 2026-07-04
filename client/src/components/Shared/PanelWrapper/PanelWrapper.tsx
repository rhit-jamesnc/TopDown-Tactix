import type { PanelWrapperProps } from '../../../../../shared/types/props';
import './PanelWrapper.css';


export const PanelWrapper = ({ children }: PanelWrapperProps) => {
  return (
    <div className="panel-container">
      {children}
    </div>
  );
};