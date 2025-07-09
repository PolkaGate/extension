// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { MySwitch } from '@polkadot/extension-polkagate/src/components/index';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { ExtensionPopups, TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../components/translate';
import useIsTestnetEnabled from '../../../hooks/useIsTestnetEnabled';
import { tieAccount } from '../../../messaging';
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
      <Typography color='text.primary' fontSize='22px' m='40px 0 15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4' >
        {t('Test Networks')}
      </Typography>
      <MySwitch
        checked={Boolean(isTestnetEnabled)}
        columnGap='8px'
        label= {t('Show Test Networks')}
        onChange={onEnableTestNetClick}
      />
      <Warning
        onConfirm={onEnableTestDone}
        open={testnetWarning === ExtensionPopups.WARNING}
        setPopup={setShowTestnetWarning}
      />
    </Stack>
  );
}
