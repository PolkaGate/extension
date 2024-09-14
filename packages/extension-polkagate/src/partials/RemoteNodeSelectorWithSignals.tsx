// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { SignalCellular0BarOutlined as LightClientEndpointIcon, SignalCellularAlt as SignalCellularIcon, SignalCellularAlt1Bar as SignalCellularAlt1BarIcon, SignalCellularAlt2Bar as SignalCellularAlt2BarIcon } from '@mui/icons-material';
import { Grid, Popover, Skeleton, Typography, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import EndpointManager from '../class/endpointManager';
import { useEndpoint, useEndpoints, useInfo } from '../hooks';
import useIsExtensionPopup from '../hooks/useIsExtensionPopup';
import CalculateNodeDelay from '../util/calculateNodeDelay';
import { AUTO_MODE } from '../util/constants';

interface Props {
  address: string | undefined;
  iconSize?: number;
}

interface ApiDelay {
  api: ApiPromise | null | undefined;
  delay: number | undefined;
}

type EndpointsDelay = { name: string, delay: number | null | undefined, value: string }[];

const DELAY_CHECK_INTERVAL = 30000;
const SIGNAL_COLORS = {
  green: '#1F7720',
  orange: '#FF5722',
  red: '#C70000'
};

const endpointManager = new EndpointManager();

const NodeStatusIcon = ({ defaultColor, iconSize = 35, ms, position }: { defaultColor: string, ms: number | null | undefined, iconSize?: number, position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky' | 'unset'}) => {
  return (
    <Grid container height='35px' item position= {position || 'relative'} width='40px'>
      {ms === undefined || ms === null
        ? <SignalCellularIcon
          sx={{ bottom: '2px', color: defaultColor, fontSize: `${iconSize}px`, left: '2px', position: 'absolute' }}
        />
        : ms <= 100
          ? <SignalCellularIcon
            sx={{ bottom: '2px', color: SIGNAL_COLORS.green, fontSize: `${iconSize}px`, left: '2px', position: 'absolute' }}
          />
          : ms <= 300
            ? <SignalCellularAlt2BarIcon
              sx={{ bottom: '2px', color: SIGNAL_COLORS.orange, fontSize: `${iconSize}px`, left: '2px', position: 'absolute' }}
            />
            : <SignalCellularAlt1BarIcon
              sx={{ bottom: '2px', color: SIGNAL_COLORS.red, fontSize: `${iconSize}px`, left: '2px', position: 'absolute' }}
            />
      }
    </Grid>
  );
};

const NodeStatusAndDelay = ({ defaultColor, endpointDelay, isSelected = false }: { defaultColor: string, endpointDelay: number | null | undefined, isSelected?: boolean }) => {
  const statusColor = useCallback((ms: number) => (
    ms <= 100
      ? SIGNAL_COLORS.green
      : ms <= 300
        ? SIGNAL_COLORS.orange
        : SIGNAL_COLORS.red
  ), []);

  return (
    <Grid alignItems='center' container item sx={{ width: 'fit-content' }}>
      {<Typography color={endpointDelay ? statusColor(endpointDelay) : 'inherit'} fontSize='16px' fontWeight={isSelected ? 500 : 400} pr='10px'>
        {endpointDelay
          ? `${endpointDelay} ms`
          : (endpointDelay === undefined || isSelected)
            ? <Skeleton
              animation='wave'
              height='20px'
              variant='rounded'
              width='55px'
            />
            : ''}
      </Typography>}
      <NodeStatusIcon
        defaultColor={defaultColor}
        ms={endpointDelay}
      />
    </Grid>
  );
};

interface NodesListProps {
  defaultColor: string;
  setEndpointsDelay: React.Dispatch<React.SetStateAction<EndpointsDelay | undefined>>;
  endpointsDelay: EndpointsDelay | undefined, setCurrentDelay: React.Dispatch<React.SetStateAction<number | undefined>>;
  currentDelay: number | undefined;
  address?: string, calculateAndSetDelay: () => void;
  fetchedApiDelay: ApiDelay | undefined;
}

const NodesList = ({ address, calculateAndSetDelay, currentDelay, defaultColor, endpointsDelay, fetchedApiDelay, setCurrentDelay, setEndpointsDelay }: NodesListProps) => {
  const theme = useTheme();

  const { genesisHash } = useInfo(address);
  const endpointOptions = useEndpoints(genesisHash);
  const { endpoint: endpointUrl, isOnManual } = useEndpoint(address);

  const [api, setApi] = useState<ApiPromise | null | undefined>(null);

  // Calculate initial delay when the component mounts
  useEffect(() => {
    if ((api && currentDelay === undefined) || api === null) {
      calculateAndSetDelay();
    }
  }, [api, calculateAndSetDelay, currentDelay]);

  // Set up the interval when the component mounts
  useEffect(() => {
    const intervalId = setInterval(calculateAndSetDelay, DELAY_CHECK_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [calculateAndSetDelay]);

  useEffect(() => {
    // @ts-ignore
    if (fetchedApiDelay?.api && fetchedApiDelay.api?._options?.provider?.endpoint === endpointUrl) {
      setApi(fetchedApiDelay.api);
      setCurrentDelay(fetchedApiDelay.delay);
    }
  }, [endpointUrl, fetchedApiDelay, setCurrentDelay]);

  const sanitizedCurrentEndpointName = useMemo(() => {
    const currentEndpointName = endpointOptions.find((endpoint) => endpoint.value === endpointUrl)?.text;

    return currentEndpointName?.replace(/^via\s/, '');
  }, [endpointOptions, endpointUrl]);

  useEffect(() => {
    if (!endpointOptions || endpointOptions.length === 0) {
      return;
    }

    const mappedEndpoints = endpointOptions.map((endpoint) => ({ delay: null, name: endpoint.text.replace(/^via\s/, ''), value: endpoint.value as string }));

    setCurrentDelay(undefined);
    setEndpointsDelay(mappedEndpoints as EndpointsDelay);
  }, [endpointOptions, setCurrentDelay, setEndpointsDelay]);

  const onChangeEndpoint = useCallback((newEndpoint: string): void => {
    if (!address || !genesisHash) {
      return;
    }

    setCurrentDelay(undefined);

    setEndpointsDelay((prevEndpoints) => {
      return prevEndpoints?.map((endpoint) => {
        if (endpoint.value === newEndpoint && !endpoint.delay) {
          return { ...endpoint, delay: undefined };
        }

        return endpoint;
      });
    });

    const addressKey = String(address);
    const checkForNewOne = newEndpoint === AUTO_MODE.value && !endpointManager.getEndpoint(addressKey, genesisHash)?.isOnManual;

    endpointManager.setEndpoint(addressKey, genesisHash, {
      checkForNewOne,
      endpoint: newEndpoint,
      isOnManual: newEndpoint !== AUTO_MODE.value,
      timestamp: Date.now()
    });
  }, [address, genesisHash, setCurrentDelay, setEndpointsDelay]);

  return (
    <Grid container direction='column' item sx={{ display: 'block', minWidth: '275px', py: '6px', width: 'fit-content' }}>
      {endpointsDelay && endpointsDelay.length > 0 &&
      endpointsDelay.map((endpoint, index) => {
        const selectedEndpoint = endpoint.name === sanitizedCurrentEndpointName;
        const isLightClient = endpoint.name.includes('light client');
        const isOnAutoMode = endpoint.name === AUTO_MODE.text && !isOnManual;

        return (
          // eslint-disable-next-line react/jsx-no-bind
          <Grid alignItems='center' container item justifyContent='space-between' key={index} onClick={() => onChangeEndpoint(endpoint.value)} py='5px' sx={{ ':hover': { bgcolor: 'rgba(186, 40, 130, 0.1)' }, bgcolor: (selectedEndpoint && isOnManual) || isOnAutoMode ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: 'pointer', my: '3px', pl: '15px', position: 'relative', pr: '5px', width: '100%' }}>
            {selectedEndpoint && endpoint.name !== AUTO_MODE.text && !isOnManual &&
             <span style={{ backgroundColor: '#00FF00', border: `1px solid ${theme.palette.background.default}`, borderRadius: '50%', height: '10px', left: '2px', position: 'absolute', top: '50%px', width: '10px' }} />
            }
            <Typography fontSize='16px' fontWeight={selectedEndpoint || isOnAutoMode ? 500 : 400} textAlign='left' width={isLightClient ? '100%' : '53%'}>
              {endpoint.name}
            </Typography>
            {
              !isLightClient && endpoint.name !== AUTO_MODE.text &&
              <NodeStatusAndDelay
                defaultColor = {defaultColor}
                endpointDelay={endpoint.delay}
                isSelected={selectedEndpoint}
              />
            }
            {isOnAutoMode && selectedEndpoint &&
              <Circle
                color={theme.palette.primary.main}
                scaleEnd={0.7}
                scaleStart={0.4}
                size={22}
              />
            }
          </Grid>
        );
      })}
    </Grid>
  );
};

interface ListIndicatorProps {
  currentDelay: number | undefined;
  iconSize: number;
  id: 'simple-popover' | undefined;
  endpointUrl: string | undefined;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  defaultColor: string;
}

const ListIndicator = ({ currentDelay, defaultColor, endpointUrl, iconSize, id, onClick }: ListIndicatorProps) => {
  const isLightClient = endpointUrl?.startsWith('light');
  const onExtension = useIsExtensionPopup();

  const bgcolorOnAccountDetail: string = useMemo(() => {
    if (onExtension) {
      return 'background.paper';
    } else {
      return 'transparent';
    }
  }, [onExtension]);

  return (
    <Grid aria-describedby={id} component='button' container item onClick={onClick} sx={{ bgcolor: bgcolorOnAccountDetail, border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', cursor: 'pointer', height: `${iconSize + 7}px`, position: 'relative', width: `${iconSize + 7}px`, zIndex: 10 }}>
      {isLightClient
        ? <LightClientEndpointIcon sx={{ bottom: '2px', color: SIGNAL_COLORS.orange, fontSize: `${iconSize}px`, left: '2px', position: 'absolute' }} />
        : <NodeStatusIcon
          defaultColor={defaultColor}
          iconSize={iconSize}
          ms={currentDelay}
          position='unset'
        />
      }
    </Grid>
  );
};

function RemoteNodeSelectorWithSignals ({ address, iconSize = 35 }: Props): React.ReactElement {
  const theme = useTheme();
  const { endpoint } = useEndpoint(address);

  const [currentDelay, setCurrentDelay] = useState<number | undefined>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [endpointsDelay, setEndpointsDelay] = useState<EndpointsDelay>();
  const [fetchedApiDelay, setFetchedApiDelay] = useState<ApiDelay>();

  const isDark = theme.palette.mode === 'dark';
  const DEFAULT_GREY = isDark ? '#747474' : '#E8E0E5';

  const calculateAndSetDelay = useCallback(() => {
    endpoint && CalculateNodeDelay(endpoint)
      .then((response) => {
        if (!response) {
          return;
        }

        setFetchedApiDelay({ ...response });
        setEndpointsDelay((prevEndpoints) => {
          return prevEndpoints?.map((e) => {
            // @ts-ignore
            if (e.value === response.api?._options?.provider?.endpoint) {
              return { ...e, delay: response.delay };
            }

            return e;
          });
        });

        response.api?.disconnect().catch(console.error);
      })
      .catch(console.error);
  }, [endpoint]);

  const onClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    calculateAndSetDelay();
    setAnchorEl(event.currentTarget);
  }, [calculateAndSetDelay]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <ListIndicator
        currentDelay={currentDelay}
        defaultColor={DEFAULT_GREY}
        endpointUrl={endpoint}
        iconSize={ iconSize}
        id={id}
        onClick={onClick}

      />
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: isDark ? 'secondary.main' : 'transparent', borderRadius: '7px', boxShadow: isDark ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)', py: '5px' }
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        id={id}
        onClose={handleClose}
        open={open}
        sx={{ mt: '5px' }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top'
        }}
      >
        <NodesList
          address={address}
          calculateAndSetDelay={calculateAndSetDelay}
          currentDelay={currentDelay}
          defaultColor={DEFAULT_GREY}
          endpointsDelay={endpointsDelay}
          fetchedApiDelay={fetchedApiDelay}
          setCurrentDelay={setCurrentDelay}
          setEndpointsDelay={setEndpointsDelay}
        />
      </Popover>
    </>
  );
}

export default React.memo(RemoteNodeSelectorWithSignals);
