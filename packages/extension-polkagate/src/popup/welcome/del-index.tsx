// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { FiberManualRecord as FiberManualRecordIcon } from '@mui/icons-material';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, PButton } from '../../components';
import { useTranslation } from '../../hooks';
import HeaderBrand from '../../partials/HeaderBrand';

const Welcome = function (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const _onClick = useCallback(
    (): void => {
      window.localStorage.setItem('welcome_read', 'ok');
      onAction();
    },
    [onAction]
  );

  return (
    <>
      <HeaderBrand
        showBrand
        text={'Polkagate'}
      />
      <Typography component='h2' sx={{ fontSize: '36px', fontWeight: theme.palette.mode === 'dark' ? 300 : 400, pb: '20px', pt: '25px', textAlign: 'center' }}>
        {t<string>('Welcome!')}
      </Typography>
      <Typography sx={{ fontSize: '14px', fontWeight: 400, textAlign: 'center', px: '15px' }}>
        {t<string>('Before we begin, here are a few important points to keep in mind:')}
      </Typography>
      <Box sx={{ backgroundColor: 'background.paper', border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', fontSize: '14px', m: '24px 15px 17px', p: '0' }}>
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
      <Typography component={'p'} sx={{ fontSize: '14px', fontWeight: 400, pl: '25px' }}>
        {t<string>('Thank you for choosing Polkagate!')}
      </Typography>
      <PButton
        _onClick={_onClick}
        _variant={'contained'}
        text={t<string>('Got it, Take Me In')}
      />
    </>
  );
};

export default React.memo(Welcome);
