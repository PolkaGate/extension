// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraInfo } from '@polkadot/extension-polkagate/src/hooks/useSoloStakingInfo';
import type { ValidatorDetailsType } from '@polkadot/extension-polkagate/src/hooks/useValidatorDetails';

import { Grid, Typography, useTheme } from '@mui/material';
import { Award, type IconProps, InfoCircle, Star1 } from 'iconsax-react';
import React from 'react';

import { DisplayBalance, MySkeleton, MyTooltip } from '@polkadot/extension-polkagate/src/components';
import { remainingTimeCountDown } from '@polkadot/extension-polkagate/src/util';

import { useChainInfo, useTranslation } from '../../../../hooks';
import CircularProgressWithLabel from './CircularProgressWithLabel';

interface Props {
  details: ValidatorDetailsType | undefined;
  eraInfo: EraInfo | undefined;
  genesisHash: string | undefined;
}

function Item ({ decimal, hint, skeletonWidth = 60, title, token, value }:
  { decimal?: number, hint?: string, skeletonWidth?: number, title: string, token?: string, value: string | null| number | undefined }): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignContent='center' alignItems='center' item sx={{ display: 'flex', flexWrap: 'nowrap' }}>
      <Typography color='text.secondary' sx={{ mr: '5px', whiteSpace: 'nowrap' }} textAlign='left' variant='B-2'>
        {title}
      </Typography>
      <Typography color='#AA83DC' sx={{ alignItems: 'center', bgcolor: '#AA83DC26', borderRadius: '1024px', display: 'flex', height: '19px', px: value != null ? '8px' : 0 }} variant='B-1'>
        {decimal && token
          ? <DisplayBalance
            balance={value as string}
            decimal={decimal}
            skeletonStyle={{ borderRadius: '10px', margin: '0', width: '88px' }}
            token={token}
            />
          : value != null
            ? value
            : <MySkeleton bgcolor='#AA83DC26' height={15} width={skeletonWidth} />
        }
      </Typography>
      {hint &&
        <MyTooltip content={hint} placement='top'>
          <InfoCircle color={theme.palette.primary.main} size='16' variant='Bold' />
        </MyTooltip>}
    </Grid>
  );
}

export default function Summary ({ details, eraInfo, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { decimal, token } = useChainInfo(genesisHash);

  const { APR, commission, commissionHint, isElected, rewardPoint, rewardPointHint, total } = details ?? {};

  const Icon = isElected
    ? {
      color: theme.palette.success.main,
      icon: Star1,
      size: 21,
      text: t('Active'),
      variant: 'Bulk'
    }
    : {
      color: theme.palette.text.disabled,
      icon: Award,
      size: 25,
      text: t('Waiting'),
      variant: 'Bulk'
    };

  return (
    <Grid container direction='column'>
      <Typography color='text.primary' sx={{ p: '10px' }} textAlign='left' variant='H-3'>
        {t('Validator Summary')}
      </Typography>
      <Grid alignItems='center' columnSpacing={3} container item justifyContent='flex-start' rowSpacing={2} sx={{ ml: '-20px' }} wrap='wrap'>
        <Grid alignItems='center' item sx={{ display: 'flex' }}>
          <Icon.icon color={Icon.color} size={Icon.size} variant={Icon.variant as IconProps['variant']} />
          <Typography color='#AA83DC' sx={{ backgroundColor: '#AA83DC26', borderRadius: '1024px', px: '10px' }} textAlign='left' variant='B-2'>
            {Icon.text}
          </Typography>
        </Grid>
        <Item
          hint={rewardPointHint}
          skeletonWidth={30}
          title={t('Rewards Points')}
          value={rewardPoint?.toString()}
        />
        <Item
          skeletonWidth={30}
          title={t('APR')}
          value={APR ? `${APR}%` : undefined}
        />
        <Item
          decimal={decimal}
          title={t('Total Stake')}
          token={token}
          value={total}
        />
        <Item
          hint={commissionHint}
          skeletonWidth={30}
          title={t('Commission')}
          value={commission !== undefined ? `${commission}%` : undefined}
        />
        <Grid alignItems='center' columnGap='10px' container direction='row' item sx={{ width: 'fit-content' }}>
          <Item
            title={t('Era Progress')}
            value={eraInfo?.activeEraDuration ? remainingTimeCountDown(eraInfo.activeEraDuration / 1_000, false) : undefined}
          />
          <CircularProgressWithLabel
            size={50}
            value={eraInfo?.progressPercent ?? 0}
            variant={eraInfo?.progressPercent !== undefined ? 'determinate' : 'indeterminate'}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
