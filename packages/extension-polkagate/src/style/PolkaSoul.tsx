// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

interface Props {
  address: string;
  size?: number;
  style?: React.CSSProperties;
}

const PolkaSoul = ({ address, size = 32, style = {} }: Props) => {
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
      complexity: 0.5 + getValue(14, 50) / 100,
      curvature: 0.1 + getValue(8, 80) / 100,
      foldDepth: 0.2 + getValue(12, 60) / 100,
      hue: getValue(0, 360),
      layerEffect: getValue(16, 4),
      numShapes: 3 + getValue(4, 5),
      rotation: getValue(6, 360),
      shapeType: getValue(10, 6)
    };
  }, [hashBytes]);

  const paths = useMemo(() => {
    const { curvature, foldDepth, hue, numShapes, rotation, shapeType } = params;
    const results = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.85;

    const generateShape = (shapeAngle: number) => {
      const basePoints = 5 + Math.floor(params.complexity * 7);
      const points = Array.from({ length: basePoints }, (_, i) => {
        const angle = shapeAngle + (i * Math.PI * 2) / basePoints;
        const noise = Math.sin(angle * params.complexity * 10) * 0.2;
        const r = radius * (0.3 + 0.5 * Math.sin(angle * params.complexity * 5) + noise);

        return {
          cx1: centerX + r * (1.2 + noise) * Math.cos(angle + curvature),
          cx2: centerX + r * (1.2 - noise) * Math.cos(angle - curvature),
          cy1: centerY + r * (1.2 + noise) * Math.sin(angle + curvature),
          cy2: centerY + r * (1.2 - noise) * Math.sin(angle - curvature),
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle)
        };
      });

      switch (shapeType) {
        case 0: // Flowing curves
          return points.map((p) => ({ ...p, cx1: p.cx1 * 1.1, cy1: p.cy1 * 1.1 }));
        case 1: // Folded paper effect
          return points.map((p) => {
            const fold = Math.sin(Math.atan2(p.y - centerY, p.x - centerX) * 3) * foldDepth;

            return {
              ...p,
              cx1: p.cx1 * (1 + fold),
              cx2: p.cx2 * (1 - fold),
              cy1: p.cy1 * (1 + fold),
              cy2: p.cy2 * (1 - fold)
            };
          });
        case 2: // Organic curves
          return points.map((p) => ({ ...p, cx1: p.cx1 * 1.2, cx2: p.cx2 * 0.8, cy1: p.cy1 * 1.2, cy2: p.cy2 * 0.8 }));
        case 3: // Spiral effect
          return points.map((p, i) => {
            const spiralFactor = 0.8 + (i / basePoints) * 0.4;

            return {
              ...p,
              x: centerX + (p.x - centerX) * spiralFactor,
              y: centerY + (p.y - centerY) * spiralFactor
            };
          });
        case 4: // Starburst
          return points.map((p, i) => {
            const burstFactor = i % 2 === 0 ? 1.2 : 0.8;

            return {
              ...p,
              x: centerX + (p.x - centerX) * burstFactor,
              y: centerY + (p.y - centerY) * burstFactor
            };
          });
        default: // Crystalline
          return points.map((p) => {
            const distanceFromCenter = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
            const crystallineFactor = 0.8 + Math.sin(distanceFromCenter * 0.2) * 0.3;

            return {
              ...p,
              x: centerX + (p.x - centerX) * crystallineFactor,
              y: centerY + (p.y - centerY) * crystallineFactor
            };
          });
      }
    };

    for (let s = 0; s < numShapes; s++) {
      const shapeAngle = (rotation + (s * 360) / numShapes) * (Math.PI / 180);
      const shapePoints = generateShape(shapeAngle);
      const pathCommands = shapePoints
        .map((point, i) => {
          const nextPoint = shapePoints[(i + 1) % shapePoints.length];

          if (i === 0) {
            return `M ${point.x},${point.y}`;
          }

          return `C ${point.cx2},${point.cy2} ${nextPoint.cx1},${nextPoint.cy1} ${nextPoint.x},${nextPoint.y}`;
        })
        .join(' ');

      const baseOpacity = 0.6 + (s / numShapes) * 0.4;
      const lightness = 50 + (s / numShapes) * 40;
      const saturation = 80 + (s / numShapes) * 20;

      results.push(
        <path
          d={`${pathCommands} Z`}
          fill={`hsla(${(hue + s * 30) % 360}, ${saturation}%, ${lightness}%, ${baseOpacity})`}
          filter={`url(#softShadow${s})`}
          key={s}
        />
      );
    }

    return results;
  }, [size, params]);

  return (
    <div style={{ alignItems: 'center', cursor: 'copy', display: 'flex', height: `${size}px`, justifyContent: 'center', width: `${size}px`, ...style }}>
      <CopyToClipboard text={String(address)}>
        <svg className='rounded-full' height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
          <defs>
            <radialGradient id={`bg-${params.hue}`}>
              <stop offset='0%' stopColor={`hsl(${params.hue}, 30%, 80%)`} />
              <stop offset='100%' stopColor={`hsl(${params.hue}, 60%, 40%)`} />
            </radialGradient>
            <filter id='softBlur'>
              <feGaussianBlur in='SourceGraphic' stdDeviation='0.7' />
            </filter>
            <filter id='softGlow'>
              <feGaussianBlur in='SourceGraphic' result='blur' stdDeviation='2.5' />
              <feComposite in='SourceGraphic' in2='blur' operator='over' />
            </filter>
            {Array.from({ length: params.numShapes }, (_, i) => (
              <filter id={`softShadow${i}`} key={`shadow-${i}`}>
                <feGaussianBlur in='SourceAlpha' stdDeviation={1 + i * 0.2} />
                <feOffset dx={0.5 + i * 0.1} dy={0.5 + i * 0.1} />
                <feComponentTransfer>
                  <feFuncA slope={0.3 + i * 0.05} type='linear' />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
            ))}
          </defs>
          <defs>
            <linearGradient id='gradient' x1='0%' x2='100%' y1='0%' y2='100%'>
              <stop offset='0%' style={{ stopColor: `hsl(${params.hue}, 70%, 20%)`, stopOpacity: 0.2 }} />
              <stop offset='50%' style={{ stopColor: `hsl(${(params.hue + 60) % 360}, 80%, 50%)`, stopOpacity: 0.3 }} />
              <stop offset='100%' style={{ stopColor: `hsl(${(params.hue + 180) % 360}, 70%, 20%)`, stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} fill='url(#gradient)' r={size / 2} />
          <circle
            cx={size / 2}
            cy={size / 2}
            fill='none'
            filter='url(#softGlow)'
            r={size / 2 - 1}
            stroke='url(#gradient)'
            strokeWidth='2'
          />
          {paths}
        </svg>
      </CopyToClipboard>
    </div>
  );
};

export default React.memo(PolkaSoul);
