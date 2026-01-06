// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RefObject } from 'react';

import { Tooltip, useTheme } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import React, { useCallback, useEffect, useState } from 'react';

interface CustomTooltipProps {
  content: React.ReactNode;
  placement?: 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';
  targetRef: RefObject<HTMLElement | null> | null;
  positionAdjustment?: {
    top?: number;
    left?: number;
  };
}

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

const CustomTooltip = ({ content, placement = 'bottom', positionAdjustment, targetRef }: CustomTooltipProps) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const showTooltip = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setIsVisible(false);
  }, []);

  const updatePosition = useCallback(() => {
    const target = targetRef?.current;

    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();

    setPosition({
      height: rect.height,
      left: rect.left + window.scrollX + (positionAdjustment?.left ?? 0),
      top: rect.top + window.scrollY + (positionAdjustment?.top ?? 0),
      width: rect.width
    });
  }, [positionAdjustment?.left, positionAdjustment?.top, targetRef]);

  useEffect(() => {
    const target = targetRef?.current;

    if (!target) {
      return;
    }

    updatePosition();

    const observer = new IntersectionObserver(updatePosition, { threshold: 0.1 });

    observer.observe(target);

    window.addEventListener('scroll', updatePosition, true);
    // window.addEventListener('resize', updatePosition);
    target.addEventListener('mouseenter', showTooltip);
    target.addEventListener('mouseleave', hideTooltip);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updatePosition, true);
      // window.removeEventListener('resize', updatePosition);

      target?.removeEventListener('mouseenter', showTooltip);
      target?.removeEventListener('mouseleave', hideTooltip);
    };
  }, [hideTooltip, showTooltip, targetRef, updatePosition]);

  return (
    <Tooltip
      arrow
      componentsProps={{
        popper: { sx: { m: '5px' } },
        tooltip: {
          style: { margin: '5px', marginTop: '12px' },
          sx: {
            '& .MuiTooltip-arrow': {
              color: '#674394',
              height: '9px'
            },
            backgroundColor: '#674394',
            borderRadius: '8px',
            color: '#fff',
            ...theme.typography['B-4'],
            p: '8px'
          }
        }
      }}
      open={isVisible}
      placement={placement}
      slots={{
        transition: Zoom
      }}
      title={content}
    >
      <div
        style={{
          height: position?.height,
          left: position?.left,
          pointerEvents: 'none',
          position: 'absolute',
          top: position?.top,
          width: position?.width
        }}
      />
    </Tooltip>
  );
};

export default CustomTooltip;
