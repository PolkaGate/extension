// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { PButton, VaadinIcon } from '../../../components';
import { openOrFocusTab } from '../../../fullscreen/accountDetails/components/CommonTasks';
import { Title } from '../../../fullscreen/sendFund/InputPage';
import { useTranslation } from '../../../hooks';
import LedgerOption from './LedgerOption';
import { METADATA_DASHBOARD } from './partials';
import { MODE } from '.';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

export default function LedgerOptions({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const onBack = useCallback(() => openOrFocusTab('/', true), []);

  const onPolkadotLegacy = useCallback(() => setMode(MODE.LEGACY), [setMode]);

  const onPolkadotGeneric = useCallback(() => setMode(MODE.GENERIC), [setMode]);

  const onMigration = useCallback(() => setMode(MODE.MIGRATION), [setMode]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
      <Grid container item sx={{ display: 'block', px: '10%' }}>
        <Title
          height='85px'
          logo={
            <VaadinIcon icon='vaadin:wallet' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
          }
          text={t('Attach ledger device')}
        />
        <Typography fontSize='14px' py='20px' width='100%'>
          {t('Choose the type of Ledger connection. The Polkadot Generic app is new and recommended. However, if you already have assets on a Ledger device for chains other than Polkadot and its asset hub, you can use the Ledger Legacy apps. In this case, you will need to migrate your assets to the Polkadot Generic app using the Migration app, provided that your desired chain has upgraded its runtime and is compatible with the Polkadot Generic app. To find out if your chain is upgraded, check: ')}
          {
            <a
              href={METADATA_DASHBOARD}
              rel='noreferrer'
              // style={{ color: theme.palette.text.primary }}
              target='_blank'
            >
              {t('Metadata Dashboard')}
            </a>
          }
        </Typography>
        <Grid container item justifyContent='space-between' mb='25px' mt='10px' rowGap='15px'>
          <LedgerOption
            logo={<VaadinIcon icon='vaadin:file-tree' style={{ color: `${theme.palette.text.primary}`, height: '30px', width: '30px' }} />}
            onClick={onPolkadotGeneric}
            subTitle={t('It can be used with all supported Polkadot chains and parachains.')}
            title={t('Polkadot Generic app')}
          />
          <LedgerOption
            logo={<VaadinIcon icon='vaadin:automation' style={{ color: `${theme.palette.text.primary}`, height: '30px', width: '30px' }} />}
            onClick={onMigration}
            subTitle={t('Migrate your accounts from the Legacy apps to the Polkadot Generic app.')}
            title={t('Migration app')}
          />
          <LedgerOption
            logo={<VaadinIcon icon='vaadin:form' style={{ color: `${theme.palette.text.primary}`, height: '30px', width: '30px' }} />}
            onClick={onPolkadotLegacy}
            subTitle={t('Each chain and parachain may have a dedicated app on the Ledger device, but this is now deprecated as chains upgrade to align with the Polkadot generic app.')}
            title={t('Legacy apps')}
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
