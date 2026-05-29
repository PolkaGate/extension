// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DirectionFilter, StatusFilter } from './buildInteractionGraph';
import type { GraphMode } from './types';

import * as THREE from 'three';

export const ALL_TYPES = 'all';
export const CAMERA_3D_DIRECTION = new THREE.Vector3(0.2, -0.64, 0.74).normalize();
export const CAMERA_3D_DENSE_FIT_FACTOR = 0.68;
export const CAMERA_3D_MIN_DISTANCE = 82;
export const CAMERA_3D_SPARSE_FIT_FACTOR = 0.86;
export const DIRECTION_OPTIONS: DirectionFilter[] = ['all', 'sent', 'received', 'mixed'];
export const DETAIL_PANEL_COLLAPSED_WIDTH = 52;
export const DETAIL_PANEL_WIDTH = 330;
export const GRAPH_MODES: GraphMode[] = ['2d', '3d'];
export const MIN_HISTORY_RANGE_ITEMS = 2;
export const STATUS_OPTIONS: StatusFilter[] = ['all', 'completed', 'failed'];
