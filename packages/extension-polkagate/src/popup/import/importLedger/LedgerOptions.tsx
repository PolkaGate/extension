// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';


import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { PButton, VaadinIcon } from '../../../components';
import { useTranslation } from '../../../hooks';
import LedgerOption from './LedgerOption';
import { noop } from '@polkadot/util';
import { openOrFocusTab } from '../../../fullscreen/accountDetails/components/CommonTasks';
import { MODE } from '.';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

export default function LedgerOptions({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const onBack = useCallback(() =>
    openOrFocusTab('/', true)
    , []);

  const onPolkadotLegacy = useCallback(() =>
    setMode(MODE.LEGACY)
    , []);

  const onPolkadotGeneric = useCallback(() =>
    setMode(MODE.GENERIC)
    , []);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
      <Grid container item sx={{ display: 'block', px: '10%' }}>
        <Grid alignContent='center' alignItems='center' container item>
          <Grid item sx={{ mr: '20px' }}>
            <VaadinIcon icon='vaadin:wallet' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
          </Grid>
          <Grid item>
            <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
              {t('Attach ledger device')}
            </Typography>
          </Grid>
        </Grid>
        <Typography fontSize='14px' py='20px' width='100%'>
          {t('Choose the Ledger connection type. Polkadot Generic is a new and recommended mode. However, if you already have your assets on a Ledger device for chains other than Polkadot and its asset hub, you can use the Ledger Legacy apps. In this case, you will need to migrate your assets to the Polkadot Generic app using the Migration option.')}
        </Typography>
        <Grid container item justifyContent='space-between' mb='25px' mt='10px' rowGap='15px'>
          <LedgerOption
            title={t('Polkadot Generic')}
            logo={<VaadinIcon icon='vaadin:file-tree' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />}
            subTitle={t('It can be used with all supported Polkadot chains and parachains.')}
            onClick={onPolkadotGeneric}
          />
          <LedgerOption
            title={t('Legacy Apps')}
            logo={<VaadinIcon icon='vaadin:form' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />}
            subTitle={t('Each chain and parachain requires its own dedicated app on the Ledger device.')}
            onClick={onPolkadotLegacy}
          />
          <LedgerOption
            title={t('Migration')}
            logo={<VaadinIcon icon='vaadin:automation' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />}
            subTitle={t('Migrate your tokens from the Legacy apps to the Polkadot Generic app.')}
            onClick={noop}
          />
        </Grid>
        <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
          <PButton
            _mt='20px'
            _onClick={onBack}
            _variant='outlined'
            _width={40}
            text={t('Back')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
