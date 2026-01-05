// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '@polkadot/extension-polkagate/util/types';
import type { ExtraFilters } from './types';

import { Box, Stack } from '@mui/material';
import React from 'react';

import ChainDropDown from '@polkadot/extension-polkagate/src/components/ChainDropDown';

import { AccountSelectionDropDown } from '../../components';
import StatusDropDown from './StatusDropDown';
import TransactionTypeDropDown from './TransactionTypeDropDown';

interface Props {
  allHistories: TransactionDetail[] | null | undefined;
  setExtraFilters: React.Dispatch<React.SetStateAction<ExtraFilters>>;
  extraFilters: ExtraFilters
}

function HistoryFilterRow ({ allHistories, extraFilters, setExtraFilters }: Props): React.ReactElement {
  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start' sx={{ m: '12px 13px 4px', width: 'fit-content' }}>
      <Stack alignItems='center' direction='row' justifyContent='start' sx={{ border: '1px solid #BEAAD833', borderRadius: '12px', width: 'fit-content' }}>
        <AccountSelectionDropDown
          style={{ border: 'none', height: '42px', margin: '0', width: '180px' }}
        />
        <Box sx={{ background: 'linear-gradient(0deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)', height: '24px', width: '1px' }} />
        <ChainDropDown
          style={{ border: 'none', height: '42px', margin: '0', width: '210px' }}
          withSelectAChainText={false}
        />
      </Stack>
      <TransactionTypeDropDown
        allHistories={allHistories}
        extraFilters={extraFilters}
        setExtraFilters={setExtraFilters}
      />
      <StatusDropDown
        extraFilters={extraFilters}
        setExtraFilters={setExtraFilters}
      />
    </Stack>
  );
}

export default React.memo(HistoryFilterRow);
