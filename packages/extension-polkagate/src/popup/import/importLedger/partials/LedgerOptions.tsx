// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { Menu, More2, Refresh, Warning2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import OnboardTitle from '../../../../fullscreen/components/OnboardTitle';
import { useTranslation } from '../../../../hooks';
import { MODE } from '..';
import ImportTypeButton from './LedgerOption';
import { METADATA_DASHBOARD } from './partials';

interface Props {
  setMode: React.Dispatch<React.SetStateAction<number>>;
}

export default function LedgerOptions({ setMode }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [hoveredMode, setHoveredMode] = useState<number>();

  const onPolkadotLegacy = useCallback(() => setMode(MODE.LEGACY), [setMode]);

  const onPolkadotGeneric = useCallback(() => setMode(MODE.GENERIC), [setMode]);

  const onMigration = useCallback(() => setMode(MODE.MIGRATION), [setMode]);

  return (
    <Stack direction='column' sx={{ height: '545px', position: 'relative' }}>
      <OnboardTitle
        label={t('Attach ledger device')}
        labelPartInColor={t('ledger device')}
        url='/account/have-wallet'
      />
      <Typography color='#BEAAD8' py='20px' textAlign='left' variant='B-1' width='100%'>
        {t('Choose the type of Ledger connection. The Polkadot Generic app is new and recommended. However, if you already have assets on a Ledger device for chains other than Polkadot and its asset hub, you can use the Ledger Legacy apps. In this case, you will need to migrate your assets to the Polkadot Generic app using the Migration app, provided that your desired chain has upgraded its runtime and is compatible with the Polkadot Generic app.')}
      </Typography>
      <Grid columnGap='10px' container item rowGap='10px' sx={{ flexWrap: 'nowrap', mb: '20px', mt: '10px' }}>
        <ImportTypeButton
          Icon={More2}
          label={t('Ledger Polkadot Generic')}
          mode={MODE.GENERIC}
          onClick={onPolkadotGeneric}
          setHoveredMode={setHoveredMode}
        />
        <ImportTypeButton
          Icon={Refresh}
          label={t('Migration app')}
          mode={MODE.MIGRATION}
          onClick={onMigration}
          setHoveredMode={setHoveredMode}
        />
        <ImportTypeButton
          Icon={Menu}
          label={t('Legacy apps')}
          mode={MODE.LEGACY}
          onClick={onPolkadotLegacy}
          setHoveredMode={setHoveredMode}
        />
      </Grid>
      {hoveredMode === MODE.GENERIC &&
        <Stack columnGap='10px' direction='row' sx={{ pt: '30px' }}>
          <More2 color='#FF4FB9' size='18' variant='TwoTone' />
          <Typography color='#EAEBF1' textAlign='left' variant='B-2' width='100%'>
            {t('It can be used with all supported Polkadot chains and parachains.')}
          </Typography>
        </Stack>
      }
      {hoveredMode === MODE.MIGRATION &&
        <Stack columnGap='10px' direction='row' sx={{ pt: '30px' }}>
          <Refresh color='#FF4FB9' size='18' variant='TwoTone' />
          <Typography color='#EAEBF1' textAlign='left' variant='B-2' width='100%'>
            {t('Migrate your accounts from the Legacy apps to the Polkadot Generic app.')}
          </Typography>
        </Stack>
      }
      {hoveredMode === MODE.LEGACY &&
        <Stack columnGap='10px' direction='row' sx={{ pt: '30px' }}>
          <Menu color='#FF4FB9' size='18' variant='TwoTone' />
          <Typography color='#EAEBF1' textAlign='left' variant='B-2' width='100%'>
            {t('Each chain and parachain may have a dedicated app on the Ledger device, but this is now deprecated as chains upgrade to align with the Polkadot generic app.')}
          </Typography>
        </Stack>
      }
      <Stack alignItems='center' columnGap='10px' direction='row' sx={{ bottom: '0', position: 'absolute', pt: '30px' }}>
        <Warning2 color='#AA83DC' size='24' variant='Bold' />
        <Typography color='#AA83DC' textAlign='left' variant='B-4'>
          {t('To find out if your chain is upgraded, check: ')}
          <a
            href={METADATA_DASHBOARD}
            rel='noreferrer'
            style={{ color: '#FF4FB9' }}
            target='_blank'
          >
            {t('Metadata Dashboard')}
          </a>
        </Typography>
      </Stack>
    </Stack>
  );
}
