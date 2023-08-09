// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { SignalCellularAlt as SignalCellularAltIcon, SignalCellularAlt1Bar as SignalCellularAlt1BarIcon, SignalCellularAlt2Bar as SignalCellularAlt2BarIcon } from '@mui/icons-material';
import { Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { ChromeStorageGetResponse } from '../components/RemoteNodeSelector';
import { useAccount, useChainName, useEndpoint2, useEndpoints } from '../hooks';
import CalculateNodeDelay from '../util/calculateNodeDelay';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  genesisHash?: string | undefined;
}

type EndpointsDelay = { name: string, delay: number | undefined, value: string }[];

function NodeSwitch({ address, api, genesisHash }: Props): React.ReactElement {
  const theme = useTheme();
  const account = useAccount(address);
  const endpointOptions = useEndpoints(genesisHash || account?.genesisHash);
  const endpointUrl = useEndpoint2(address);
  const chainName = useChainName(address);

  const [currentDelay, setCurrentDelay] = useState<number | undefined>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [endpointsDelay, setEndpointsDelay] = useState<EndpointsDelay>();

  const colors = {
    green: '#1F7720',
    orange: '#FF5722',
    red: '#C70000',
    gray: theme.palette.mode === 'light' ? '#E8E0E5' : '#4B4B4B'
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
        : colors.red, []);

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
    if (!sanitizedCurrentEndpointName || !currentDelay) {
      return;
    }

    updateNodesList();
  }, [currentDelay, sanitizedCurrentEndpointName, updateNodesList]);

  useEffect(() => {
    if (!endpointOptions || endpointOptions.length === 0 || endpointsDelay) {
      return;
    }

    const mappedEndpoints = endpointOptions.map((endpoint) => ({ delay: undefined, name: endpoint.text.replace(/^via\s/, ''), value: endpoint.value }));

    setEndpointsDelay(mappedEndpoints);
    updateNodesList();
  }, [endpointOptions, endpointsDelay, updateNodesList]);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    setCurrentDelay(undefined);

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

  // useEffect(() => {
  //   endpointsDelay?.sort((a, b) => {
  //     if (a.name === sanitizedCurrentEndpointName) return -1;
  //     if (b.name === sanitizedCurrentEndpointName) return 1;

  //     return 0;
  //   });
  // }, [endpointsDelay, sanitizedCurrentEndpointName]);

  // Function to calculate node delay and update state
  const calculateAndSetDelay = useCallback(() => {
    CalculateNodeDelay(api)
      .then(setCurrentDelay)
      .catch(console.error);
  }, [api]);

  // Calculate initial delay when the component mounts
  useEffect(() => {
    if (api && currentDelay === undefined) {
      calculateAndSetDelay();
    }
  }, [api, calculateAndSetDelay, currentDelay]);

  // Set up the interval when the component mounts
  useEffect(() => {
    const intervalId = setInterval(calculateAndSetDelay, 120000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [api, calculateAndSetDelay]);

  const NodeStatusIcon = ({ ms }: { ms: number | undefined }) => {
    return (
      <>
        {ms !== undefined &&
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

  const NodeStatusAndDelay = ({ endpointDelay, isSelected = false }: { endpointDelay: number | undefined, isSelected?: boolean }) => (
    <Grid alignItems='center' container item sx={{ width: 'fit-content' }}>
      {<Typography color={endpointDelay ? statusColor(endpointDelay) : 'inherit'} fontSize='16px' fontWeight={isSelected ? 500 : 400} pr='10px'>
        {endpointDelay ? `${endpointDelay} ms` : isSelected ? '- - - ms' : ''}
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
    <Grid container direction='column' item sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '4px', display: 'block', minWidth: '275px', p: '6px 8px', width: 'fit-content' }}>
      {endpointsDelay && endpointsDelay.length > 0 &&
        endpointsDelay.map((endpoint, index) => {
          const selectedEndpoint = endpoint.name === sanitizedCurrentEndpointName;

          return (
            // eslint-disable-next-line react/jsx-no-bind
            <Grid alignItems='center' container item justifyContent='space-between' key={index} onClick={() => _onChangeEndpoint(endpoint.value)} py='5px' sx={{ ':hover': { bgcolor: 'rgba(186, 40, 130, 0.1)' }, bgcolor: selectedEndpoint ? 'rgba(186, 40, 130, 0.2)' : 'transparent', borderRadius: '5px', cursor: 'pointer', my: '3px', px: '5px', width: '100%' }}>
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

  console.log('delay:', currentDelay)

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', height: '42px', position: 'relative', width: '42px', zIndex: 10 }}>
        <SignalCellularAltIcon
          sx={{ bottom: '2px', color: colors.gray, fontSize: '35px', left: '2px', position: 'absolute' }}
        />
        <NodeStatusIcon ms={currentDelay} />
      </Grid>
      <Popover
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

export default React.memo(NodeSwitch);
