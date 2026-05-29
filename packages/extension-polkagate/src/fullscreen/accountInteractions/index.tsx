// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AdvancedDropdownOption } from '../../util/types';
import type { DirectionFilter, InteractionFilters, InteractionLink, InteractionNode, StatusFilter } from './buildInteractionGraph';
import type { ChargeForce, CollisionForce, Graph2DRef, Graph3DRef, GraphLink, GraphMode, GraphNode, InteractionFilterValue, LinkForce, NodePosition, SelectedItem } from './types';

import { Box, Button, Grid, IconButton, Slider, Stack, Typography, useTheme } from '@mui/material';
import { ArrowLeft2, CloseCircle, Maximize4, Refresh2 } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import { useNavigate, useParams } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';

import useTransactionHistory from '@polkadot/extension-polkagate/src/popup/history/useTransactionHistory';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style';

import { useAccount, useTranslation, useValidatorsInformation } from '../../hooks';
import { EmptyListBox } from '../components';
import HomeLayout from '../components/layout';
import DetailPanel from './components/DetailPanel';
import GraphLoading from './components/GraphLoading';
import TopFilterSelect from './components/TopFilterSelect';
import { drawNode } from './graph/render2d';
import { create3DNode, fit3DGraph, set3DGraphLights } from './graph/render3d';
import useElementSize from './hooks/useElementSize';
import useHistoryRange from './hooks/useHistoryRange';
import { buildInteractionGraph, getInteractionTypes, normalizeAddress } from './buildInteractionGraph';
import { ALL_TYPES, DETAIL_PANEL_COLLAPSED_WIDTH, DETAIL_PANEL_WIDTH, DIRECTION_OPTIONS, GRAPH_MODES, STATUS_OPTIONS } from './constants';
import { formatOption, linkColor, linkColor3D, nodeColor, nodeRadius } from './utils';

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
  const [manualPositions, setManualPositions] = useState<Record<string, NodePosition>>({});

  const { allHistories, fetchMoreIfAvailable, hasMore, isFetchingMore, isLoading } = useTransactionHistory(
    address,
    genesisHash,
    { governance: true, staking: true, transfers: true },
    { enableInfiniteScroll: false }
  );
  const { canUseHistoryRange, fetchedHistories, historyDateMarks, historyRange, historyRangeLabel, historyRangeMax, historyRangeMin, rangeFilteredHistories, resetHistoryRange, updateHistoryRange } = useHistoryRange(allHistories);

  useEffect(() => {
    resetHistoryRange();
    setSelected(undefined);
    setManualPositions({});
  }, [address, genesisHash, resetHistoryRange]);

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
    if (graphMode !== '3d') {
      return;
    }

    set3DGraphLights(graph3DRef.current, isDark);
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
  const onHistoryRangeChange = useCallback((_: Event, value: number | number[]) => {
    if (!Array.isArray(value) || value.length < 2) {
      return;
    }

    updateHistoryRange(value);
    setSelected(undefined);
    setManualPositions({});
  }, [updateHistoryRange]);
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
                      onChange={onHistoryRangeChange}
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
