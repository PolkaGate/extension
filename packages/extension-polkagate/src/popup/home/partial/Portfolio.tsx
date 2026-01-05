// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { Eye, EyeSlash } from 'iconsax-react';
import React from 'react';

import { AccountVisibilityToggler, FormatPrice } from '../../../components';
import { useIsDark, useIsHideNumbers, usePortfolio, useSelectedAccount, useTranslation } from '../../../hooks';
import { GlowBox } from '../../../style';
import Currency from './Currency';
import DailyChange from './DailyChange';

function Portfolio(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const account = useSelectedAccount();
  const youHave = usePortfolio(account?.address);

  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();

  const eyeColor = isDark ? '#BEAAD8' : '#745D8B';
  const EyeIcon = isHideNumbers ? EyeSlash : Eye;

  return (
    <GlowBox>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '15px 20px 5px' }}>
        <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content' }}>
          <Typography color={isDark ? 'text.secondary' : '#291443'} variant='B-2'>
            {t('Account Portfolio')}
          </Typography>
          <EyeIcon color={eyeColor} onClick={toggleHideNumbers} size='20' style={{ cursor: 'pointer' }} variant='Bulk' />
        </Grid>
        <Currency />
        <Grid alignItems='center' container item sx={{ height: '40px' }}>
          {youHave?.portfolio === undefined
            ? <Skeleton
              animation='wave'
              height='24px'
              sx={{ bgcolor: '#BEAAD840', borderRadius: '50px', fontWeight: 'bold', maxWidth: '245px', transform: 'none', width: '100%' }}
              variant='text'
            />
            : <FormatPrice
              commify
              decimalColor={theme.palette.text.secondary}
              dotStyle={'big'}
              fontFamily='OdibeeSans'
              fontSize='40px'
              fontWeight={400}
              height={40}
              num={youHave?.portfolio}
              width='fit-content'
              withSmallDecimal
            />
          }
        </Grid>
        <DailyChange
          address={account?.address}
        />
        <AccountVisibilityToggler />
      </Grid>
    </GlowBox>
  );
}

export default React.memo(Portfolio);
