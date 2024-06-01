// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, IconButton, Skeleton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';
import { Reserved } from '@polkadot/extension-polkagate/src/hooks/useReservedDetails';
import { noop } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import { FormatPrice, ShowBalance, ShowValue } from '../../../components';
import { toTitleCase } from '../../governance/utils/util';

interface Props {
  amount: BN | Balance | undefined;
  title: string;
  token: string | undefined;
  decimal: number | undefined;
  price: number | undefined;
  onClick?: () => void;
  disabled?: boolean;
  reservedDetails?: Reserved | null | undefined
  isOnRelayChain?: boolean;
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

function WaitForReserved ({ rows = 2, skeletonHeight = 20, skeletonWidth = 30, style }: WaitForReservedProps): React.ReactElement<Props> {
  return (
    <Grid container justifyContent='center' sx={{ ...style }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Grid container justifyContent='space-between' key={index}>
          <Skeleton
            animation='wave'
            height={skeletonHeight}
            sx={{ my: '5px', transform: 'none', width: `${skeletonWidth}%` }}
          />
          <Skeleton
            animation='wave'
            height={skeletonHeight}
            sx={{ my: '5px', transform: 'none', width: `${skeletonWidth}%` }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

const ReservedDetails = ({ reservedDetails, showReservedDetails }: ReservedDetailsType) => (
  <Collapse in={showReservedDetails} sx={{ width: '100%' }}>
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'divider', fontSize: '16px', mt: '10px', mx: '10%', width: '82%' }}>
      {Object.entries(reservedDetails)?.length
        ? <Grid container direction='column' item rowGap='10px'>
          {Object.entries(reservedDetails)?.map(([key, value], index) => (
            <Grid container item justifyContent='space-between' key={index} sx={{ fontSize: '17px', fontWeight: 400 }}>
              <Grid item>
                {toTitleCase(key)}
              </Grid>
              <Grid fontWeight={600} item>
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

export default function DisplayBalance ({ amount, decimal, disabled, isOnRelayChain, onClick, price, reservedDetails, title, token }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const isReserved = title === t('Reserved');

  const [showReservedDetails, setShowReservedDetails] = useState<boolean>(false);

  const toggleShowReservedDetails = useCallback(() => {
    reservedDetails && !amount?.isZero() && setShowReservedDetails(!showReservedDetails);
  }, [amount, reservedDetails, showReservedDetails]);

  useEffect(() => {
    setShowReservedDetails(false); // to reset collapsed area on chain change
  }, [token]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px 40px' }}>
      <Typography fontSize='18px' fontWeight={400}>
        {title}
      </Typography>
      <Grid alignItems='center' container item width='fit-content'>
        <Grid item sx={{ fontSize: '22px', fontWeight: 600 }}>
          <ShowBalance
            balance={amount}
            decimal={decimal}
            decimalPoint={3}
            token={token}
            withCurrency
          />
        </Grid>
        <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '35px', mx: '10px', my: 'auto' }} />
        <Grid item sx={{ '> div span': { display: 'block' }, fontSize: '22px', fontWeight: 400 }}>
          <FormatPrice
            amount={amount}
            decimals={decimal}
            price={price}
            skeletonHeight={20}
          />
        </Grid>
        {onClick &&
          <Grid item m='auto' pl='8px'>
            <IconButton
              onClick={disabled ? noop : onClick}
              sx={{ p: '8px' }}
            >
              <ArrowForwardIosRoundedIcon
                sx={{
                  color: disabled ? 'text,disabled' : 'secondary.light',
                  fontSize: '24px',
                  stroke: `${disabled ? theme.palette.text.disabled : theme.palette.secondary.light}`,
                  strokeWidth: 1.5
                }}
              />
            </IconButton>
          </Grid>
        }
        {isReserved && isOnRelayChain &&
          <Grid item m='auto' pl='8px'>
            <IconButton
              sx={{ p: '8px' }}
            >
              <ArrowForwardIosRoundedIcon
                onClick={toggleShowReservedDetails}
                sx={{
                  color: amount?.isZero() ? 'text.disabled' : 'secondary.light',
                  cursor: amount?.isZero() ? 'unset' : 'pointer',
                  fontSize: '26px',
                  stroke: amount?.isZero() ? theme.palette.text.disabled : theme.palette.secondary.light,
                  strokeWidth: 1,
                  transform: !amount?.isZero() && showReservedDetails ? 'rotate(-90deg)' : 'rotate(90deg)',
                  transitionDuration: '0.3s',
                  transitionProperty: 'transform'
                }}
              />
            </IconButton>
          </Grid>
        }
      </Grid>
      {reservedDetails &&
        <ReservedDetails
          reservedDetails={reservedDetails}
          showReservedDetails={showReservedDetails}
        />
      }
    </Grid>
  );
}
