// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ForceGraphMethods as ForceGraph2DMethods } from 'react-force-graph-2d';
import type { ForceGraphMethods as ForceGraph3DMethods, LinkObject, NodeObject } from 'react-force-graph-3d';
import type { AdvancedDropdownOption } from '../../util/types';
import type { DirectionFilter, InteractionFilters, InteractionLink, InteractionNode, StatusFilter, TokenTotal } from './buildInteractionGraph';

import { Box, Button, Grid, IconButton, Slider, Stack, Typography, useTheme } from '@mui/material';
import { createAssets } from '@polkagate/apps-config/assets';
import { ArrowLeft2, CloseCircle, Maximize4, Refresh2 } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import { useNavigate, useParams } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import * as THREE from 'three';

import { CopyAddressButton, DropSelect, FormatPrice } from '@polkadot/extension-polkagate/src/components';
import Logo from '@polkadot/extension-polkagate/src/components/Logo';
import HistoryIcon from '@polkadot/extension-polkagate/src/fullscreen/history/HistoryIcon';
import useTransactionHistory from '@polkadot/extension-polkagate/src/popup/history/useTransactionHistory';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style';
import { formatTimestamp, historyIconBgColor, toCamelCase, toShortAddress } from '@polkadot/extension-polkagate/src/util';
import resolveLogoInfo from '@polkadot/extension-polkagate/src/util/logo/resolveLogoInfo';

import { useAccount, useChainInfo, usePrices, useTokenPriceBySymbol, useTranslation, useValidatorsInformation } from '../../hooks';
import { EmptyListBox } from '../components';
import HomeLayout from '../components/layout';
import { buildInteractionGraph, getInteractionTypes, normalizeAddress } from './buildInteractionGraph';

type GraphNode = NodeObject<InteractionNode>;
type GraphLink = LinkObject<InteractionNode, InteractionLink>;
type Graph2DRef = ForceGraph2DMethods<GraphNode, GraphLink>;
type Graph3DRef = ForceGraph3DMethods<GraphNode, GraphLink>;
type GraphMode = '2d' | '3d';
interface ChargeForce {
  strength?: (strength: number) => unknown;
}
interface CollisionForce {
  radius?: (radius: (node: InteractionNode) => number) => unknown;
}
interface LinkForce {
  distance?: (distance: (link: InteractionLink) => number) => unknown;
}
type SelectedItem =
  | { type: 'node'; item: GraphNode }
  | { type: 'link'; item: GraphLink; node?: GraphNode }
  | undefined;
type InteractionFilterValue = `direction:${DirectionFilter}` | `type:${string}`;
interface NodePosition {
  x: number;
  y: number;
  z?: number;
}
interface GraphSize {
  height: number;
  width: number;
}

const ALL_TYPES = 'all';
const CAMERA_3D_DIRECTION = new THREE.Vector3(0.2, -0.64, 0.74).normalize();
const CAMERA_3D_DENSE_FIT_FACTOR = 0.68;
const CAMERA_3D_MIN_DISTANCE = 82;
const CAMERA_3D_SPARSE_FIT_FACTOR = 0.86;
const DIRECTION_OPTIONS: DirectionFilter[] = ['all', 'sent', 'received', 'mixed'];
const DETAIL_PANEL_COLLAPSED_WIDTH = 52;
const DETAIL_PANEL_WIDTH = 330;
const GRAPH_MODES: GraphMode[] = ['2d', '3d'];
const MIN_HISTORY_RANGE_ITEMS = 2;
const STATUS_OPTIONS: StatusFilter[] = ['all', 'completed', 'failed'];
const assetsChains = createAssets();

