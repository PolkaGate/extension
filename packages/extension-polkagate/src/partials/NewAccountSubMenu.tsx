// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Divider, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext, ActionContext, MenuItem } from '../components';
import { useTranslation } from '../hooks';

interface Props {
  show: boolean;
}

function NewAccountSubMenu({ show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { master } = useContext(AccountContext);

  const [notFirstTime, setFirstTime] = useState<boolean>(false);

  useEffect(() => {
    show ? setFirstTime(true) : setTimeout(() => setFirstTime(false), 150);
  }, [show]);

  const _goToDeriveAcc = useCallback(
    () => {
      master && onAction(`/derive/${master.address}`);
    }, [master, onAction]
  );

  const _goToCreateAcc = useCallback(
    () => {
      onAction('/account/create');
    }, [onAction]
  );

  const slideIn = keyframes`
  0% {
    display: none;
    height: 0;
  }
  100%{
    display: block;
    height:  100px;
  }
`;

  const slideOut = keyframes`
  0% {
    display: block;
    height: 100px;
  }
  100%{
    display: none;
    height: 0;
  }
`;

  return (
    <Grid container display={notFirstTime ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: show ? '0.3s' : '0.15s', animationFillMode: 'both', animationName: `${show ? slideIn : slideOut}` }}>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid container direction='column' display='block' item sx={{ p: '18px 0 15px 10px' }}>
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:plus-circle-o' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToCreateAcc}
          py='4px'
          text={t('Create new account')}
        />
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:road-branch' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToDeriveAcc}
          text={t('Derive from accounts')}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(NewAccountSubMenu);
