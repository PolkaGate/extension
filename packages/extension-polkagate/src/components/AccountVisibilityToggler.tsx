// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, type SxProps, type Theme } from '@mui/material';
import { Radar2 } from 'iconsax-react';
import React, { useCallback, useRef } from 'react';

import { useIsDark, useIsHovered, useSelectedAccount, useTranslation } from '../hooks';
import { showAccount } from '../messaging';
import { MyTooltip } from '.';

interface Props {
  size?: string | number;
  style?: React.CSSProperties;
}

function AccountVisibilityToggler({ size = '24', style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const account = useSelectedAccount();
  const ref = useRef<HTMLDivElement | null>(null);
  const hovered = useIsHovered(ref);

  const toggleVisibility = useCallback((): void => {
    account?.address && showAccount(account.address, account.isHidden || false).catch(console.error);
  }, [account?.address, account?.isHidden]);

  const containerStyle: SxProps<Theme> = {
    '&:hover': {
      bgcolor: '#674394'
    },
    alignItems: 'center',
    bgcolor: account?.isHidden ? 'transparent' : isDark ? '#AA83DC26' : '#FFFFFF',
    border: '1px solid',
    borderColor: account?.isHidden ? '#AA83DC26' : 'transparent',
    borderRadius: '16px',
    cursor: 'pointer',
    justifyContent: 'center',
    marginTop: '-5px',
    p: '7px',
    position: 'relative',
    transition: 'all 250ms ease-out',
    width: 'fit-content',
    ...style
  };

  return (
    <MyTooltip
      content={account?.isHidden
        ? t('This account is invisible to websites')
        : t('This account is visible to websites')}
    >
      <Grid container item onClick={toggleVisibility} ref={ref} sx={containerStyle}>
        <Radar2 color={!account?.isHidden && hovered ? '#EAEBF1' : isDark ? '#AA83DC' : '#745D8B'} size={size} />
        <Divider sx={{ bgcolor: '#FF4FB9', height: '1.5px', opacity: account?.isHidden ? 1 : 0, position: 'absolute', rotate: '-45deg', transition: 'all 150ms ease-out', width: '28px' }} />
      </Grid>
    </MyTooltip>
  );
}

export default AccountVisibilityToggler;
