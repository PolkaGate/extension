// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Modal, Typography } from '@mui/material';
import React, { } from 'react';
import CloseIcon from '@mui/icons-material/Close';

import { ApiPromise } from '@polkadot/api';

import { useTranslation } from '../../../hooks';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
}

export default function AllVotes({ address, open, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();

  const handleClose = () => {
    setOpen(false);
  };

  const style = {
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    left: '50%',
    position: 'absolute',
    pb: 3,
    pt: 2,
    px: 4,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <Box sx={{ ...style }}>
        <Grid container>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('All Votes')}
            </Typography>
          </Grid>
          <Grid item xs>
            search box
          </Grid>
          <Grid item>
            <CloseIcon sx={{ color: 'primary.main', cursor:'pointer' }} onClick={handleClose} />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}
