// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../../components/translate';
import useIsTestnetEnabled from '../../../../hooks/useIsTestnetEnabled';
import { tieAccount } from '../../../../messaging';
import PSwitch from '../components/Switch';

export default function EnableTestNet (): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const isTestnetEnabled = useIsTestnetEnabled();

  const [testnetWarning, setShowTestnetWarning] = useState<boolean>(false);

  console.log('handle this:', testnetWarning);

  const onEnableTestNetClick = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    checked && setShowTestnetWarning(true);

    setStorage('testnet_enabled', checked).catch(console.error);

    if (checked) {
      accounts?.forEach(({ address, genesisHash }) => {
        if (genesisHash && TEST_NETS.includes(genesisHash)) {
          tieAccount(address, null).catch(console.error);
        }
      });
    }
  }, [accounts]);

  return (
    <Stack direction='column'>
      <Typography
        color='rgba(190, 170, 216, 1)'
        mb='5px'
        mt='15px'
        sx={{ display: 'block', textAlign: 'left' }}
        variant='H-4'
      >
        TETSTNETS
      </Typography>
      <Grid
        alignItems='center'
        columnGap='8px'
        container
        justifyContent='flex-start'
        pt='7px'
      >
        <PSwitch
          checked={isTestnetEnabled}
          onChange={onEnableTestNetClick}
        />
        <Typography
          variant='B-1'
        >
          {t('Enable Testnet Chains')}
        </Typography>
      </Grid>
    </Stack>
  );
}
