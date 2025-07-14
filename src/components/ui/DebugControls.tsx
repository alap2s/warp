import React from 'react';

interface DebugControlsProps {
  values: {
    dialogBumpStrength: number;
    dialogEdgeSoftness: number;
    dialogBumpScale: number;
  };
  onChange: (newValues: {
    dialogBumpStrength: number;
    dialogEdgeSoftness: number;
    dialogBumpScale: number;
  }) => void;
  onSettingSelect: (setting: 'A' | 'B') => void;
}

const DebugControls = ({ values, onChange, onSettingSelect }: DebugControlsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...values,
      [name]: parseFloat(value),
    });
  };

  return (
    <div className="fixed top-4 left-4 z-[60] bg-black/50 text-white p-4 rounded-lg flex flex-col gap-4 w-[300px] font-sans">
      <h3 className="font-bold text-lg font-title">Bump Controls</h3>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label htmlFor="dialogBumpStrength" className="text-sm">Strength</label>
          <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded">{values.dialogBumpStrength.toFixed(1)}</span>
        </div>
        <input
          type="range"
          id="dialogBumpStrength"
          name="dialogBumpStrength"
          min="-3"
          max="0"
          step="0.1"
          value={values.dialogBumpStrength}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label htmlFor="dialogEdgeSoftness" className="text-sm">Softness</label>
          <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded">{values.dialogEdgeSoftness.toFixed(1)}</span>
        </div>
        <input
          type="range"
          id="dialogEdgeSoftness"
          name="dialogEdgeSoftness"
          min="0.1"
          max="2"
          step="0.1"
          value={values.dialogEdgeSoftness}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label htmlFor="dialogBumpScale" className="text-sm">Scale</label>
          <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded">{values.dialogBumpScale.toFixed(1)}</span>
        </div>
        <input
          type="range"
          id="dialogBumpScale"
          name="dialogBumpScale"
          min="0.5"
          max="2"
          step="0.1"
          value={values.dialogBumpScale}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSettingSelect('A')} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg">
          Setting A
        </button>
        <button onClick={() => onSettingSelect('B')} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg">
          Setting B
        </button>
      </div>
    </div>
  );
};

export default DebugControls; 