import { ToolBoxProps } from '@/types/component.types';
import './ToolBox.css';

const ToolBox = ({ selectedTool, onToolChange }: ToolBoxProps) => {
  return (
    <div className="toolbox">
      <button 
        className={selectedTool === 'building' ? 'active' : ''}
        onClick={() => onToolChange('building')}
      >
        Building (2x2)
      </button>
      <button 
        className={selectedTool === 'road' ? 'active' : ''}
        onClick={() => onToolChange('road')}
      >
        Road (1x1)
      </button>
    </div>
  );
};

export default ToolBox;
