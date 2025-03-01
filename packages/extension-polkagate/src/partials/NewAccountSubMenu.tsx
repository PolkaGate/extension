// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Collapse, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { AccountContext, ActionContext, MenuItem, VaadinIcon } from '../components';
import { useTranslation } from '../hooks';
import { windowOpen } from '../messaging';

interface Props {
  show: boolean;
}

function NewAccountSubMenu({ show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { master } = useContext(AccountContext);

  const goToDeriveAcc = useCallback(() => {
    master && onAction(`/derive/${master.address}`);
  }, [master, onAction]);

  const goToCreateAcc = useCallback(() => {
    windowOpen('/account/create').catch(console.error);
  }, []);

  return (
    <Collapse easing={{ enter: '200ms', exit: '100ms' }} in={show} sx={{ width: '100%' }}>
      <Grid container item justifyContent='flex-end'>
        <Divider sx={{ bgcolor: 'divider', height: '1px', mr: '10px', width: '83%' }} />
        <Grid container direction='column' display='block' item sx={{ p: '10px', pr: 0 }}>
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:plus-circle-o' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={goToCreateAcc}
            py='4px'
            text={t('Create new account')}
            withHoverEffect
          />
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:road-branch' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={goToDeriveAcc}
            text={t('Derive from accounts')}
            withHoverEffect
          />
        </Grid>
      </Grid>
    </Collapse>
  );
}

export default React.memo(NewAccountSubMenu);
