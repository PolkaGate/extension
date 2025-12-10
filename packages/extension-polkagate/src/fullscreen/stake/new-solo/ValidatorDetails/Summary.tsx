// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorDetailsType } from '@polkadot/extension-polkagate/src/hooks/useValidatorDetails';

import { Grid, Typography, useTheme } from '@mui/material';
import { Award, Crown, type IconProps } from 'iconsax-react';
import React from 'react';

import { DisplayBalance, MySkeleton } from '@polkadot/extension-polkagate/src/components';

import { useChainInfo, useTranslation } from '../../../../hooks';

interface Props {
  details: ValidatorDetailsType | undefined;
  genesisHash: string | undefined;
}

function Item ({ decimal, skeletonWidth = 60, title, token, value }:
  { decimal?: number, skeletonWidth?: number, title: string, token?: string, value: string | number | undefined }): React.ReactElement {
  return (
    <Grid alignContent='center' alignItems='center' item sx={{ display: 'flex', flexWrap: 'nowrap' }}>
      <Typography color='#BEAAD8' sx={{ mr: '5px', whiteSpace: 'nowrap' }} textAlign='left' variant='B-2'>
        {title}
      </Typography>
      <Typography color='#AA83DC' sx={{ alignItems: 'center', bgcolor: '#AA83DC26', borderRadius: '1024px', display: 'flex', height: '19px', px: value != null ? '10px' : 0 }} variant='B-2'>
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
    </Grid>
  );
}

export default function Summary ({ details, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { decimal, token } = useChainInfo(genesisHash);

  const { commission, isElected, rewardPoint, total } = details ?? {};

  const Icon = isElected
    ? {
      color: theme.palette.success.main,
      icon: Crown,
      size: 21,
      text: t('Active'),
      variant: 'Bold'
    }
    : {
      color: theme.palette.text.disabled,
      icon: Award,
      size: 25,
      text: t('Waiting'),
      variant: 'Outline'
    };

  return (
    <Grid container direction='column'>
      <Typography color='text.primary' sx={{ p: '10px' }} textAlign='left' variant='H-3'>
        {t('Validator Summary')}
      </Typography>
      <Grid alignItems='center' columnSpacing={4} container item justifyContent='flex-start' rowSpacing={2} sx={{ ml: '-20px' }} wrap='wrap'>
        <Grid alignItems='center' item sx={{ display: 'flex' }}>
          <Icon.icon color={Icon.color} size={Icon.size} variant={Icon.variant as IconProps['variant']} />
          <Typography color='#AA83DC' sx={{ backgroundColor: '#AA83DC26', borderRadius: '1024px', px: '10px' }} textAlign='left' variant='B-2'>
            {Icon.text}
          </Typography>
        </Grid>
        <Item
          skeletonWidth={30}
          title={t('Rewards Points')}
          value={rewardPoint?.toString()}
        />
        <Item
          decimal={decimal}
          title={t('Total Stake')}
          token={token}
          value={total}
        />
        <Item
          skeletonWidth={30}
          title={t('Commission')}
          value={commission !== undefined ? `${commission}%` : undefined}
        />
      </Grid>
    </Grid>
  );
}
