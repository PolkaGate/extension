// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
//@ts-ignore
import type { PalletStakingRewardDestination } from '@polkadot/types/lookup';

import { Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight, MoneyRecive, Repeat } from 'iconsax-react';
import React, { useMemo } from 'react';

import { ChainLogo, Identity2 } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';

interface Props {
  payee: PalletStakingRewardDestination;
  genesisHash: string;
}

interface StakeAdjustmentInfo {
  Icon?: Icon;
  account?: string;
  color: string;
  style: React.CSSProperties;
  text: string;
}

function Payee({ genesisHash, payee }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { Icon, account, color, style, text } = useMemo<StakeAdjustmentInfo>(() => {
    if (payee.isStaked) {
      return {
        Icon: Repeat,
        color: theme.palette.success.main,
        style: { transform: 'rotate(-45deg)' },
        text: t('Auto-stake rewards')
      };
    }

    if (payee.isStash) {
      return {
        Icon: MoneyRecive,
        color: theme.palette.success.main,
        style: { transform: 'rotate(135deg)' },
        text: t('Withdraw rewards')
      };
    }

    if (payee.isAccount) {
      return {
        account: String(payee.asAccount),
        color: theme.palette.success.main,
        style: { transform: 'rotate(135deg)' },
        text: t('Send rewards to')
      };
    }

    return {
      Icon: ArrowRight,
      color: theme.palette.primary.main,
      style: { display: 'none' },
      text: t('Set reward destination')
    };
  }, [payee, t, theme.palette.primary.main, theme.palette.success.main]);

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start'>
      <ChainLogo genesisHash={genesisHash} size={36} />
      <Stack alignItems='flex-start' direction='column'>
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color='#BEAAD8' sx={{ textWrapMode: 'noWrap' }} variant='B-4'>
            {text}
          </Typography>
          {account
            ? <Identity2
              address={account}
              addressStyle={{ color: 'text.secondary', variant: 'B-4' }}
              charsCount={4}
              genesisHash={genesisHash}
              identiconSize={15}
              identiconStyle={{ marginRight: '5px' }}
              showSocial={false}
              style={{ color: 'text.primary', variant: 'B-2' }}
            />
            : Icon && <Icon
              color={color}
              size={14}
              style={{ ...style }}
              variant='Linear'
            />}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(Payee);
