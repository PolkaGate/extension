// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReviewProps } from './Review';

import { Grid } from '@mui/material';
import React from 'react';

import { BackWithLabel, Motion } from '../components';
import { useChainInfo, useTranslation } from '../hooks';
import Review from './Review';
import { UserDashboardHeader } from '.';

export interface TransactionFlowProps extends ReviewProps {
  closeReview: () => void;
  backPathTitle: string;
}

export default function TransactionFlow ({ backPathTitle, closeReview, genesisHash, transactionInformation, tx }: TransactionFlowProps): React.ReactElement {
  const { t } = useTranslation();
  const { api, chain, chainName, decimal, token } = useChainInfo(genesisHash);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noAccountSelected />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={closeReview}
            style={{ pb: 0 }}
            text={backPathTitle}
          />
          <Review
            genesisHash={genesisHash}
            transactionInformation={transactionInformation}
            tx={tx}
          />
        </Motion>
      </Grid>
    </>
  );
}
