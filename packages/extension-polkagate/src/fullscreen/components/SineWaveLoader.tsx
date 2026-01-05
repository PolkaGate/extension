// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef } from 'react';

interface SineWaveLoaderProps {
  width?: number;
  height?: number;
  color?: string; // base color
  highlightColor?: string; // shimmer color
  lineWidth?: number;
}

const SineWaveLoader: React.FC<SineWaveLoaderProps> = ({ color = '#e0e0e0',
  height = 200,
  lineWidth = 1,
  width = 600 }) => {
  const pulse = useRef<{ value: number; currentWave: number }>({ currentWave: 0, value: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // --- Draw axes with arrows ---
      ctx.beginPath();
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;

      const arrowSize = 6;

      // Y axis
      ctx.moveTo(40, height);
      ctx.lineTo(40, 0 + arrowSize);
      ctx.stroke();
      // Y arrow
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(40 - arrowSize, arrowSize);
      ctx.lineTo(40 + arrowSize, arrowSize);
      ctx.closePath();
      ctx.fillStyle = '#999';
      ctx.fill();

      // X axis
      ctx.beginPath();
      ctx.moveTo(40, height - 20);
      ctx.lineTo(width, height - 20);
      ctx.stroke();
      // X arrow
      ctx.beginPath();
      ctx.moveTo(width, height - 20);
      ctx.lineTo(width - arrowSize, height - 20 - arrowSize);
      ctx.lineTo(width - arrowSize, height - 20 + arrowSize);
      ctx.closePath();
      ctx.fillStyle = '#999';
      ctx.fill();

      // --- Draw sine wave progressively from left to right ---
      ctx.beginPath();
      const alpha = 0.5 + 0.5 * Math.sin(pulse.current.value);

      // Create horizontal gradient for the wave
      const gradient = ctx.createLinearGradient(40, 0, 40 + pulse.current.currentWave, 0);

      // color is the base color and highlightColor is the shimmer color
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, `rgba(192,192,192,${alpha})`);
      gradient.addColorStop(1, color);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;

      const waveHeight = height * 0.5; // amplitude range
      const baseline = height - 20 - waveHeight / 2; // baseline above X-axis

      pulse.current.currentWave += 2; // speed of drawing

      if (pulse.current.currentWave > width - 40) {
        pulse.current.currentWave = 0;
      }

      for (let x = 40; x < 40 + pulse.current.currentWave; x++) {
        const y = baseline + (waveHeight / 2) * Math.sin(0.02 * (x - 40));

        ctx.lineTo(x, y);
      }

      ctx.stroke();
      pulse.current.value += 0.05;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [width, height, lineWidth, color]);

  return <canvas height={height} ref={canvasRef} width={width} />;
};

export default SineWaveLoader;