const formatOption = (option: string) => option
  .split(/[-_\s]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ height: 0, width: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      setSize({
        height: Math.max(540, element.clientHeight),
        width: Math.max(420, element.clientWidth)
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function TopFilterSelect<T extends string>({ label, onChange, options, value, width }: { label: string; onChange: (value: T) => void; options: AdvancedDropdownOption[]; value: T; width: number }) {
  const _onChange = useCallback((newValue: number | string) => onChange(newValue as T), [onChange]);

  return (
    <Stack alignItems='center' direction='row' gap='8px'>
      <Typography color='text.secondary' sx={{ textTransform: 'uppercase' }} variant='S-1'>
        {label}
      </Typography>
      <DropSelect
        onChange={_onChange}
        options={options}
        scrollTextOnOverflow
        simpleArrow
        style={{ height: '38px', padding: '7px 10px', width: `${width}px` }}
        value={value}
      />
    </Stack>
  );
}

const linkColor = (direction: InteractionLink['direction'], isDark: boolean) => {
  switch (direction) {
    case 'sent':
      return '#FF4FB9';
    case 'received':
      return '#2ED3B7';
    default:
      return isDark ? '#AA83DC' : '#674394';
  }
};

const nodeColor = (node: InteractionNode, isDark: boolean) =>
  node.isCenter
    ? '#FF4FB9'
    : node.sentCount > 0 && node.receivedCount > 0
      ? isDark ? '#AA83DC' : '#674394'
      : node.sentCount > 0
        ? '#FF4FB9'
        : '#2ED3B7';

const nodeRadius = (node: InteractionNode) => node.isCenter ? 11 : Math.min(11, 5 + Math.sqrt(node.txCount || 1) * 1.8);

const validatorDisplayName = (node: InteractionNode) => node.validatorName || 'Validator';

const recentIconBackground = (action: string, isDark: boolean) => {
  if (isDark) {
    return historyIconBgColor(action);
  }

  const normalizedAction = action.toLowerCase();

  return ['receive', 'reward'].includes(normalizedAction)
    ? '#E9FFF1'
    : ['send', 'proxy', 'utility'].includes(normalizedAction)
      ? '#FFFFFF'
      : '#F5F4FF';
};

const linkColor3D = (direction: InteractionLink['direction'], isDark: boolean) => {
  if (!isDark) {
    return linkColor(direction, isDark);
  }

  switch (direction) {
    case 'sent':
      return '#FF5AC3';
    case 'received':
      return '#35E6CE';
    default:
      return '#B88CFF';
  }
};

const get3DFitFactor = (nodeCount: number) => {
  if (nodeCount <= 7) {
    return CAMERA_3D_SPARSE_FIT_FACTOR;
  }

  if (nodeCount >= 16) {
    return CAMERA_3D_DENSE_FIT_FACTOR;
  }

  return THREE.MathUtils.lerp(CAMERA_3D_SPARSE_FIT_FACTOR, CAMERA_3D_DENSE_FIT_FACTOR, (nodeCount - 7) / 9);
};

function fit3DGraph(graphInstance: Graph3DRef | undefined, size: GraphSize, nodeCount: number, transitionDuration = 0) {
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

function drawNode(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number, isDark: boolean, selectedNodeId?: string) {
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

function create3DNode(node: GraphNode, isDark: boolean, selectedNodeId?: string) {
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

function TokenTotalRow({ amount, genesisHash, token }: TokenTotal) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { chainName, token: nativeToken } = useChainInfo(genesisHash, true);
  const pricesInCurrencies = usePrices();
  const isNativeToken = Boolean(token && nativeToken && token.toLowerCase() === nativeToken.toLowerCase());
  const maybeKnownAsset = useMemo(() => assetsChains[toCamelCase(chainName || '')]?.find(({ symbol }) => symbol.toLowerCase() === token.toLowerCase()), [chainName, token]);
  const logoInfo = useMemo(() => {
    if (isNativeToken || maybeKnownAsset) {
      return resolveLogoInfo(genesisHash, token);
    }

    return undefined;
  }, [genesisHash, isNativeToken, maybeKnownAsset, token]);
  const nativePrice = useTokenPriceBySymbol(isNativeToken ? token : undefined, genesisHash);
  const assetPrice = maybeKnownAsset?.priceId ? pricesInCurrencies?.prices?.[maybeKnownAsset.priceId]?.value : undefined;
  const price = isNativeToken ? nativePrice.price : assetPrice;
  const fiatValue = useMemo(() => price === undefined ? undefined : amount * price, [amount, price]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ columnGap: '10px', width: '100%' }}>
      <Logo
        assetSize='24px'
        baseTokenSize='0'
        fallbackText={token}
        genesisHash={genesisHash}
        logo={logoInfo?.logo}
        subLogo={undefined}
        token={isNativeToken || maybeKnownAsset ? token : undefined}
      />
      <Stack alignItems='flex-end' direction='column' rowGap='3px' sx={{ minWidth: 0 }}>
        <Typography color='text.primary' noWrap sx={{ textAlign: 'right' }} variant='B-2'>
          {amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {token}
        </Typography>
        {fiatValue !== undefined && fiatValue > 0 &&
          <FormatPrice
            commify
            decimalColor={isDark ? '#BEAAD8' : theme.palette.text.secondary}
            fontFamily='Inter'
            fontSize='12px'
            fontWeight={500}
            height={14}
            num={fiatValue}
            textAlign='right'
            textColor={isDark ? '#BEAAD8' : theme.palette.text.secondary}
            width='fit-content'
          />
        }
      </Stack>
    </Stack>
  );
}

function DetailPanel({ selected }: { selected: SelectedItem }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!selected) {
    return (
      <Stack justifyContent='center' sx={{ height: '100%', px: '18px' }}>
        <Typography color='text.secondary' textAlign='center' variant='B-2'>
          {t('Select a node or connection to inspect interactions.')}
        </Typography>
      </Stack>
    );
  }

  if (selected.type === 'node') {
    const { item } = selected;

    return (
      <Stack direction='column' sx={{ p: '18px', pb: '48px' }}>
        <Typography color='text.primary' sx={{ mb: '10px' }} variant='H-3'>
          {item.name || (item.isCenter ? t('Selected account') : t('Unknown'))}
        </Typography>
        <Stack alignItems='center' direction='row' justifyContent='center' sx={{ columnGap: '6px', maxWidth: '100%', mb: '16px' }}>
          <Typography color='text.secondary' noWrap title={item.address} variant='B-4'>
            {toShortAddress(item.address, 8)}
          </Typography>
          <CopyAddressButton address={item.address} padding={0} size={17} />
        </Stack>
        <Stack direction='row' flexWrap='wrap' gap='8px' justifyContent='center'>
          <Metric label={t('Transactions')} value={item.txCount} />
          <Metric label={t('Sent')} value={item.sentCount} />
          <Metric label={t('Received')} value={item.receivedCount} />
          {item.failedCount > 0 &&
            <Metric label={t('Failed')} value={item.failedCount} />
          }
        </Stack>
        {item.isValidator &&
          <Typography color='warning.main' sx={{ mt: '10px', textAlign: 'center' }} variant='B-4'>
            {t('Validator')}
          </Typography>
        }
      </Stack>
    );
  }

  const { item, node } = selected;
  const latest = item.transactions
    .slice()
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  return (
    <Stack direction='column' rowGap='14px' sx={{ height: '100%', overflow: 'hidden', p: '18px', pb: '48px' }}>
      <Typography color='text.primary' variant='H-3'>
        {node?.name || (node ? t('Unknown') : formatOption(t('connection')))}
      </Typography>
      {node &&
        <>
          <Stack alignItems='center' direction='row' justifyContent='center' sx={{ columnGap: '6px', maxWidth: '100%' }}>
            <Typography color='text.secondary' noWrap title={node.address} variant='B-4'>
              {toShortAddress(node.address, 8)}
            </Typography>
            <CopyAddressButton address={node.address} padding={0} size={17} />
          </Stack>
          {node.isValidator &&
            <Typography color='warning.main' sx={{ mt: '-8px', textAlign: 'center' }} variant='B-5'>
              {t('Validator')}
            </Typography>
          }
        </>
      }
      <Stack direction='row' flexWrap='wrap' gap='8px' justifyContent='center'>
        <Metric label={t('Transactions')} value={item.txCount} />
        <Metric label={t('Sent')} value={item.sentCount} />
        <Metric label={t('Received')} value={item.receivedCount} />
        {item.failedCount > 0 &&
          <Metric label={t('Failed')} value={item.failedCount} />
        }
      </Stack>
      <Stack alignItems='start' direction='column' rowGap='7px' sx={{ width: '100%' }}>
        <Typography color='text.secondary' sx={{ textTransform: 'uppercase' }} variant='S-1'>
          {t('Totals')}
        </Typography>
        <Stack direction='column' rowGap='7px' sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', border: '1px solid', borderColor: isDark ? '#2D1E4A' : '#DDE3F4', borderRadius: '12px', p: '10px 12px', width: '100%' }}>
          {item.tokens.map((tokenTotal) => (
            <TokenTotalRow key={`${tokenTotal.genesisHash ?? 'native'}:${tokenTotal.token}`} {...tokenTotal} />
          ))}
        </Stack>
      </Stack>
      <Stack alignItems='start' direction='column' rowGap='7px' sx={{ overflow: 'hidden', width: '100%' }}>
        <Typography color='text.secondary' sx={{ pl: '2px', textTransform: 'uppercase' }} variant='S-1'>
          {t('Recent')}
        </Typography>
        <Stack direction='column' rowGap='6px' sx={{ overflowY: 'auto', pr: '4px', width: '100%' }}>
          {latest.map((history) => (
            <Stack
              alignItems='center'
              direction='row'
              key={`${history.txHash ?? history.extrinsicIndex ?? history.date}-${history.action}-${history.amount}`}
              sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', borderRadius: '10px', columnGap: '9px', minHeight: '58px', px: '10px', py: '8px', width: '100%' }}
            >
              <Grid alignItems='center' container item justifyContent='center' sx={{ background: recentIconBackground(history.subAction ?? history.action, isDark), border: '2px solid', borderColor: isDark ? '#2D1E4A' : '#EEF1FF', borderRadius: '999px', flexShrink: 0, height: '36px', width: '36px' }}>
                <HistoryIcon action={history.subAction ?? history.action} isFullscreen={false} />
              </Grid>
              <Stack direction='column' rowGap='3px' sx={{ minWidth: 0, width: '100%' }}>
                <Stack alignItems='baseline' direction='row' justifyContent='space-between' sx={{ columnGap: '10px', minWidth: 0 }}>
                  <Typography color='text.primary' noWrap variant='B-2'>
                    {formatOption(history.subAction ?? history.action)}
                  </Typography>
                  <Typography color='text.primary' noWrap sx={{ textAlign: 'right' }} variant='B-2'>
                    {history.amount ?? '0'} {history.token ?? ''}
                  </Typography>
                </Stack>
                <Typography color='text.secondary' noWrap sx={{ textAlign: 'left' }} variant='B-5'>
                  {formatTimestamp(history.date)}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', border: '1px solid', borderColor: isDark ? '#2D1E4A' : '#DDE3F4', borderRadius: '10px', minWidth: '92px', p: '8px' }}>
      <Typography color='text.secondary' variant='B-5'>
        {label}
      </Typography>
      <Typography color='text.primary' variant='B-1'>
        {value}
      </Typography>
    </Stack>
  );
}

function GraphLoading({ isDark }: { isDark: boolean }) {
  const nodeBg = isDark ? '#AA83DC33' : '#DDE3F4';
  const lineBg = isDark ? '#AA83DC40' : '#C9D2EE';
  const centerBg = isDark ? '#FF4FB966' : '#FF4FB933';

  const lineStyle = {
    bgcolor: lineBg,
    borderRadius: '999px',
    height: '2px',
    opacity: 0.55,
    position: 'absolute',
    transformOrigin: 'left center'
  };
  const nodeStyle = {
    bgcolor: nodeBg,
    border: '2px solid',
    borderColor: isDark ? '#BEAAD833' : '#FFFFFF',
    borderRadius: '999px',
    boxShadow: isDark ? '0 0 18px rgba(170, 131, 220, 0.16)' : '0 8px 24px rgba(120, 130, 180, 0.18)',
    height: '38px',
    opacity: 0.85,
    position: 'absolute',
    width: '38px'
  };

  return (
    <Box sx={{ height: '100%', overflow: 'hidden', position: 'relative', width: '100%' }}>
      <Box sx={{ ...lineStyle, left: '40%', top: '50%', transform: 'rotate(-37deg)', width: '220px' }} />
      <Box sx={{ ...lineStyle, left: '39%', top: '50%', transform: 'rotate(34deg)', width: '185px' }} />
      <Box sx={{ ...lineStyle, left: '39%', top: '50%', transform: 'rotate(146deg)', width: '210px' }} />
      <Box sx={{ ...lineStyle, left: '39%', top: '50%', transform: 'rotate(-142deg)', width: '160px' }} />
      <Box sx={{ ...nodeStyle, left: '22%', top: '29%' }} />
      <Box sx={{ ...nodeStyle, left: '60%', top: '29%' }} />
      <Box sx={{ ...nodeStyle, left: '58%', top: '66%' }} />
      <Box sx={{ ...nodeStyle, left: '21%', top: '66%' }} />
      <Box sx={{ ...nodeStyle, bgcolor: centerBg, borderColor: isDark ? '#EAEBF1' : '#FFFFFF', height: '60px', left: '38%', top: '46%', width: '60px' }} />
    </Box>
  );
}

function AccountInteractions(): React.ReactElement {
  const { t } = useTranslation();
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const graph2DRef = useRef<Graph2DRef | undefined>(undefined);
  const graph3DRef = useRef<Graph3DRef | undefined>(undefined);
  const { ref: graphContainerRef, size } = useElementSize<HTMLDivElement>();
  const account = useAccount(address);
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const [filters, setFilters] = useState<InteractionFilters>({
    direction: 'all',
    status: 'all',
    type: ALL_TYPES
  });
  const [selected, setSelected] = useState<SelectedItem>();
  const [isDetailPanelCollapsed, setIsDetailPanelCollapsed] = useState(false);
  const [fittedGraphKey, setFittedGraphKey] = useState<string>();
  const [graphMode, setGraphMode] = useState<GraphMode>('2d');
  const [is3DFlowReady, setIs3DFlowReady] = useState(false);
  const [historyRange, setHistoryRange] = useState<[number, number]>();
  const [isHistoryRangeTouched, setIsHistoryRangeTouched] = useState(false);
  const [manualPositions, setManualPositions] = useState<Record<string, NodePosition>>({});

  useEffect(() => {
    setHistoryRange(undefined);
    setIsHistoryRangeTouched(false);
    setSelected(undefined);
    setManualPositions({});
  }, [address, genesisHash]);

  const { allHistories, fetchMoreIfAvailable, hasMore, isFetchingMore, isLoading } = useTransactionHistory(
    address,
    genesisHash,
    { governance: true, staking: true, transfers: true },
    { enableInfiniteScroll: false }
  );
  const fetchedHistories = useMemo(() => allHistories ?? [], [allHistories]);

  const historyDateMarks = useMemo(() => Array.from(new Set(
    fetchedHistories
      .map(({ date }) => date)
      .filter((date): date is number => Number.isFinite(date))
  ))
    .sort((a, b) => a - b)
    .map((value) => ({ value }))
  , [fetchedHistories]);
  const historyRangeMin = historyDateMarks[0]?.value;
  const historyRangeMax = historyDateMarks[historyDateMarks.length - 1]?.value;
  const canUseHistoryRange = historyDateMarks.length >= MIN_HISTORY_RANGE_ITEMS && historyRangeMin !== undefined && historyRangeMax !== undefined && historyRangeMin < historyRangeMax;

  useEffect(() => {
    if (!canUseHistoryRange || historyRangeMin === undefined || historyRangeMax === undefined) {
      setHistoryRange(undefined);
      setIsHistoryRangeTouched(false);

      return;
    }

    setHistoryRange((prev) => {
      const next: [number, number] = !prev || !isHistoryRangeTouched
        ? [historyRangeMin, historyRangeMax]
        : [
          Math.max(historyRangeMin, Math.min(prev[0], historyRangeMax)),
          Math.min(historyRangeMax, Math.max(prev[1], historyRangeMin))
        ];

      if (next[0] > next[1]) {
        return [historyRangeMin, historyRangeMax];
      }

      return prev?.[0] === next[0] && prev?.[1] === next[1] ? prev : next;
    });
  }, [canUseHistoryRange, historyRangeMax, historyRangeMin, isHistoryRangeTouched]);

  const rangeFilteredHistories = useMemo(() => {
    if (!canUseHistoryRange || !historyRange) {
      return fetchedHistories;
    }

    const [start, end] = historyRange;

    return fetchedHistories.filter(({ date }) => date >= start && date <= end);
  }, [canUseHistoryRange, fetchedHistories, historyRange]);
  const typeOptions = useMemo(() => getInteractionTypes(fetchedHistories), [fetchedHistories]);
  const interactionValue = useMemo<InteractionFilterValue>(() =>
    filters.direction !== 'all'
      ? `direction:${filters.direction}`
      : filters.type === ALL_TYPES
        ? 'direction:all'
        : `type:${filters.type}`
  , [filters.direction, filters.type]);
  const interactionOptions = useMemo<AdvancedDropdownOption[]>(() => [
    { text: t('All interactions'), value: 'direction:all' },
    ...DIRECTION_OPTIONS
      .filter((direction) => direction !== 'all')
      .map((direction) => ({
        text: formatOption(direction),
        value: `direction:${direction}`
      })),
    ...typeOptions
      .filter((type) => type !== ALL_TYPES)
      .map((type) => ({
        text: formatOption(type),
        value: `type:${type}`
      }))
  ], [t, typeOptions]);
  const statusOptions = useMemo<AdvancedDropdownOption[]>(() => STATUS_OPTIONS.map((status) => ({
    text: formatOption(status),
    value: status
  })), []);
  const graph = useMemo(() => buildInteractionGraph(rangeFilteredHistories, address, filters), [address, filters, rangeFilteredHistories]);
  const graphStatsText = useMemo(() => t('{{nodes}} addresses, {{links}} connections', {
    replace: { links: graph.links.length, nodes: Math.max(0, graph.nodes.length - 1) }
  }), [graph.links.length, graph.nodes.length, t]);
  const historyRangeLabel = useMemo(() => {
    if (!historyRange) {
      return '';
    }

    const [start, end] = historyRange;
    const startDate = formatTimestamp(start, ['month', 'day', 'year']);
    const endDate = formatTimestamp(end, ['month', 'day', 'year']);

    return startDate === endDate
      ? `${startDate}, ${formatTimestamp(start, ['hours', 'minutes', 'ampm'])} - ${formatTimestamp(end, ['hours', 'minutes', 'ampm'])}`
      : `${startDate} - ${endDate}`;
  }, [historyRange]);
  const validatorsById = useMemo(() => {
    const validators = [
      ...(validatorsInfo?.validatorsInformation.elected ?? []),
      ...(validatorsInfo?.validatorsInformation.waiting ?? [])
    ];

    return validators.reduce<Map<string, string | undefined>>((map, validator) => {
      const id = normalizeAddress(validator.accountId?.toString());

      if (id) {
        map.set(id, validator.identity?.displayParent ?? validator.identity?.display ?? undefined);
      }

      return map;
    }, new Map());
  }, [validatorsInfo?.validatorsInformation.elected, validatorsInfo?.validatorsInformation.waiting]);
  const singleLinkDistance = useMemo(() => Math.min(170, Math.max(120, size.width * 0.18)), [size.width]);
  const graphData = useMemo(() => ({
    links: graph.links,
    nodes: graph.nodes.map((node) => {
      const validatorName = validatorsById.get(node.id);
      const validatorFields = validatorsById.has(node.id)
        ? { isValidator: true, validatorName }
        : {};
      const nodeWithMetadata = node.isCenter
        ? { ...node, ...validatorFields, label: account?.name || node.label, name: account?.name }
        : { ...node, ...validatorFields };
      const manualPosition = manualPositions[node.id];

      if (manualPosition) {
        return { ...nodeWithMetadata, fx: manualPosition.x, fy: manualPosition.y, fz: manualPosition.z ?? 0, x: manualPosition.x, y: manualPosition.y, z: manualPosition.z ?? 0 };
      }

      if (!node.isCenter && graph.links.length === 1) {
        return { ...nodeWithMetadata, fx: singleLinkDistance, fy: 0, fz: 0, x: singleLinkDistance, y: 0, z: 0 };
      }

      return node.isCenter
        ? { ...nodeWithMetadata, fx: 0, fy: 0, fz: 0, x: 0, y: 0, z: 0 }
        : nodeWithMetadata;
    })
  }), [account?.name, graph, manualPositions, singleLinkDistance, validatorsById]);
  const graphLayoutKey = useMemo(() => [
    address ?? '',
    genesisHash ?? '',
    filters.direction,
    filters.status,
    filters.type,
    graphMode,
    graph.nodes.map(({ id }) => id).join('|'),
    graph.links.map(({ id }) => id).join('|'),
    size.width,
    size.height
  ].join(':'), [address, filters.direction, filters.status, filters.type, genesisHash, graph.links, graph.nodes, graphMode, size.height, size.width]);
  const isGraphFitted = fittedGraphKey === graphLayoutKey;
  const graphNodeCount = graph.nodes.length;
  const getActiveGraph = useCallback(() => graphMode === '3d' ? graph3DRef.current : graph2DRef.current, [graphMode]);
  const fitActiveGraph = useCallback((transitionDuration = 0) => {
    if (graphMode === '3d') {
      fit3DGraph(graph3DRef.current, size, graphNodeCount, transitionDuration);

      return;
    }

    graph2DRef.current?.zoomToFit(transitionDuration, graph.links.length === 1 ? 90 : 60);
  }, [graph.links.length, graphMode, graphNodeCount, size]);

  useEffect(() => {
    const graphInstance = getActiveGraph();
    const chargeForce = graphInstance?.d3Force('charge') as ChargeForce | undefined;
    const collisionForce = graphInstance?.d3Force('collide') as CollisionForce | undefined;
    const linkForce = graphInstance?.d3Force('link') as LinkForce | undefined;
    const baseDistance = graph.links.length <= 1 ? singleLinkDistance : 110;

    chargeForce?.strength?.(-220);
    collisionForce?.radius?.((node) => nodeRadius(node) + 24);
    linkForce?.distance?.((link) => baseDistance + Math.min(120, link.txCount * 7));

    if (graphMode === '2d') {
      graphInstance?.d3ReheatSimulation();
    }
  }, [getActiveGraph, graph.links.length, graphData, graphMode, singleLinkDistance]);

  useEffect(() => {
    if (isLoading || graph.links.length === 0 || size.height === 0 || size.width === 0 || (graphMode === '3d' && !is3DFlowReady)) {
      return;
    }

    const revealGraph = () => {
      fitActiveGraph();
      setFittedGraphKey(graphLayoutKey);
    };

    const animationFrame = requestAnimationFrame(() => fitActiveGraph());
    const timeout = setTimeout(revealGraph, 250);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeout);
    };
  }, [fitActiveGraph, graph.links.length, graphLayoutKey, graphMode, is3DFlowReady, isLoading, size.height, size.width]);

  useEffect(() => {
    if (graphMode !== '3d' || isLoading || graph.links.length === 0 || size.height === 0 || size.width === 0) {
      setIs3DFlowReady(false);

      return;
    }

    setIs3DFlowReady(false);

    const timeout = setTimeout(() => setIs3DFlowReady(true), 220);

    return () => clearTimeout(timeout);
  }, [graph.links.length, graphLayoutKey, graphMode, isLoading, size.height, size.width]);

  useEffect(() => {
    if (graphMode !== '3d' || !is3DFlowReady) {
      return;
    }

    const timeout = setTimeout(() => graph3DRef.current?.d3ReheatSimulation(), 40);

    return () => clearTimeout(timeout);
  }, [graphLayoutKey, graphMode, is3DFlowReady]);

  useEffect(() => {
    if (graphMode !== '3d' || !graph3DRef.current) {
      return;
    }

    const ambientLight = new THREE.AmbientLight('#FFFFFF', isDark ? 1.35 : 1.65);
    const keyLight = new THREE.DirectionalLight('#FFFFFF', isDark ? 1.05 : 0.95);
    const accentLight = new THREE.PointLight('#AA83DC', isDark ? 1.4 : 0.75, 700);

    keyLight.position.set(-180, -120, 260);
    accentLight.position.set(160, 120, 220);
    graph3DRef.current.lights([ambientLight, keyLight, accentLight]);
  }, [graphMode, isDark, is3DFlowReady]);

  const onBack = useCallback(() => {
    Promise.resolve(navigate(-1)).catch(console.error);
  }, [navigate]);
  const resetLayout = useCallback(() => {
    setManualPositions({});

    if (graphMode === '2d' || is3DFlowReady) {
      getActiveGraph()?.d3ReheatSimulation();
    }
  }, [getActiveGraph, graphMode, is3DFlowReady]);
  const zoomToFit = useCallback(() => {
    fitActiveGraph(450);
  }, [fitActiveGraph]);
  const loadMore = useCallback(() => {
    fetchMoreIfAvailable().catch(console.error);
  }, [fetchMoreIfAvailable]);
  const clearSelected = useCallback(() => {
    setSelected(undefined);
  }, []);
  const toggleDetailPanel = useCallback(() => {
    setIsDetailPanelCollapsed((isCollapsed) => !isCollapsed);
  }, []);

  const updateInteraction = useCallback((value: InteractionFilterValue) => {
    const [kind, selectedValue] = value.split(':');

    setFilters((prev) => kind === 'direction'
      ? { ...prev, direction: selectedValue as DirectionFilter, type: ALL_TYPES }
      : { ...prev, direction: 'all', type: selectedValue });
  }, []);
  const updateGraphMode = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const mode = event.currentTarget.dataset['mode'] as GraphMode | undefined;

    if (mode) {
      setGraphMode(mode);
    }
  }, []);
  const updateHistoryRange = useCallback((_: Event, value: number | number[]) => {
    if (!Array.isArray(value) || value.length < 2) {
      return;
    }

    const next: [number, number] = [value[0], value[1]];

    setIsHistoryRangeTouched(true);
    setHistoryRange((prev) => prev?.[0] === next[0] && prev?.[1] === next[1] ? prev : next);
    setSelected(undefined);
    setManualPositions({});
  }, []);
  const updateStatus = useCallback((status: StatusFilter) => setFilters((prev) => ({ ...prev, status })), []);

  const onNodeClick = useCallback((node: GraphNode) => {
    if (node.isCenter) {
      setSelected({ item: node, type: 'node' });

      return;
    }

    const link = graph.links.find(({ counterparty }) => counterparty === node.id) as GraphLink | undefined;

    setSelected(link ? { item: link, node, type: 'link' } : { item: node, type: 'node' });
  }, [graph.links]);
  const onLinkClick = useCallback((link: GraphLink) => {
    const node = graphData.nodes.find(({ id }) => id === link.counterparty) as GraphNode | undefined;

    setSelected({ item: link, node, type: 'link' });
  }, [graphData.nodes]);
  const onNodeDragEnd = useCallback((node: GraphNode) => {
    node.fx = node.x;
    node.fy = node.y;
    node.fz = node.z ?? 0;

    setManualPositions((prev) => {
      const next = { ...prev };

      graphData.nodes.forEach((graphNode) => {
        const positionedNode = graphNode as GraphNode;

        if (positionedNode.x !== undefined && positionedNode.y !== undefined) {
          next[positionedNode.id] = { x: positionedNode.x, y: positionedNode.y, z: positionedNode.z };
        }
      });

      if (node.x !== undefined && node.y !== undefined) {
        next[node.id] = { x: node.x, y: node.y, z: node.z };
      }

      return next;
    });
  }, [graphData.nodes]);
  const selectedNodeId = selected?.type === 'node' ? selected.item.id : selected?.node?.id ?? selected?.item.counterparty;
  const selectedLinkId = selected?.type === 'link' ? selected.item.id : undefined;
  const get3DNodeColor = useCallback((node: GraphNode) => node.id === selectedNodeId ? isDark ? '#FFD166' : '#674394' : nodeColor(node, isDark), [isDark, selectedNodeId]);
  const get3DNodeObject = useCallback((node: GraphNode) => create3DNode(node, isDark, selectedNodeId), [isDark, selectedNodeId]);
  const get3DNodeValue = useCallback((node: GraphNode) => node.isCenter ? 18 : Math.max(6, node.txCount * 2), []);
  const get3DLinkParticles = useCallback((link: GraphLink) => link.direction === 'mixed' ? 0 : link.id === selectedLinkId ? 3 : Math.min(2, Math.ceil(link.txCount / 6)), [selectedLinkId]);
  const get3DLinkWidth = useCallback((link: GraphLink) => link.id === selectedLinkId ? Math.min(5.2, 1.9 + Math.sqrt(link.txCount)) : Math.min(4.4, 0.9 + Math.sqrt(link.txCount) * 0.85), [selectedLinkId]);
  const get3DLinkColor = useCallback((link: GraphLink) => link.id === selectedLinkId ? '#FFD166' : linkColor3D(link.direction, isDark), [isDark, selectedLinkId]);
  const getLinkColor = useCallback((link: GraphLink) => link.id === selectedLinkId ? '#FFD166' : linkColor(link.direction, isDark), [isDark, selectedLinkId]);
  const getLinkArrowLength = useCallback((link: GraphLink) => link.direction === 'mixed' ? 0 : 4, []);
  const getLinkParticles = useCallback((link: GraphLink) => link.direction === 'mixed' ? 0 : link.id === selectedLinkId ? Math.max(3, Math.min(6, Math.ceil(link.txCount / 2))) : Math.min(3, Math.ceil(link.txCount / 4)), [selectedLinkId]);
  const getLinkLabel = useCallback((link: GraphLink) => `${formatOption(link.direction)} - ${link.txCount} ${t('transactions')}`, [t]);
  const getLinkWidth = useCallback((link: GraphLink) => link.id === selectedLinkId ? Math.min(10, 3 + Math.sqrt(link.txCount)) : Math.min(8, 1 + Math.sqrt(link.txCount)), [selectedLinkId]);
  const getNodeLabel = useCallback((node: GraphNode) => `${node.label} - ${node.txCount} ${t('transactions')}`, [t]);
  const renderNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => drawNode(node, ctx, globalScale, isDark, selectedNodeId), [isDark, selectedNodeId]);
  const showPointerCursor = useCallback((item: GraphNode | GraphLink | undefined) => Boolean(item), []);
  const graphEmpty = !isLoading && graph.links.length === 0;
  const graphSizeReady = size.height > 0 && size.width > 0;
  const detailPanelWidth = isDetailPanelCollapsed ? DETAIL_PANEL_COLLAPSED_WIDTH : DETAIL_PANEL_WIDTH;

  return (
    <HomeLayout childrenStyle={{ width: '100%' }}>
      <Stack direction='column' sx={{ boxSizing: 'border-box', height: 'calc(100vh - 96px)', minHeight: '650px', px: '22px', rowGap: '10px', width: '100%' }}>
        <Stack alignItems='center' direction='row' justifyContent='space-between'>
          <Stack alignItems='center' direction='row' gap='12px'>
            <IconButton onClick={onBack} sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', borderRadius: '12px' }}>
              <ArrowLeft2 color={isDark ? '#AA83DC' : '#674394'} size='20' />
            </IconButton>
            <Stack>
              <Typography color='text.primary' sx={{ textTransform: 'uppercase' }} variant='H-2'>
                {t('Interaction Explorer')}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction='row' gap='8px'>
            {hasMore && !isFetchingMore &&
              <Button
                onClick={loadMore}
                sx={{
                  bgcolor: isDark ? '#1B133C' : '#674394',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  textTransform: 'none'
                }}
                variant='contained'
              >
                {t('Load more')}
              </Button>
            }
          </Stack>
        </Stack>
        <VelvetBox childrenStyle={{ height: '100%' }} style={{ flex: 1, height: 'calc(100% - 48px)', minHeight: 0, width: '100%' }}>
          <Grid container item sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', border: '1px solid', borderColor: isDark ? '#1B133C' : '#DDE3F4', borderRadius: '14px', height: '100%', overflow: 'hidden' }}>
            <Grid item sx={{ borderBottom: '1px solid', borderColor: isDark ? '#1B133C' : '#DDE3F4', height: '58px', px: '14px', width: '100%' }}>
              <Stack alignItems='center' direction='row' gap='14px' justifyContent='space-between' sx={{ height: '100%' }}>
                <Stack alignItems='center' direction='row' gap='14px'>
                  <TopFilterSelect label={t('Interaction')} onChange={updateInteraction} options={interactionOptions} value={interactionValue} width={220} />
                  <TopFilterSelect label={t('Status')} onChange={updateStatus} options={statusOptions} value={filters.status} width={150} />
                </Stack>
                {(isLoading || isFetchingMore) &&
                  <Stack alignItems='center' justifyContent='center' sx={{ height: '24px', minWidth: '58px' }}>
                    <BeatLoader color={isDark ? '#BEAAD8' : '#674394'} loading margin={2} size={7} />
                  </Stack>
                }
                {!isLoading && !isFetchingMore && canUseHistoryRange && historyRange && historyRangeMin !== undefined && historyRangeMax !== undefined &&
                  <Stack direction='column' rowGap='2px' sx={{ flexShrink: 0, width: 'clamp(240px, 28vw, 360px)' }}>
                    <Typography color='text.secondary' noWrap sx={{ textAlign: 'right' }} variant='B-5'>
                      {historyRangeLabel}
                    </Typography>
                    <Slider
                      disableSwap
                      marks={historyDateMarks}
                      max={historyRangeMax}
                      min={historyRangeMin}
                      onChange={updateHistoryRange}
                      size='small'
                      step={null}
                      sx={{
                        '& .MuiSlider-mark': {
                          display: 'none'
                        },
                        '& .MuiSlider-rail': {
                          bgcolor: isDark ? '#2D1E4A' : '#DDE3F4',
                          opacity: 1
                        },
                        '& .MuiSlider-thumb': {
                          bgcolor: isDark ? '#AA83DC' : '#674394',
                          border: '2px solid',
                          borderColor: isDark ? '#EAEBF1' : '#FFFFFF',
                          boxShadow: isDark ? '0 0 0 5px rgba(170, 131, 220, 0.16)' : '0 4px 12px rgba(103, 67, 148, 0.22)',
                          height: 14,
                          width: 14
                        },
                        '& .MuiSlider-track': {
                          bgcolor: isDark ? '#AA83DC' : '#674394'
                        },
                        color: isDark ? '#AA83DC' : '#674394',
                        height: 4,
                        m: 0,
                        p: '5px 0'
                      }}
                      value={historyRange}
                    />
                  </Stack>
                }
              </Stack>
            </Grid>
            <Grid item ref={graphContainerRef} sx={{ height: 'calc(100% - 58px)', position: 'relative', transition: 'width 180ms ease', width: `calc(100% - ${detailPanelWidth}px)` }}>
              <Stack direction='row' gap='8px' sx={{ position: 'absolute', right: '12px', top: '12px', zIndex: 2 }}>
                <Stack direction='row' sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', borderRadius: '12px', p: '3px' }}>
                  {GRAPH_MODES.map((mode) => (
                    <Button
                      data-mode={mode}
                      key={mode}
                      onClick={updateGraphMode}
                      sx={{
                        bgcolor: graphMode === mode ? isDark ? '#674394' : '#FFFFFF' : 'transparent',
                        borderRadius: '9px',
                        color: graphMode === mode ? isDark ? '#FFFFFF' : '#674394' : isDark ? '#AA83DC' : '#674394',
                        minWidth: '42px',
                        px: '9px',
                        py: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {mode}
                    </Button>
                  ))}
                </Stack>
                <IconButton onClick={resetLayout} sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', borderRadius: '12px' }}>
                  <Refresh2 color={isDark ? '#AA83DC' : '#674394'} size='20' />
                </IconButton>
                <IconButton onClick={zoomToFit} sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', borderRadius: '12px' }}>
                  <Maximize4 color={isDark ? '#AA83DC' : '#674394'} size='20' />
                </IconButton>
              </Stack>
              {(isLoading || (!graphSizeReady && !graphEmpty)) &&
                <GraphLoading isDark={isDark} />
              }
              {graphEmpty &&
                <EmptyListBox
                  style={{ height: '100%', paddingLeft: '30px', paddingRight: '30px' }}
                  text={genesisHash ? t('No transaction relationships are available for this account on the selected chain.') : t('Select a chain to view interactions.')}
                />
              }
              {!isLoading && !graphEmpty && graphSizeReady &&
                <Box sx={{ height: '100%', opacity: isGraphFitted ? 1 : 0, width: '100%' }}>
                  {graphMode === '2d'
                    ? (
                      <ForceGraph2D<InteractionNode, InteractionLink>
                        autoPauseRedraw={false}
                        backgroundColor={isDark ? '#05091C' : '#FFFFFF'}
                        cooldownTicks={120}
                        enableNodeDrag
                        graphData={graphData}
                        height={size.height}
                        linkColor={getLinkColor}
                        linkDirectionalArrowLength={getLinkArrowLength}
                        linkDirectionalArrowRelPos={0.86}
                        linkDirectionalParticleSpeed={0.004}
                        linkDirectionalParticles={getLinkParticles}
                        linkLabel={getLinkLabel}
                        linkWidth={getLinkWidth}
                        nodeCanvasObject={renderNode}
                        nodeLabel={getNodeLabel}
                        onBackgroundClick={clearSelected}
                        onLinkClick={onLinkClick}
                        onNodeClick={onNodeClick}
                        onNodeDragEnd={onNodeDragEnd}
                        ref={graph2DRef}
                        showPointerCursor={showPointerCursor}
                        width={size.width}
                      />
                    )
                    : (
                      <ForceGraph3D<InteractionNode, InteractionLink>
                        backgroundColor={isDark ? '#05091C' : '#FFFFFF'}
                        controlType='orbit'
                        cooldownTicks={is3DFlowReady ? 120 : 0}
                        d3VelocityDecay={0.38}
                        enableNodeDrag
                        graphData={graphData}
                        height={size.height}
                        linkColor={get3DLinkColor}
                        linkDirectionalArrowLength={getLinkArrowLength}
                        linkDirectionalArrowRelPos={0.86}
                        linkDirectionalParticleSpeed={0.004}
                        linkDirectionalParticleWidth={2.8}
                        linkDirectionalParticles={get3DLinkParticles}
                        linkLabel={getLinkLabel}
                        linkOpacity={0.88}
                        linkWidth={get3DLinkWidth}
                        nodeColor={get3DNodeColor}
                        nodeLabel={getNodeLabel}
                        nodeOpacity={0.96}
                        nodeRelSize={4}
                        nodeResolution={28}
                        nodeThreeObject={get3DNodeObject}
                        nodeVal={get3DNodeValue}
                        onBackgroundClick={clearSelected}
                        onLinkClick={onLinkClick}
                        onNodeClick={onNodeClick}
                        onNodeDragEnd={onNodeDragEnd}
                        ref={graph3DRef}
                        showNavInfo={false}
                        showPointerCursor={showPointerCursor}
                        warmupTicks={80}
                        width={size.width}
                      />
                    )
                  }
                </Box>
              }
            </Grid>
            <Grid item sx={{ height: 'calc(100% - 58px)', overflow: 'hidden', position: 'relative', transition: 'width 180ms ease', width: `${detailPanelWidth}px` }}>
              <Box sx={{ background: isDark ? 'linear-gradient(0deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)' : 'linear-gradient(0deg, rgba(221, 227, 244, 0.2) 0%, rgba(221, 227, 244, 1) 50.06%, rgba(221, 227, 244, 0.2) 100%)', height: '100%', left: 0, position: 'absolute', top: 0, width: '1px' }} />
              <IconButton onClick={toggleDetailPanel} sx={{ bgcolor: isDark ? '#1B133C' : '#F3F5FD', borderRadius: '12px', left: '8px', position: 'absolute', top: '8px', transform: isDetailPanelCollapsed ? 'none' : 'rotate(180deg)', zIndex: 2 }}>
                <ArrowLeft2 color={isDark ? '#AA83DC' : '#674394'} size='18' />
              </IconButton>
              {!isDetailPanelCollapsed && selected &&
                <IconButton onClick={clearSelected} sx={{ position: 'absolute', right: '8px', top: '8px', zIndex: 2 }}>
                  <CloseCircle color={isDark ? '#AA83DC' : '#674394'} size='20' />
                </IconButton>
              }
              {!isDetailPanelCollapsed &&
                <DetailPanel selected={selected} />
              }
              {!isDetailPanelCollapsed && !isLoading && !isFetchingMore && graph.links.length > 0 &&
                <Stack alignItems='center' justifyContent='center' sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', bottom: 0, height: '36px', left: '1px', position: 'absolute', right: 0, zIndex: 1 }}>
                  <Typography color='text.secondary' noWrap variant='B-5'>
                    {graphStatsText}
                  </Typography>
                </Stack>
              }
            </Grid>
          </Grid>
        </VelvetBox>
      </Stack>
    </HomeLayout>
  );
}

export default memo(AccountInteractions);
