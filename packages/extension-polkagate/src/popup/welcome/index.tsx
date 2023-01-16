// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
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
        text={t<string>('Polkagate')}
      />
      <Typography component='h2' sx={{ fontSize: '36px', fontWeight: theme.palette.mode === 'dark' ? 300 : 400, pb: '20px', pt: '25px', textAlign: 'center' }}>
        {t<string>('Welcome')}
      </Typography>
      <Typography component={'p'} sx={{ fontSize: '14px', fontWeight: 300, textAlign: 'center' }}>
        {t<string>('Before we start, just a couple of notes regarding use:')}
      </Typography>
      <Box sx={{ backgroundColor: 'background.paper', border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', fontSize: '14px', m: '24px 15px 17px', p: '0' }}>
        <List sx={{ color: 'text.primary' }}>
          <ListItem>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We do not send any clicks, pageviews or events to a central server.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We do not use any trackers or analytics.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We do not collect keys, addresses or any information. Your information never leaves this machine.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
        </List>
      </Box>
      <Typography component={'p'} sx={{ fontSize: '14px', fontWeight: 300, pl: '25px' }}>
        {t<string>('... We are not in the information collection business (even anonymized).')}
      </Typography>
      <PButton
        _onClick={_onClick}
        _variant={'contained'}
        text={t<string>('Understood, let me continue')}
      />
    </>
  );
};

export default React.memo(Welcome);
