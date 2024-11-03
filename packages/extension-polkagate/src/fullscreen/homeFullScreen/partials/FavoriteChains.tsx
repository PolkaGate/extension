// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import ChainList from '../components/ChainList';

export interface CurrencyItemType { code: string; country: string; currency: string; sign: string; };

export default function FavoriteChains (): React.ReactElement {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const onChainListClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid alignItems='center' aria-describedby={id} component='button' container direction='column' item justifyContent='center' onClick={onChainListClick} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', p: '2px 6px', position: 'relative', width: '42px' }}>
        <FontAwesomeIcon
          color='#fff'
          fontSize='24px'
          icon={faSliders}
        />
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.light' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)', pt: '5px' }
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
        <ChainList
          anchorEl={anchorEl}
        />
      </Popover>
    </>
  );
}
