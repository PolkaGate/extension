// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { RefObject } from 'react';

import { Tooltip } from '@mui/material';
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
  targetRef: RefObject<HTMLElement>;
}

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OFFSET = 4;

const CustomTooltip = ({ content, placement = 'bottom', targetRef }: CustomTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const showTooltip = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setIsVisible(false);
  }, []);

  const updatePosition = useCallback(() => {
    const target = targetRef.current;

    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();

    setPosition({
      height: rect.height + OFFSET,
      left: rect.left + window.scrollX + OFFSET,
      top: rect.top + window.scrollY + OFFSET,
      width: rect.width + OFFSET
    });
  }, [targetRef]);

  useEffect(() => {
    const target = targetRef.current;

    if (!target) {
      return;
    }

    updatePosition();

    target.addEventListener('mouseenter', showTooltip);
    target.addEventListener('mouseleave', hideTooltip);

    return () => {
      target?.removeEventListener('mouseenter', showTooltip);
      target?.removeEventListener('mouseleave', hideTooltip);
    };
  }, [hideTooltip, showTooltip, targetRef, updatePosition]);

  return (
    <>
      <Tooltip
        arrow
        componentsProps={{
          popper: { sx: { m: '5px' } },
          tooltip: {
            style: { margin: '5px' },
            sx: {
              '& .MuiTooltip-arrow': {
                color: '#674394',
                height: '9px'
              },
              backgroundColor: '#674394',
              borderRadius: '8px',
              color: '#fff',
              fontFamily: 'Inter',
              fontSize: '12px',
              fontWeight: 400,
              p: '8px'
            }
          }
        }}
        open={isVisible}
        placement={placement}
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
    </>
  );
};

export default CustomTooltip;
