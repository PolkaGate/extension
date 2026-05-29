// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ForceGraphMethods as ForceGraph2DMethods } from 'react-force-graph-2d';
import type { ForceGraphMethods as ForceGraph3DMethods, LinkObject, NodeObject } from 'react-force-graph-3d';
import type { DirectionFilter, InteractionLink, InteractionNode } from './buildInteractionGraph';

export type GraphNode = NodeObject<InteractionNode>;
export type GraphLink = LinkObject<InteractionNode, InteractionLink>;
export type Graph2DRef = ForceGraph2DMethods<GraphNode, GraphLink>;
export type Graph3DRef = ForceGraph3DMethods<GraphNode, GraphLink>;
export type GraphMode = '2d' | '3d';

export interface ChargeForce {
  strength?: (strength: number) => unknown;
}

export interface CollisionForce {
  radius?: (radius: (node: InteractionNode) => number) => unknown;
}

export interface LinkForce {
  distance?: (distance: (link: InteractionLink) => number) => unknown;
}

export type SelectedItem =
  | { type: 'node'; item: GraphNode }
  | { type: 'link'; item: GraphLink; node?: GraphNode }
  | undefined;

export type InteractionFilterValue = `direction:${DirectionFilter}` | `type:${string}`;

export interface NodePosition {
  x: number;
  y: number;
  z?: number;
}

export interface GraphSize {
  height: number;
  width: number;
}
