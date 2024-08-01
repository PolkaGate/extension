// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useGenesisHashOptions, useInfo, useIsTestnetEnabled } from '../hooks';
import { tieAccount } from '../messaging';
import { CHAINS_WITH_BLACK_LOGO, TEST_NETS } from '../util/constants';
import getLogo from '../util/getLogo';
import type { DropdownOption } from '../util/types';
import { sanitizeChainName } from '../util/utils';
import type { HexString } from '@polkadot/util/types';

interface Props {
  address: string | undefined;
  chains: string[];
}
interface NetworkListProps {
  address: string | undefined;
  chains: string[];
  selectedChainName: string | undefined;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
  setSelectedChainName: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const NetworkList = ({ address, chains, setAnchorEl, setSelectedChainName, selectedChainName }: NetworkListProps) => {
  const theme = useTheme();
  const options = useGenesisHashOptions();
  const isTestnetEnabled = useIsTestnetEnabled();

  const selectableNetworks = useMemo(() =>
    !chains.length
      ? options.filter(({ text }) => text !== 'Allow use on any chain')
      : options.filter((o) => chains.includes(o.value as any))
    , [chains, options]);

  const sanitizedLowercase = useCallback((text: string) => sanitizeChainName(text)?.toLowerCase(), []);

  const isTestnetDisabled = useCallback((genesisHash: string) => !isTestnetEnabled && TEST_NETS.includes(genesisHash), [isTestnetEnabled]);

  const selectNetwork = useCallback((net: DropdownOption) => {
    setAnchorEl(null);

    if (!address || !net?.value) {
      return;
    }

    if (isTestnetDisabled(net.value as string)) {
      return;
    }

    tieAccount(address, net.value as HexString).catch(console.error);
    setSelectedChainName(net.text);
  }, [address, isTestnetDisabled, setAnchorEl, setSelectedChainName]);

  return (
    <Grid container item sx={{ maxHeight: '550px', overflow: 'hidden', overflowY: 'scroll', width: '250px' }}>
      {selectableNetworks && selectableNetworks.length > 0 &&
        selectableNetworks.map((network, index) => {
          const selectedNetwork = sanitizedLowercase(network.text) === selectedChainName?.toLocaleLowerCase();

          return (
            <Grid container justifyContent='space-between' key={index} onClick={() => selectNetwork(network)} sx={{ ':hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(24, 7, 16, 0.1)' : 'rgba(255, 255, 255, 0.1)' }, bgcolor: selectedNetwork ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: isTestnetDisabled(network.value as string) ? 'not-allowed' : 'pointer', height: '45px', opacity: isTestnetDisabled(network.value as string) ? 0.3 : 1, px: '15px' }}>
              <Grid alignItems='center' container item width='fit-content'>
                <Typography fontSize='16px' fontWeight={selectedNetwork ? 500 : 400}>
                  {network.text}
                </Typography>
              </Grid>
              {network.text !== 'Allow use on any chain' &&
                <Grid alignItems='center' container item pl='15px' width='fit-content'>
                  <Avatar
                    src={getLogo(sanitizedLowercase(network.text))}
                    sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(network.text) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 29, width: 29 }}
                    variant='square'
                  />
                </Grid>
              }
            </Grid>
          );
        })}
    </Grid>
  )
}

function FullScreenChainSwitch({ address, chains }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { chainName: chainNameFromAccount } = useInfo(address);

  const [selectedChainName, setSelectedChainName] = useState<string>();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    setSelectedChainName(chainNameFromAccount);
  }, [chainNameFromAccount]);

  useEffect(() => {
    setFlip(true);
    setTimeout(() => setFlip(false), 1000);
  }, [selectedChainName]);


  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Grid container item>
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.main', borderRadius: '50%', cursor: 'pointer', height: '40px', p: 0, width: '40px' }}>
        <Avatar
          src={getLogo(selectedChainName)}
          sx={{
            bgcolor: 'transparent',
            borderRadius: '50%',
            filter: CHAINS_WITH_BLACK_LOGO.includes(selectedChainName ?? '') ? 'invert(1)' : '',
            height: '34px',
            m: 'auto',
            transform: flip ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 1s',
            width: '34px'
          }}
        />
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)', py: '5px' }
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
        <NetworkList
          selectedChainName={selectedChainName}
          setSelectedChainName={setSelectedChainName}
          setAnchorEl={setAnchorEl}
          address={address}
          chains={chains}
        />
      </Popover>
    </Grid>
  );
}

export default React.memo(FullScreenChainSwitch);
