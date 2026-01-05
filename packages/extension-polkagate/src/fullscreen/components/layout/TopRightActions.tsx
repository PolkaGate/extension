// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import React from 'react';

import { useIsOnline } from '@polkadot/extension-polkagate/src/hooks/index';

import { HomeAccountDropDown, SelectedProxy } from '../../../components';
import { AccountChainSelect } from '..';
import CurrencySelection from './CurrencySelection';
import HideNumbers from './HideNumbers';
import InternetConnection from './InternetConnection';
import Notifications from './Notifications';

function MyDivider (): React.ReactElement {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)',
        height: '24px',
        mx: '5px',
        width: '1px'
      }}
    />
  );
}

interface Props {
  genesisHash?: string | undefined;
  selectedProxyAddress?: string | undefined;
  setShowProxySelection?: React.Dispatch<React.SetStateAction<boolean>>;
}

function TopRightActions ({ genesisHash, selectedProxyAddress, setShowProxySelection }: Props): React.ReactElement {
  const isOnline = useIsOnline();

  return (
    <Stack alignItems='center' columnGap='7px' direction='row' sx={{ position: 'absolute', right: 0, top: '7px' }}>
      {selectedProxyAddress && setShowProxySelection
        ? (
          <SelectedProxy
            genesisHash={genesisHash}
            signerInformation={{
              onClick: () => setShowProxySelection(true),
              selectedProxyAddress
            }}
            style={{ height: '32px', width: '140px' }}
            textMaxWidth = '50px'
          />)
        : <AccountChainSelect />
      }
      <MyDivider />
      <HideNumbers />
      <MyDivider />
      <CurrencySelection />
      <MyDivider />
      {isOnline
        ? <Notifications />
        : <InternetConnection />
      }
      <MyDivider />
      <HomeAccountDropDown
        style={{
          height: '32px',
          width: '48px'
        }}
      />
    </Stack>
  );
}

export default React.memo(TopRightActions);
