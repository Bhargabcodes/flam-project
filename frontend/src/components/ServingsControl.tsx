import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  currentServings: number;
  baseServings: number;
  onUpdate: (newServings: number) => void;
  prepMinutes: number;
  cookMinutes: number;
}

export const ServingsControl: React.FC<Props> = ({
  currentServings,
  baseServings,
  onUpdate,
  prepMinutes,
  cookMinutes
}) => {
  return (
    <div className="servings-control" style={{marginBottom: '24px'}}>
      <div className="meta-badges" style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
        <span className="badge"><Clock size={16} /> Prep: {prepMinutes}m</span>
        <span className="badge"><Clock size={16} /> Cook: {cookMinutes}m</span>
        <span className="badge"><Clock size={16} /> Total: {prepMinutes + cookMinutes}m</span>
      </div>

      <div className="stepper" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <span>Servings:</span>
        <button className="stepper-btn" onClick={() => onUpdate(Math.max(1, currentServings - 1))} disabled={currentServings <= 1}>−</button>
        <span style={{fontWeight: 'bold', fontSize: '18px'}}>{currentServings}</span>
        <button className="stepper-btn" onClick={() => onUpdate(currentServings + 1)} disabled={currentServings >= 24}>+</button>
      </div>
    </div>
  );
};
