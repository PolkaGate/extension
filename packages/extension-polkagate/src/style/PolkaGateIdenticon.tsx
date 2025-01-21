// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React, { useMemo } from 'react';

interface Props {
  address: string;
  size?: number;
}

const PolkaGateIdenticon = ({ address, size = 32 }: Props) => {
  const hashBytes = useMemo(() => {
    const arr = new Uint8Array(32);

    for (let i = 0; i < address.length; i++) {
      arr[i % 32] ^= address.charCodeAt(i);
    }

    return arr;
  }, [address]);

  const params = useMemo(() => {
    const getValue = (start: number, range: number) => {
      const value = hashBytes.slice(start, start + 2).reduce((a, b) => a + b, 0);

      return value % range;
    };

    return {
      curvature: 0.3 + (getValue(8, 40) / 100),
      foldDepth: 0.4 + (getValue(12, 30) / 100),
      hue: getValue(0, 360),
      numShapes: 5 + getValue(4, 3),
      rotation: getValue(6, 360),
      shapeType: getValue(10, 3)
    };
  }, [hashBytes]);

  const paths = useMemo(() => {
    const { curvature, foldDepth, hue, numShapes, rotation, shapeType } = params;
    const results = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.85;

    const generateShape = (shapeAngle: number) => {
      switch (shapeType) {
        case 0: // Flowing curves
          return Array.from({ length: 4 }, (_, i) => {
            const angle = shapeAngle + (i * Math.PI / 2);
            const r = radius * (0.4 + (0.3 * Math.sin(angle * 2)));

            return {
              cx1: centerX + r * 1.2 * Math.cos(angle + curvature),
              cx2: centerX + r * 1.2 * Math.cos(angle - curvature),
              cy1: centerY + r * 1.2 * Math.sin(angle + curvature),
              cy2: centerY + r * 1.2 * Math.sin(angle - curvature),
              x: centerX + r * Math.cos(angle),
              y: centerY + r * Math.sin(angle)
            };
          });
        case 1: // Folded paper effect
          return Array.from({ length: 5 }, (_, i) => {
            const angle = shapeAngle + (i * Math.PI * 0.4);
            const r = radius * (0.5 + (0.3 * Math.cos(angle * 3)));
            const fold = Math.sin(angle * 2) * foldDepth;

            return {
              cx1: centerX + (r * (1 + fold)) * Math.cos(angle + curvature),
              cx2: centerX + (r * (1 - fold)) * Math.cos(angle - curvature),
              cy1: centerY + (r * (1 + fold)) * Math.sin(angle + curvature),
              cy2: centerY + (r * (1 - fold)) * Math.sin(angle - curvature),
              x: centerX + r * Math.cos(angle),
              y: centerY + r * Math.sin(angle)
            };
          });
        default: // Organic curves
          return Array.from({ length: 6 }, (_, i) => {
            const angle = shapeAngle + (i * Math.PI / 3);
            const r = radius * (0.4 + (0.4 * Math.cos(angle * 2)));

            return {
              cx1: centerX + r * 1.3 * Math.cos(angle + curvature),
              cx2: centerX + r * 1.3 * Math.cos(angle - curvature),
              cy1: centerY + r * 1.3 * Math.sin(angle + curvature),
              cy2: centerY + r * 1.3 * Math.sin(angle - curvature),
              x: centerX + r * Math.cos(angle),
              y: centerY + r * Math.sin(angle)
            };
          });
      }
    };

    for (let s = 0; s < numShapes; s++) {
      const shapeAngle = (rotation + (s * 360 / numShapes)) * (Math.PI / 180);
      const shapePoints = generateShape(shapeAngle);
      const pathCommands = shapePoints.map((point, i) => {
        const nextPoint = shapePoints[(i + 1) % shapePoints.length];

        if (i === 0) {
          return `M ${point.x},${point.y}`;
        }

        return `C ${point.cx2},${point.cy2} ${nextPoint.cx1},${nextPoint.cy1} ${nextPoint.x},${nextPoint.y}`;
      }).join(' ');

      const baseOpacity = 0.2 + (s / numShapes) * 0.6;
      const lightness = 50 + (s / numShapes) * 20;

      results.push(
        <path
          d={`${pathCommands} Z`}
          fill={`hsla(${(hue + s * 5) % 360}, 85%, ${lightness}%, ${baseOpacity})`}
          filter='url(#softShadow)'
          key={s}
          style={{
            mixBlendMode: 'soft-light'
          }}
        />
      );
    }

    return results;
  }, [size, params]);

  return (
    <div style={{ height: `${size}px`, width: `${size}px` }}>
      <svg
        className='rounded-full'
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        <defs>
          <radialGradient id={`bg-${params.hue}`}>
            <stop
              offset='0%'
              stopColor={`hsl(${params.hue}, 20%, 75%)`}
            />
            <stop
              offset='100%'
              stopColor={`hsl(${params.hue}, 50%, 35%)`}
            />
          </radialGradient>
          <filter id='softBlur'>
            <feGaussianBlur in='SourceGraphic' stdDeviation='0.5' />
          </filter>
          <filter id='softShadow'>
            <feGaussianBlur in='SourceAlpha' stdDeviation='1' />
            <feOffset dx='0.5' dy='0.5' />
            <feComponentTransfer>
              <feFuncA slope='0.3' type='linear' />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          fill='#AA83DC'
          r={size / 2}
        />
        {paths}
      </svg>
    </div>
  );
};

export default PolkaGateIdenticon;
