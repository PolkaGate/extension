// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { GraphNode } from '../types';

import { toShortAddress } from '@polkadot/extension-polkagate/src/util';

import { nodeColor, nodeRadius, validatorDisplayName } from '../utils';

export function drawNode(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number, isDark: boolean, selectedNodeId?: string) {
  const radius = nodeRadius(node);
  const label = node.label || toShortAddress(node.address);
  const fontSize = node.isCenter ? 13 : 11;
  const isSelected = selectedNodeId === node.id;

  ctx.beginPath();
  ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = nodeColor(node, isDark);
  ctx.shadowColor = nodeColor(node, isDark);
  ctx.shadowBlur = isSelected ? 24 : node.isCenter ? 18 : 8;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = isSelected ? 4 : node.isCenter ? 2.5 : 1.5;
  ctx.strokeStyle = isSelected ? '#FFD166' : isDark ? '#EAEBF1' : '#BFA7E3';
  ctx.stroke();

  if (isSelected) {
    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, radius + 6, 0, 2 * Math.PI, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark ? '#FFD166' : '#FF4FB9';
    ctx.stroke();
  }

  if (node.isValidator) {
    const badgeText = 'VAL';
    const badgeFontSize = 8 / globalScale;
    const badgeHeight = 13 / globalScale;
    const badgePadding = 4 / globalScale;
    const badgeX = (node.x ?? 0) + radius - (3 / globalScale);
    const badgeY = (node.y ?? 0) - radius - (badgeHeight / 2);

    ctx.font = `700 ${badgeFontSize}px Inter`;

    const badgeWidth = ctx.measureText(badgeText).width + (badgePadding * 2);

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
    ctx.fillStyle = '#FFD166';
    ctx.fill();
    ctx.fillStyle = '#291443';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + (badgeWidth / 2), badgeY + (badgeHeight / 2));
  }

  const labelVisible = globalScale > 0.75 || node.isCenter;

  if (!labelVisible) {
    return;
  }

  ctx.font = `${fontSize / globalScale}px Inter`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = isDark ? '#EAEBF1' : '#291443';
  ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + radius + 4);

  if (node.isValidator) {
    ctx.font = `${9 / globalScale}px Inter`;
    ctx.fillStyle = '#FFD166';
    ctx.fillText(validatorDisplayName(node), node.x ?? 0, (node.y ?? 0) + radius + (18 / globalScale));
  }
}
