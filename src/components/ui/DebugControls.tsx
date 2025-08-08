'use client';

import React, { useState } from 'react';
import SegmentedControl from './SegmentedControl';
import { Button } from './Button';

export type BumpConfig = {
  strength: number;
  edgeSoftness: number;
  scale: number;
};

interface ControlSliderProps {
  label: string;
  name: keyof BumpConfig;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (name: keyof BumpConfig, value: number) => void;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, name, value, min, max, step, onChange }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <label htmlFor={name} className="text-sm">{label}</label>
      <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      id={name}
      name={name}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(name, parseFloat(e.target.value))}
      className="w-full"
    />
  </div>
);

interface DebugControlsProps {
  activeTab: 'Cursor' | 'Warp Tile' | 'Dialog';
  onActiveTabChange: (tab: 'Cursor' | 'Warp Tile' | 'Dialog') => void;
  cursorValues: BumpConfig;
  warpTileValues: BumpConfig;
  dialogValues: BumpConfig;
  onCursorChange: (newValues: BumpConfig) => void;
  onWarpTileChange: (newValues: BumpConfig) => void;
  onDialogChange: (newValues: BumpConfig) => void;
  onWarpTileSave: () => void;
  onDialogSave: () => void;
  onWarpTilePresetSelect: (preset: 'A' | 'B') => void;
  onDialogPresetSelect: (preset: 'A' | 'B') => void;
}

const DebugControls = ({
  activeTab,
  onActiveTabChange,
  cursorValues,
  warpTileValues,
  dialogValues,
  onCursorChange,
  onWarpTileChange,
  onDialogChange,
  onWarpTileSave,
  onDialogSave,
  onWarpTilePresetSelect,
  onDialogPresetSelect,
}: DebugControlsProps) => {
  const [warpTilePreset, setWarpTilePreset] = useState<'A' | 'B' | 'Custom'>('A');
  const [dialogPreset, setDialogPreset] = useState<'A' | 'B' | 'Custom'>('A');

  const handleValueChange = (
    name: keyof BumpConfig,
    value: number,
    type: 'cursor' | 'warpTile' | 'dialog'
  ) => {
    if (type === 'cursor') {
      onCursorChange({ ...cursorValues, [name]: value });
    } else if (type === 'warpTile') {
      setWarpTilePreset('Custom');
      onWarpTileChange({ ...warpTileValues, [name]: value });
    } else {
      setDialogPreset('Custom');
      onDialogChange({ ...dialogValues, [name]: value });
    }
  };

  const handleWarpTilePreset = (preset: 'A' | 'B') => {
    setWarpTilePreset(preset);
    onWarpTilePresetSelect(preset);
  }

  const handleDialogPreset = (preset: 'A' | 'B') => {
    setDialogPreset(preset);
    onDialogPresetSelect(preset);
  }

  const renderControls = (
    type: 'cursor' | 'warpTile' | 'dialog',
    values: BumpConfig
  ) => (
    <>
      <ControlSlider label="Strength" name="strength" value={values.strength} min={-3} max={0} step={0.1} onChange={(name, value) => handleValueChange(name, value, type)} />
      <ControlSlider label="Softness" name="edgeSoftness" value={values.edgeSoftness} min={0.1} max={2} step={0.1} onChange={(name, value) => handleValueChange(name, value, type)} />
      <ControlSlider label="Scale" name="scale" value={values.scale} min={0.5} max={2} step={0.1} onChange={(name, value) => handleValueChange(name, value, type)} />
    </>
  );

  return (
    <div className="fixed top-4 left-4 z-[60] bg-black/50 text-white p-4 rounded-lg flex flex-col gap-4 w-[300px] font-sans backdrop-blur-md">
      <h3 className="font-bold text-lg font-title">Bump Controls</h3>
      <SegmentedControl options={['Cursor', 'Warp Tile', 'Dialog']} value={activeTab} onSelect={onActiveTabChange} />

      <div className="flex flex-col gap-4 mt-2">
        {activeTab === 'Cursor' && renderControls('cursor', cursorValues)}
        
        {activeTab === 'Warp Tile' && (
          <>
            <SegmentedControl options={['A', 'B', 'Custom']} value={warpTilePreset} onSelect={(val) => {
              if (val === 'A' || val === 'B') handleWarpTilePreset(val as 'A' | 'B')
             }} />
            <div className="mt-2 flex flex-col gap-4">
              {renderControls('warpTile', warpTileValues)}
              <Button onClick={onWarpTileSave} className="mt-2">Save Warp Tile Config</Button>
            </div>
          </>
        )}

        {activeTab === 'Dialog' && (
          <>
            <SegmentedControl options={['A', 'B', 'Custom']} value={dialogPreset} onSelect={(val) => {
              if (val === 'A' || val === 'B') handleDialogPreset(val as 'A' | 'B');
            }} />
            <div className="mt-2 flex flex-col gap-4">
              {renderControls('dialog', dialogValues)}
              <Button onClick={onDialogSave} className="mt-2">Save Dialog Config</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DebugControls;
