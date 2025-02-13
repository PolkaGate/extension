// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../../components/translate';
import useIsTestnetEnabled from '../../../../hooks/useIsTestnetEnabled';
import { tieAccount } from '../../../../messaging';
import { WelcomeHeaderPopups } from '../../../../partials/WelcomeHeader';
import MySwitch from '../components/Switch';
import Warning from './Warning';

export default function EnableTestNet (): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  const [testnetWarning, setShowTestnetWarning] = useState<WelcomeHeaderPopups>(WelcomeHeaderPopups.NONE);

  const onEnableTestNetClick = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    checked
      ? setShowTestnetWarning(WelcomeHeaderPopups.WARNING)
      : setStorage('testnet_enabled', false).catch(console.error);
  }, []);

  const onEnableTestDone = useCallback(() => {
    setShowTestnetWarning(WelcomeHeaderPopups.NONE);

    setStorage('testnet_enabled', true).catch(console.error);
    accounts?.forEach(({ address, genesisHash }) => {
      if (genesisHash && TEST_NETS.includes(genesisHash)) {
        tieAccount(address, null).catch(console.error);
      }
    });
  }, [accounts]);

  return (
    <Stack direction='column'>
      <Typography color='rgba(190, 170, 216, 1)' my='5px' sx={{ display: 'block', textAlign: 'left' }} variant='H-4'>
        TETSTNETS
      </Typography>
      <Grid alignItems='center' columnGap='8px' container justifyContent='flex-start' pt='7px'>
        <MySwitch
          checked={Boolean(isTestnetEnabled)}
          onChange={onEnableTestNetClick}
        />
        <Typography variant='B-1'>
          {t('Enable Testnet Chains')}
        </Typography>
      </Grid>
      <Warning
        onConfirm={onEnableTestDone}
        open={testnetWarning === WelcomeHeaderPopups.WARNING}
        setPopup={setShowTestnetWarning}
      />
    </Stack>
  );
}
