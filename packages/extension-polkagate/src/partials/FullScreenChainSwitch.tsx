// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid, Popover, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useChainName, useGenesisHashOptions, useIsTestnetEnabled } from '../hooks';
import { tieAccount } from '../messaging';
import { CHAINS_WITH_BLACK_LOGO, TEST_NETS } from '../util/constants';
import getLogo from '../util/getLogo';
import { DropdownOption } from '../util/types';
import { sanitizeChainName } from '../util/utils';

interface Props {
  address: string | undefined;
  chains: string[];
}

function FullScreenChainSwitch({ address, chains }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const options = useGenesisHashOptions();
  const currentChainNameFromAccount = useChainName(address);
  const isTestnetEnabled = useIsTestnetEnabled();

  const [currentSelectedChainName, setCurrentSelectedChainName] = useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const isTestnetDisabled = useCallback((genesisHash: string) => !isTestnetEnabled && TEST_NETS.includes(genesisHash), [isTestnetEnabled]);
  const selectableNetworks = useMemo(() => !chains.length ? options.filter(({ text }) => text !== 'Allow use on any chain') : options.filter((o) => chains.includes(o.value)), [chains, options]);

  useEffect(() => {
    setCurrentSelectedChainName(currentChainNameFromAccount);
  }, [currentChainNameFromAccount]);

  // useEffect(() => {
  //   if (!currentSelectedChainName && currentChainNameFromAccount) {
  //     setCurrentSelectedChainName(currentChainNameFromAccount);
  //   }
  // }, [currentChainNameFromAccount, currentSelectedChainName]);

  const selectNetwork = useCallback((net: DropdownOption) => {
    setAnchorEl(null);

    if (!address || !net?.value) {
      return;
    }

    if (isTestnetDisabled(net.value)) {
      return;
    }

    tieAccount(address, net.value).catch(console.error);
    setCurrentSelectedChainName(net.text);
  }, [address, isTestnetDisabled]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const chainName = useCallback((text: string) => sanitizeChainName(text)?.toLowerCase(), []);

  const NetworkList = () => (
    <Grid container item sx={{ maxHeight: '550px', overflow: 'hidden', overflowY: 'scroll', width: '250px' }}>
      {selectableNetworks && selectableNetworks.length > 0 &&
        selectableNetworks.map((network, index) => {
          const selectedNetwork = chainName(network.text) === currentSelectedChainName?.toLocaleLowerCase();

          return (
            // eslint-disable-next-line react/jsx-no-bind
            <Grid container justifyContent='space-between' key={index} onClick={() => selectNetwork(network)} sx={{ ':hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(24, 7, 16, 0.1)' : 'rgba(255, 255, 255, 0.1)' }, bgcolor: selectedNetwork ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: isTestnetDisabled(network.value) ? 'not-allowed' : 'pointer', height: '45px', px: '15px', opacity: isTestnetDisabled(network.value) ? 0.3 : 1 }}>
              <Grid alignItems='center' container item width='fit-content'>
                <Typography fontSize='16px' fontWeight={selectedNetwork ? 500 : 400}>
                  {network.text}
                </Typography>
              </Grid>
              {network.text !== 'Allow use on any chain' &&
                <Grid alignItems='center' container item pl='15px' width='fit-content'>
                  <Avatar
                    src={getLogo(chainName(network.text))}
                    sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(network.text) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 29, width: 29 }}
                    variant='square'
                  />
                </Grid>
              }
            </Grid>
          );
        })}
    </Grid>
  );

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Grid container item>
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.main', borderRadius: '50%', cursor: 'pointer', height: '40px', p: 0, width: '40px' }}>
        <Avatar
          src={getLogo(currentSelectedChainName)}
          sx={{
            bgcolor: 'transparent',
            borderRadius: '50%',
            filter: CHAINS_WITH_BLACK_LOGO.includes(currentSelectedChainName ?? '') ? 'invert(1)' : '',
            height: '34px',
            m: 'auto',
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
        <NetworkList />
      </Popover>
    </Grid>
  );
}

export default React.memo(FullScreenChainSwitch);
