// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { ExtensionPopups, TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import MySwitch from '../../../../components/MySwitch';
import { useTranslation } from '../../../../components/translate';
import useIsTestnetEnabled from '../../../../hooks/useIsTestnetEnabled';
import { tieAccount } from '../../../../messaging';
import Warning from './Warning';

export default function EnableTestNet (): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  const [testnetWarning, setShowTestnetWarning] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  const onEnableTestNetClick = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    checked
      ? setShowTestnetWarning(ExtensionPopups.WARNING)
      : setStorage('testnet_enabled', false).catch(console.error);
  }, []);

  const onEnableTestDone = useCallback(() => {
    setShowTestnetWarning(ExtensionPopups.NONE);

    setStorage('testnet_enabled', true).catch(console.error);
    accounts?.forEach(({ address, genesisHash }) => {
      if (genesisHash && TEST_NETS.includes(genesisHash)) {
        // NO TIE ANYMORE IN NEW DESIGN
        tieAccount(address, null).catch(console.error);
      }
    });
  }, [accounts]);

  return (
    <Stack direction='column'>
      <Typography color='label.secondary' my='5px' sx={{ display: 'block', textAlign: 'left' }} variant='H-4'>
        {t('Test Networks')}
      </Typography>
      <Grid alignItems='center' columnGap='8px' container justifyContent='flex-start' pt='7px'>
        <MySwitch
          checked={Boolean(isTestnetEnabled)}
          onChange={onEnableTestNetClick}
        />
        <Typography variant='B-1'>
          {t('Show Test Networks')}
        </Typography>
      </Grid>
      <Warning
        onConfirm={onEnableTestDone}
        open={testnetWarning === ExtensionPopups.WARNING}
        setPopup={setShowTestnetWarning}
      />
    </Stack>
  );
}
