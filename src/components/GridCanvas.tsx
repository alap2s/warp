'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { useAuth } from '@/context/AuthContext';
import { useGridState } from '@/context/GridStateContext';
import InteractiveGrid, { DialogBumpConfig, TileBumpConfig } from './InteractiveGrid';
import GridUIManager from './GridUIManager';

type ViewportInfo = {
  viewport: { width: number; height: number; factor: number; distance: number; },
  size: { width: number, height: number, top: number, left: number }
}

const ViewportReporter = ({ onViewportChange }: { onViewportChange: (viewportInfo: ViewportInfo) => void }) => {
  const { viewport, size } = useThree();
  useEffect(() => {
    onViewportChange({viewport, size});
  }, [viewport, size, onViewportChange]);
  return null;
}

const SETTING_A: DialogBumpConfig = {
  dialogBumpStrength: -1.2,
  dialogEdgeSoftness: 0.6,
  dialogBumpScale: 1.0,
};

const GridCanvas = ({ dialogBumpConfig: propDialogConfig, tileBumpConfig: propTileConfig, onPointerDown, onPointerUp, onPointerMove, showUI = true, forceDialogBump, forceWarpTileBump, clickPoint }: { 
  dialogBumpConfig?: DialogBumpConfig, 
  tileBumpConfig?: TileBumpConfig,
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void, 
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void, 
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void, 
  showUI?: boolean,
  forceDialogBump?: boolean,
  forceWarpTileBump?: boolean,
  clickPoint?: ThreeEvent<PointerEvent> | null 
}) => {
  const { profile } = useAuth();
  const {
    isMakeWarpDialogOpen,
    activeWarp,
    openMakeWarpDialog,
    dialogSize,
    meDialogSize,
    centerTileSize,
  } = useGridState();
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null);
  const [dialogBumpConfig, setDialogBumpConfig] = useState<DialogBumpConfig>(propDialogConfig || SETTING_A);
  const [tileBumpConfig, setTileBumpConfig] = useState<TileBumpConfig>({ strength: -0.8, edgeSoftness: 0.15, scale: 1 });

  useEffect(() => {
    if (propDialogConfig) {
      setDialogBumpConfig(propDialogConfig);
    }
  }, [propDialogConfig]);

  useEffect(() => {
    if (propTileConfig) {
      setTileBumpConfig(propTileConfig);
    }
  }, [propTileConfig]);

  const isAnyDialogOpen = isMakeWarpDialogOpen || !profile;

  const handleGridClick = (e: ThreeEvent<PointerEvent>) => {
    if(isAnyDialogOpen) return;
    openMakeWarpDialog();
    if(onPointerUp) onPointerUp(e);
  };

  const dialogRect = useMemo(() => {
    if ((!dialogSize && !forceDialogBump) || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const dialogWidthPx = dialogSize?.width || 300;
    const dialogHeightPx = dialogSize?.height || 400;
    const dialogCornerRadiusPx = 48;

    const dialogWorldWidth = (dialogWidthPx / size.width) * viewport.width;
    const dialogWorldHeight = (dialogHeightPx / size.height) * viewport.height;
    const cornerRadius = (dialogCornerRadiusPx / size.width) * viewport.width;

    return { width: dialogWorldWidth, height: dialogWorldHeight, cornerRadius };
  }, [dialogSize, viewportInfo, forceDialogBump]);

  const meDialogRect = useMemo(() => {
    if (!meDialogSize || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const dialogWidthPx = meDialogSize.width;
    const dialogHeightPx = meDialogSize.height;
    const dialogCornerRadiusPx = 48;

    const dialogWorldWidth = (dialogWidthPx / size.width) * viewport.width;
    const dialogWorldHeight = (dialogHeightPx / size.height) * viewport.height;
    const cornerRadius = (dialogCornerRadiusPx / size.width) * viewport.width;

    return { width: dialogWorldWidth, height: dialogWorldHeight, cornerRadius };
  }, [meDialogSize, viewportInfo]);

  const centerTileRect = useMemo(() => {
    if (!centerTileSize || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const tileWidthPx = centerTileSize.width;
    const tileHeightPx = centerTileSize.height;
    
    const tileWorldWidth = (tileWidthPx / size.width) * viewport.width;
    const tileWorldHeight = (tileHeightPx / size.height) * viewport.height;
    const cornerRadius = (24 / size.width) * viewport.width;

    return { width: tileWorldWidth, height: tileWorldHeight, cornerRadius };
  }, [centerTileSize, viewportInfo]);

  const scaledDialogRect = useMemo(() => {
    if (!dialogRect) return null;
    return {
      ...dialogRect,
      width: dialogRect.width * dialogBumpConfig.dialogBumpScale,
      height: dialogRect.height * dialogBumpConfig.dialogBumpScale,
    };
  }, [dialogRect, dialogBumpConfig.dialogBumpScale]);

  const warpTileRect = useMemo(() => {
    if ((!activeWarp && !forceWarpTileBump && !clickPoint) || !viewportInfo) return null;

    const { viewport, size } = viewportInfo;
    const tileWidthPx = 84;
    const tileHeightPx = 84;

    const tileWorldWidth = (tileWidthPx / size.width) * viewport.width;
    const tileWorldHeight = (tileHeightPx / size.height) * viewport.height;
    const cornerRadius = (16 / size.width) * viewport.width;

    if (clickPoint) {
      return { 
        width: tileWorldWidth, 
        height: tileWorldHeight, 
        cornerRadius,
        centerX: clickPoint.point.x,
        centerY: -clickPoint.point.z,
      };
    }

    return { width: tileWorldWidth, height: tileWorldHeight, cornerRadius };
  }, [activeWarp, viewportInfo, forceWarpTileBump, clickPoint]);

  return (
    <div className="w-screen h-screen bg-black relative">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 10, 0.1], fov: 50 }}>
          <ViewportReporter onViewportChange={setViewportInfo} />
          <InteractiveGrid
            onPointerDown={onPointerDown}
            onPointerUp={handleGridClick}
            onPointerMove={onPointerMove}
            dialogRect={scaledDialogRect}
            warpTileRect={warpTileRect}
            profileDialogRect={null}
            meDialogRect={meDialogRect}
            centerTileRect={centerTileRect}
            dialogBumpConfig={dialogBumpConfig}
            tileBumpConfig={tileBumpConfig}
          />
        </Canvas>
      </div>
      {showUI && <GridUIManager />}
    </div>
  );
};

export default GridCanvas;