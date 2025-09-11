// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Stack } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { setStorage } from '../../util';
import { Account } from '../components';
import OpenerButton from '../sendFund/partials/OpenerButton';
import AccountDropDown from './AccountDropDown';

function AccountRow ({ account }: { account: AccountWithChildren }): React.ReactElement {
  const navigate = useNavigate();

  const [defaultGenesisAndAssetId, setDefaultGenesisAndAssetId] = useState<string>(); // 'genesisHash/assetId'

  const goToAccountPage = useCallback(() => {
    if (!account?.address) {
      return;
    }

    setStorage(STORAGE_KEY.SELECTED_ACCOUNT, account.address)
      .finally(() =>
        navigate(`accountfs/${account.address}/${defaultGenesisAndAssetId ?? `${POLKADOT_GENESIS}/0`}`) as void
      ).catch(console.error);
  }, [account, defaultGenesisAndAssetId, navigate]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ m: '2px 0 10px', width: '98%' }}>
      <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ m: '2px 10px', overflow: 'hidden', width: '80%' }}>
        <PolkaGateIdenticon
          address={account.address}
          size={36}
        />
        <Account
          account={account}
          onClick ={goToAccountPage}
          setDefaultGenesisAndAssetId={setDefaultGenesisAndAssetId}
        />
      </Stack>
      <Stack columnGap='5px' direction='row'>
        <AccountDropDown
          address={account?.address}
          isExternal={account?.isExternal}
          name={account?.name}
        />
        <OpenerButton
        onClick={goToAccountPage}
        />
      </Stack>
    </Stack>
  );
}

export default React.memo(AccountRow);
