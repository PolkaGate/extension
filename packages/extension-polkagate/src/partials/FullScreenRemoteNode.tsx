// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { SignalCellularAlt as SignalCellularAltIcon, SignalCellularAlt1Bar as SignalCellularAlt1BarIcon, SignalCellularAlt2Bar as SignalCellularAlt2BarIcon } from '@mui/icons-material';
import { Grid, Popover, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { ChromeStorageGetResponse } from '../components/RemoteNodeSelector';
import { useAccount, useChainName, useEndpoint2, useEndpoints } from '../hooks';
import CalculateNodeDelay from '../util/calculateNodeDelay';

interface Props {
  address: string | undefined;
}

type EndpointsDelay = { name: string, delay: number | null | undefined, value: string }[];

function FullScreenRemoteNode({ address }: Props): React.ReactElement {
  const theme = useTheme();
  const account = useAccount(address);
  const genesisHash = account?.genesisHash;
  const endpointOptions = useEndpoints(genesisHash);

  const endpointUrl = useEndpoint2(address);
  const chainName = useChainName(address);

  const [currentDelay, setCurrentDelay] = useState<number | undefined>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [endpointsDelay, setEndpointsDelay] = useState<EndpointsDelay>();
  const [api, setApi] = useState<ApiPromise | null | undefined>(null);
  const [fetchedApiAndDelay, setFetchedApiAndDelay] = useState<{ fetchedApi: ApiPromise | null | undefined, fetchedDelay: number | undefined }>();

  const colors = {
    gray: theme.palette.mode === 'light' ? '#E8E0E5' : '#747474',
    green: '#1F7720',
    orange: '#FF5722',
    red: '#C70000'
  };

  const sanitizedCurrentEndpointName = useMemo(() => {
    const currentEndpointName = endpointOptions.find((endpoint) => endpoint.value === endpointUrl)?.text;

    return currentEndpointName?.replace(/^via\s/, '');
  }, [endpointOptions, endpointUrl]);

  const statusColor = useCallback((ms: number) =>
    ms <= 100
      ? colors.green
      : ms <= 300
        ? colors.orange
        : colors.red,
    [colors.green, colors.orange, colors.red]);

  const updateNodesList = useCallback(() => {
    setEndpointsDelay((prevEndpoints) => {
      return prevEndpoints?.map((endpoint) => {
        if (endpoint.name === sanitizedCurrentEndpointName) {
          return { ...endpoint, delay: api?._options?.provider?.endpoint === endpointUrl ? currentDelay : undefined };
        }

        return endpoint;
      });
    });
  }, [api?._options?.provider?.endpoint, currentDelay, endpointUrl, sanitizedCurrentEndpointName]);

  useEffect(() => {
    if (!endpointOptions || endpointOptions.length === 0 || endpointsDelay) {
      return;
    }

    const mappedEndpoints = endpointOptions.map((endpoint) => ({ delay: null, name: endpoint.text.replace(/^via\s/, ''), value: endpoint.value }));

    setEndpointsDelay(mappedEndpoints);
  }, [endpointOptions, endpointsDelay, updateNodesList]);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    setCurrentDelay(undefined);

    setEndpointsDelay((prevEndpoints) => {
      return prevEndpoints?.map((endpoint) => {
        if (endpoint.value === newEndpoint && !endpoint.delay) {
          return { ...endpoint, delay: undefined };
        }

        return endpoint;
      });
    });

    chainName && address && chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
      const i = `${address}`;
      const j = `${chainName}`;
      const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

      savedEndpoints[i] = savedEndpoints[i] || {};

      savedEndpoints[i][j] = newEndpoint;

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ endpoints: savedEndpoints });
    });
  }, [address, chainName]);

  useEffect(() => {
    if (fetchedApiAndDelay && fetchedApiAndDelay.fetchedApi && fetchedApiAndDelay.fetchedApi?._options?.provider?.endpoint === endpointUrl) {
      setApi(fetchedApiAndDelay.fetchedApi);
      setCurrentDelay(fetchedApiAndDelay.fetchedDelay);
    }
  }, [endpointUrl, fetchedApiAndDelay]);

  // Function to calculate node delay and update state
  const calculateAndSetDelay = useCallback(() => {
    CalculateNodeDelay(endpointUrl)
      .then((response) => {
        setFetchedApiAndDelay({ fetchedApi: response.api, fetchedDelay: response.delay });
        setEndpointsDelay((prevEndpoints) => {
          return prevEndpoints?.map((endpoint) => {
            if (endpoint.value === response.api?._options?.provider?.endpoint) {
              return { ...endpoint, delay: response.delay };
            }

            return endpoint;
          });
        });

        response.api.disconnect().catch(console.error);
      })
      .catch(console.error);
  }, [endpointUrl]);

  // Calculate initial delay when the component mounts
  useEffect(() => {
    if ((api && currentDelay === undefined) || api === null) {
      calculateAndSetDelay();
    }
  }, [api, calculateAndSetDelay, currentDelay]);

  // Set up the interval when the component mounts
  useEffect(() => {
    const intervalId = setInterval(calculateAndSetDelay, 60000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [api, calculateAndSetDelay]);

  const NodeStatusIcon = ({ ms }: { ms: number | null | undefined }) => {
    return (
      <>
        {ms !== undefined && ms !== null &&
          (ms <= 100
            ? (
              <SignalCellularAltIcon
                sx={{ bottom: '2px', color: colors.green, fontSize: '35px', left: '2px', position: 'absolute' }}
              />
            )
            : ms <= 300
              ? (
                <SignalCellularAlt2BarIcon
                  sx={{ bottom: '2px', color: colors.orange, fontSize: '35px', left: '2px', position: 'absolute' }}
                />
              )
              : (
                <SignalCellularAlt1BarIcon
                  sx={{ bottom: '2px', color: colors.red, fontSize: '35px', left: '2px', position: 'absolute' }}
                />
              ))}
      </>
    );
  };

  const NodeStatusAndDelay = ({ endpointDelay, isSelected = false }: { endpointDelay: number | null | undefined, isSelected?: boolean }) => (
    <Grid alignItems='center' container item sx={{ width: 'fit-content' }}>
      {<Typography color={endpointDelay ? statusColor(endpointDelay) : 'inherit'} fontSize='16px' fontWeight={isSelected ? 500 : 400} pr='10px'>
        {endpointDelay
          ? `${endpointDelay} ms`
          : (endpointDelay === undefined || isSelected)
            ? <Skeleton
              height='20px'
              sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '55px', mt: '5px' }}
            />
            : ''}
      </Typography>}
      <Grid container height='35px' item position='relative' width='40px'>
        <SignalCellularAltIcon
          sx={{ bottom: '2px', color: colors.gray, fontSize: '35px', left: '2px', position: 'absolute' }}
        />
        <NodeStatusIcon ms={endpointDelay} />
      </Grid>
    </Grid>
  );

  const NodesList = () => (
    <Grid container direction='column' item sx={{ display: 'block', minWidth: '275px', py: '6px', width: 'fit-content' }}>
      {endpointsDelay && endpointsDelay.length > 0 &&
        endpointsDelay.map((endpoint, index) => {
          const selectedEndpoint = endpoint.name === sanitizedCurrentEndpointName;

          return (
            // eslint-disable-next-line react/jsx-no-bind
            <Grid alignItems='center' container item justifyContent='space-between' key={index} onClick={() => _onChangeEndpoint(endpoint.value)} py='5px' sx={{ ':hover': { bgcolor: 'rgba(186, 40, 130, 0.1)' }, bgcolor: selectedEndpoint ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: 'pointer', my: '3px', px: '15px', width: '100%' }}>
              <Typography fontSize='16px' fontWeight={selectedEndpoint ? 500 : 400}>
                {endpoint.name}
              </Typography>
              <NodeStatusAndDelay endpointDelay={endpoint.delay} isSelected={selectedEndpoint} />
            </Grid>
          );
        })}
    </Grid>
  );

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
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
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', cursor: 'pointer', height: '42px', position: 'relative', width: '42px', zIndex: 10 }}>
        <SignalCellularAltIcon
          sx={{ bottom: '2px', color: colors.gray, fontSize: '35px', left: '2px', position: 'absolute' }}
        />
        <NodeStatusIcon ms={currentDelay} />
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '7px', boxShadow: '0px 4px 4px rgba(255, 255, 255, 0.25)', py: '5px' }
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
        <NodesList />
      </Popover>
    </>
  );
}

export default React.memo(FullScreenRemoteNode);
