// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { ChevronRight } from '@mui/icons-material';
import { Grid, Stack } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';

import { AccountContext } from '../../components';
import { useIsHovered } from '../../hooks';
import { Account } from '../components';
import AccountDropDown from './AccountDropDown';

function GoToAccountButton ({ onClick }: { onClick: () => void }): React.ReactElement {
  const containerRef = useRef(null);
  const isHovered = useIsHovered(containerRef);

  return (
    <Grid
      alignItems='center' container item justifyContent='center'
      onClick={onClick}
      ref={containerRef}
      sx={{ background: isHovered ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', border: '3px solid #1B133C', borderRadius: '10px', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px' }}
    >
      <ChevronRight sx={{ color: isHovered ? '#EAEBF1' : '#AA83DC', fontSize: '28px' }} />
    </Grid>
  );
}

function AccountRow ({ account }: { account: AccountWithChildren }): React.ReactElement {
  const { accounts } = useContext(AccountContext);
  const navigate = useNavigate();

  const [defaultGenesisAndAssetId, setDefaultGenesisAndAssetId] = useState<string>(); // 'genesisHash/assetId'

  const goToAccountPage = useCallback(() => {
    const address = account?.address;

    if (!address) {
      return;
    }

    // update account as selected to be consistent with extension
    const accountToUnselect = accounts.find(({ address: accountAddress, selected }) => selected && address !== accountAddress);

    Promise.all([
      updateMeta(address, JSON.stringify({ selected: true })),
      ...(accountToUnselect ? [updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))] : [])
    ])
      .catch(console.error)
      .finally(() => {
        navigate(`accountfs/${address}/${defaultGenesisAndAssetId ?? `${POLKADOT_GENESIS}/0`}`) as void;
      });
  }, [account?.address, accounts, defaultGenesisAndAssetId, navigate]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ m: '2px 0 10px', width: '95%' }}>
      <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ m: '2px 10px', width: 'fit-content' }}>
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
        />
        <GoToAccountButton
          onClick={goToAccountPage}
        />
      </Stack>
    </Stack>
  );
}

export default React.memo(AccountRow);
