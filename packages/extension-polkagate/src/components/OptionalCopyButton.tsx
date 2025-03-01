// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { VaadinIcon } from '../components';
import OptionalCopyPopup from '../partials/OptionalCopyPopup';

interface Props {
  address: string | undefined;
  iconWidth?: number;
}

function OptionalCopyButton({ address, iconWidth = 20 }: Props): React.ReactElement {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const onCopyIconClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'copy-popover' : undefined;

  return (
    <>
      <Grid alignItems='center' aria-describedby={id} component='button' container direction='column' item justifyContent='center' onClick={onCopyIconClick} sx={{ bgcolor: 'transparent', border: 'none', cursor: 'pointer', p: '2px 6px', position: 'relative', width: '35px' }}>
        <VaadinIcon icon='vaadin:copy-o' style={{ color: `${theme.palette.secondary.light}`, width: `${iconWidth}px` }} />
      </Grid>
      <Popover
        PaperProps={{
          sx: {
            backgroundImage: 'none',
            bgcolor: 'background.paper',
            border: isDarkMode ? '1px solid' : 'none',
            borderColor: 'secondary.light',
            boxShadow: `0px 0px 10px 8px ${theme.palette.divider}`,
            pt: '5px'
          }
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'center'
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
        <OptionalCopyPopup address={address} setAnchorEl={setAnchorEl} />
      </Popover>
    </>
  );
}

export default React.memo(OptionalCopyButton);
