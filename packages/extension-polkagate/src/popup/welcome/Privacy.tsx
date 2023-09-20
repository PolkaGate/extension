// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon, FiberManualRecord as FiberManualRecordIcon } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { SlidePopUp } from '../../components';
import { useTranslation } from '../../hooks';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

function Privacy({ setShow, show = false }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const welcome = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='20px' fontWeight={400} lineHeight={1.4}>
          {t<string>('Privacy and Security')}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '1px', m: '35px auto', width: '240px' }} />
      <Box sx={{ backgroundColor: 'background.paper', border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', fontSize: '14px', m: '40px 15px 17px', p: '0' }}>
        <List sx={{ color: 'text.primary' }}>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We do not send any clicks, pageviews, or events to a central server.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We do not utilize any trackers or analytics.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We do not collect keys, addresses, or any personal information. Your data always stays on this device.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We are committed to respecting your privacy and are not engaged in information collection – not even anonymized data.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
        </List>
      </Box>
      <IconButton onClick={onClose} sx={{ left: '15px', p: 0, position: 'absolute', top: '65px' }}>
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <SlidePopUp show={show}>
      {welcome}
    </SlidePopUp>
  );
}

export default React.memo(Privacy);
