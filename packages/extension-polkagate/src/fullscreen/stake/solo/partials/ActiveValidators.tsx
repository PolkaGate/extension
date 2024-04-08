// Copyright 2019-2024 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show rewards chart
 * */
import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { } from 'react';

import { useActiveValidators, useInfo, useStakingConsts, useTranslation } from '../../../../hooks';
import ShowValidator from './ShowValidator';

interface Props {
  address?: string;
}

export default function ActiveValidators ({ address }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, decimal, token } = useInfo(address);

  const activeValidators = useActiveValidators(address);
  const stakingConsts = useStakingConsts(address);

  const SKELETON_COUNT = 4;

  console.log('activeValidators:', activeValidators);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'background.paper', border: theme.palette.mode === 'dark' ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', maxHeight: 'fit-content', p: '10px', width: 'inherit' }}>
      <Grid alignItems='center' container item justifyContent='center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography color={ 'text.primary'} fontSize='18px' fontWeight={500}>
          {activeValidators?.length && activeValidators.length > 1 ? t('Active Validators') : t('Active Validator')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' mt='10px'>
        { activeValidators
          ? activeValidators.map((v, index) => (
            <Grid container item key={index} sx={{ borderTop: index > 0 ? '1px solid' : undefined, borderTopColor: 'divider', overflowY: 'scroll' }}>
              <ShowValidator
                accountInfo={v.accountInfo}
                allInOneRow={false}
                api={api}
                chain={chain}
                decimal={decimal}
                isActive={true}
                isOversubscribed={v.isOversubscribed}
                stakingConsts={stakingConsts}
                token={token}
                v={v}
              />
            </Grid>
          ))
          : activeValidators === undefined
            ? <>
              {
                Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <Grid container key={index}>
                    <Skeleton
                      animation='wave'
                      height='20px'
                      sx={{ display: 'inline-block', fontWeight: 'bold', my: '5px', transform: 'none', width: `${100 / (SKELETON_COUNT - index)}%` }}
                    />
                  </Grid>
                ))
              }
            </>
            : <Typography color={ 'text.primary'} fontSize='16px' fontWeight={500}>
              { t('No Active Validators Found!')}
            </Typography>
        }
      </Grid>
    </Grid>
  );
}
