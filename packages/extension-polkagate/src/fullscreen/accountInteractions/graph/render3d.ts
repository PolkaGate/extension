// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Graph3DRef, GraphNode, GraphSize } from '../types';

import * as THREE from 'three';

import { toShortAddress } from '@polkadot/extension-polkagate/src/util';

import { CAMERA_3D_DENSE_FIT_FACTOR, CAMERA_3D_DIRECTION, CAMERA_3D_MIN_DISTANCE, CAMERA_3D_SPARSE_FIT_FACTOR } from '../constants';
import { nodeColor, nodeRadius } from '../utils';

const get3DFitFactor = (nodeCount: number) => {
  if (nodeCount <= 7) {
    return CAMERA_3D_SPARSE_FIT_FACTOR;
  }

  if (nodeCount >= 16) {
    return CAMERA_3D_DENSE_FIT_FACTOR;
  }

  return THREE.MathUtils.lerp(CAMERA_3D_SPARSE_FIT_FACTOR, CAMERA_3D_DENSE_FIT_FACTOR, (nodeCount - 7) / 9);
};

export function fit3DGraph(graphInstance: Graph3DRef | undefined, size: GraphSize, nodeCount: number, transitionDuration = 0) {
  if (!graphInstance) {
    return;
  }

  const bbox = graphInstance.getGraphBbox();

  if (!bbox) {
    return;
  }

  const bboxValues = [...bbox.x, ...bbox.y, ...bbox.z];

  if (bboxValues.some((value) => !Number.isFinite(value))) {
    return;
  }

  const centerVector = new THREE.Vector3(
    (bbox.x[0] + bbox.x[1]) / 2,
    (bbox.y[0] + bbox.y[1]) / 2,
    (bbox.z[0] + bbox.z[1]) / 2
  );
  const camera = graphInstance.camera();
  const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
  const verticalFov = THREE.MathUtils.degToRad(fov);
  const aspect = Math.max(0.1, size.width / Math.max(size.height, 1));
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
  const forward = CAMERA_3D_DIRECTION.clone().negate();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(forward, worldUp);

  if (right.lengthSq() < 0.0001) {
    right.set(1, 0, 0);
  } else {
    right.normalize();
  }

  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  const visualPadding = 26;
  const requiredDistance = Math.max(
    CAMERA_3D_MIN_DISTANCE,
    ...bbox.x.flatMap((x) => bbox.y.flatMap((y) => bbox.z.map((z) => {
      const relative = new THREE.Vector3(x, y, z).sub(centerVector);
      const verticalDistance = (Math.abs(relative.dot(up)) + visualPadding) / Math.tan(verticalFov / 2);
      const horizontalDistance = (Math.abs(relative.dot(right)) + visualPadding) / Math.tan(horizontalFov / 2);

      return Math.max(verticalDistance, horizontalDistance) - relative.dot(forward);
    })))
  );
  const distance = requiredDistance * get3DFitFactor(nodeCount);
  const position = CAMERA_3D_DIRECTION.clone().multiplyScalar(distance).add(centerVector);
  const center = { x: centerVector.x, y: centerVector.y, z: centerVector.z };

  graphInstance.cameraPosition({ x: position.x, y: position.y, z: position.z }, center, transitionDuration);
}

function create3DLabel(label: string, isDark: boolean, isSelected: boolean) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 34;
  const paddingX = 20;
  const paddingY = 12;

  if (!context) {
    return undefined;
  }

  context.font = `600 ${fontSize}px Inter, sans-serif`;

  const measuredWidth = context.measureText(label).width;

  canvas.width = Math.ceil(measuredWidth + (paddingX * 2));
  canvas.height = fontSize + (paddingY * 2);

  context.font = `600 ${fontSize}px Inter, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.strokeStyle = isDark ? '#05091C' : '#FFFFFF';
  context.lineWidth = 7;
  context.strokeText(label, canvas.width / 2, canvas.height / 2);
  context.fillStyle = isSelected ? isDark ? '#FFD166' : '#674394' : isDark ? '#EAEBF1' : '#291443';
  context.fillText(label, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    depthTest: false,
    depthWrite: false,
    map: texture,
    transparent: true
  });
  const sprite = new THREE.Sprite(material);
  const scale = 0.115;

  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);

  return sprite;
}

export function create3DNode(node: GraphNode, isDark: boolean, selectedNodeId?: string) {
  const group = new THREE.Group();
  const radius = nodeRadius(node) * 0.94;
  const isSelected = selectedNodeId === node.id;
  const color = nodeColor(node, isDark);
  const ringColor = isSelected ? isDark ? '#FFD166' : '#FF4FB9' : isDark ? '#EAEBF1' : '#BFA7E3';
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(radius * (isSelected ? 1.6 : 1.42), 32, 32),
    new THREE.MeshBasicMaterial({
      color: isSelected ? ringColor : color,
      depthWrite: false,
      opacity: isSelected ? 0.24 : isDark ? 0.13 : 0.18,
      transparent: true
    })
  );
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 36, 36),
    new THREE.MeshPhysicalMaterial({
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      color,
      emissive: color,
      emissiveIntensity: isDark ? 0.14 : 0.08,
      metalness: 0.04,
      roughness: 0.3
    })
  );
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.05, isSelected ? 0.42 : 0.28, 12, 64),
    new THREE.MeshBasicMaterial({ color: ringColor })
  );
  const highlight = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.23, 16, 16),
    new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      depthWrite: false,
      opacity: isDark ? 0.26 : 0.34,
      transparent: true
    })
  );
  const label = create3DLabel(node.label || toShortAddress(node.address), isDark, isSelected);

  rim.rotation.x = Math.PI / 2;
  highlight.position.set(-radius * 0.32, radius * 0.36, radius * 0.72);
  group.add(halo);
  group.add(sphere);
  group.add(rim);
  group.add(highlight);

  if (label) {
    label.position.set(0, -(radius + 10), 0);
    group.add(label);
  }

  if (node.isValidator) {
    const validatorLabel = create3DLabel('VAL', isDark, true);

    if (validatorLabel) {
      validatorLabel.scale.multiplyScalar(0.55);
      validatorLabel.position.set(radius + 6, radius + 4, 0);
      group.add(validatorLabel);
    }
  }

  return group;
}

export function set3DGraphLights(graphInstance: Graph3DRef | undefined, isDark: boolean) {
  if (!graphInstance) {
    return;
  }

  const ambientLight = new THREE.AmbientLight('#FFFFFF', isDark ? 1.35 : 1.65);
  const keyLight = new THREE.DirectionalLight('#FFFFFF', isDark ? 1.05 : 0.95);
  const accentLight = new THREE.PointLight('#AA83DC', isDark ? 1.4 : 0.75, 700);

  keyLight.position.set(-180, -120, 260);
  accentLight.position.set(160, 120, 220);
  graphInstance.lights([ambientLight, keyLight, accentLight]);
}
