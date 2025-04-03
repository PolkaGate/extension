// Copyright 2019-2025 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { Collapse, Divider, Grid, Skeleton, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';
import useReservedDetails, { type Reserved } from '@polkadot/extension-polkagate/src/hooks/useReservedDetails';
import { isOnAssetHub, isOnRelayChain } from '@polkadot/extension-polkagate/src/util/utils';

import { ShowValue } from '../../../components';
import { useInfo } from '../../../hooks';
import { toTitleCase } from '../../governance/utils/util';
import DisplayBalance from './DisplayBalance';

interface Props {
  address: string | undefined;
  amount: BN | Balance | undefined;
  price: number | undefined;
  disabled?: boolean;
}

interface ReservedDetailsType {
  showReservedDetails: boolean;
  reservedDetails: Reserved;
}

interface WaitForReservedProps {
  rows?: number;
  skeletonHeight?: number;
  skeletonWidth?: number;
  style?: SxProps<Theme> | undefined;
}

function WaitForReserved({ rows = 2, skeletonHeight = 20, skeletonWidth = 60, style }: WaitForReservedProps): React.ReactElement {
  return (
    <Grid container justifyContent='center' sx={{ ...style }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Grid container key={index.toString()}>
          <Grid item xs={4}>
            <Skeleton
              animation='wave'
              height={skeletonHeight}
              sx={{ my: '5px', transform: 'none', width: `${skeletonWidth}%` }}
            />
          </Grid>
          <Grid item xs={4}>
            <Skeleton
              animation='wave'
              height={skeletonHeight}
              sx={{ my: '5px', transform: 'none', width: `${skeletonWidth}%` }}
            />
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
}

const ReservedDetails = ({ reservedDetails, showReservedDetails }: ReservedDetailsType) => {
  const { t } = useTranslation();

  return (
    <Collapse in={showReservedDetails} sx={{ width: '100%' }}>
      <Divider sx={{ bgcolor: 'divider', height: '1px', m: '3px auto', width: '90%' }} />
      <Grid container sx={{ float: 'right', fontSize: '16px', my: '10px', width: '85%' }}>
        <Typography fontSize='16px' fontWeight={500}>
          {t('Reasons')}
        </Typography>
        {Object.entries(reservedDetails)?.length
          ? <Grid container direction='column' item>
            {Object.entries(reservedDetails)?.map(([key, value], index) => (
              <Grid container item key={index} sx={{ fontSize: '16px' }}>
                <Grid item sx={{ fontWeight: 300 }} xs={4}>
                  {toTitleCase(key)}
                </Grid>
                <Grid fontWeight={400} item>
                  <ShowValue height={20} value={value?.toHuman()} />
                </Grid>
              </Grid>
            ))
            }
          </Grid>
          : <WaitForReserved rows={2} />
        }
      </Grid>
    </Collapse>
  );
};

export default function ReservedDisplayBalance({ address, amount, disabled, price }: Props): React.ReactElement {
  const { t } = useTranslation();
  const reservedDetails = useReservedDetails(address);
  const { decimal, genesisHash, token } = useInfo(address);

  const [showReservedDetails, setShowReservedDetails] = useState<boolean>(false);

  useEffect(() => {
    setShowReservedDetails(false); // to reset collapsed area on chain change
  }, [genesisHash]);

  const toggleShowReservedDetails = useCallback(() => {
    reservedDetails && !amount?.isZero() && setShowReservedDetails(!showReservedDetails);
  }, [amount, reservedDetails, showReservedDetails]);

  return !genesisHash || isOnAssetHub(genesisHash)
    ? <></>
    : (
      <Grid container item sx={{ '> div': { bgcolor: 'unset', boxShadow: 'none' }, bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)' }}>
        <DisplayBalance
          amount={amount}
          decimal={decimal}
          disabled={disabled}
          onClick={isOnRelayChain(genesisHash) ? toggleShowReservedDetails : undefined}
          openCollapse={showReservedDetails}
          price={price}
          title={t('Reserved')}
          token={token}
        />
        <ReservedDetails
          reservedDetails={reservedDetails}
          showReservedDetails={showReservedDetails}
        />
      </Grid>
    );
}
