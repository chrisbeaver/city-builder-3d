import { ToolType } from './game.types';

export interface ToolBoxProps {
  selectedTool: ToolType
  onToolChange: (tool: ToolType) => void
}
