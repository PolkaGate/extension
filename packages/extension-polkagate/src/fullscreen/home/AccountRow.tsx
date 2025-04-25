// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { ChevronRight, MoreVert } from '@mui/icons-material';
import { Grid, Stack } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';

import { AccountContext } from '../../components';
import { Account } from '../components';

function MoreButton ({ address }: { address?: string }): React.ReactElement {
  const navigate = useNavigate();
  const [chevronHovered, setChevronHovered] = useState<boolean>(false);

  const onMouseEnter = useCallback(() => {
    setChevronHovered(true);
  }, []);

  const onMouseLeaveChevron = useCallback(() => {
    setChevronHovered(false);
  }, []);

  return (
    <Grid
      alignItems='center' container item justifyContent='center'
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeaveChevron}
      sx={{ background: chevronHovered ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', borderRadius: '10px', border: '3px solid #1B133C', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px' }}
    >
      <MoreVert sx={{ color: chevronHovered ? '#EAEBF1' : '#AA83DC', fontSize: '25px' }} />
    </Grid>
  );
}

function GoToAccountButton ({ address, defaultGenesisAndAssetId }: { address?: string, defaultGenesisAndAssetId: string | undefined}): React.ReactElement {
  const { accounts } = useContext(AccountContext);
  const navigate = useNavigate();
  const [chevronHovered, setChevronHovered] = useState<boolean>(false);

  const onMouseEnter = useCallback(() => {
    setChevronHovered(true);
  }, []);

  const onMouseLeaveChevron = useCallback(() => {
    setChevronHovered(false);
  }, []);

  const goToAccountPage = useCallback(() => {
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
        navigate(`accountfs/${address}/${defaultGenesisAndAssetId ?? `${POLKADOT_GENESIS}/0`}`);
      });
  }, [accounts, address, defaultGenesisAndAssetId, navigate]);

  return (
    <Grid
      alignItems='center' container item justifyContent='center'
      onClick={goToAccountPage}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeaveChevron}
      sx={{ background: chevronHovered ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', borderRadius: '10px', border: '3px solid #1B133C', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px' }}
    >
      <ChevronRight sx={{ color: chevronHovered ? '#EAEBF1' : '#AA83DC', fontSize: '28px' }} />
    </Grid>
  );
}

function AccountRow ({ account }: { account: AccountWithChildren }): React.ReactElement {
  const [defaultGenesisAndAssetId, setDefaultGenesisAndAssetId] = useState<string>(); // 'genesisHash/assetId'

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ m: '2px 0 10px', width: '95%' }}>
      <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ m: '2px 10px', width: 'fit-content' }}>
        <PolkaGateIdenticon
          address={account.address}
          size={36}
        />
        <Account
          account={account}
          setDefaultGenesisAndAssetId={setDefaultGenesisAndAssetId}
        />
      </Stack>
      <Stack columnGap='5px' direction='row'>
        <MoreButton />
        <GoToAccountButton
          address={account?.address}
          defaultGenesisAndAssetId={defaultGenesisAndAssetId}
        />
      </Stack>
    </Stack>
  );
}

export default React.memo(AccountRow);
