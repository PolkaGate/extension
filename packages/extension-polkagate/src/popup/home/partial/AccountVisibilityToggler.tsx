// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, type SxProps, type Theme } from '@mui/material';
import { Radar2 } from 'iconsax-react';
import React, { useCallback, useRef, useState } from 'react';

import { Tooltip } from '../../../components';
import { useAccount, useTranslation } from '../../../hooks';
import { showAccount } from '../../../messaging';

function AccountVisibilityToggler (): React.ReactElement {
  const { t } = useTranslation();
  const account = useAccount('5CGQ7BPJZZKNirQgVhzbX9wdkgbnUHtJ5V7FkMXdZeVbXyr9');
  const ref = useRef(null);

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  const toggleVisibility = useCallback((): void => {
    account?.address && showAccount(account.address, account.isHidden || false).catch(console.error);
  }, [account?.address, account?.isHidden]);

  const containerStyle: SxProps<Theme> = {
    '&:hover': {
      bgcolor: '#674394'
    },
    alignItems: 'center',
    bgcolor: account?.isHidden ? 'transparent' : '#AA83DC26',
    border: '1px solid',
    borderColor: account?.isHidden ? '#AA83DC26' : 'transparent',
    borderRadius: '16px',
    cursor: 'pointer',
    justifyContent: 'center',
    p: '7px',
    position: 'relative',
    transition: 'all 250ms ease-out',
    width: 'fit-content'
  };

  return (
    <>
      <Grid container item onClick={toggleVisibility} onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} ref={ref} sx={containerStyle}>
        <Radar2 color={!account?.isHidden && hovered ? '#EAEBF1' : '#AA83DC'} size='24' />
        <Divider sx={{ bgcolor: '#FF4FB9', height: '1.5px', opacity: account?.isHidden ? 1 : 0, position: 'absolute', rotate: '-45deg', transition: 'all 150ms ease-out', width: '28px' }} />
      </Grid>
      <Tooltip
        content={account?.isHidden
          ? t('This account is invisible to websites')
          : t('This account is visible to websites')}
        targetRef={ref}
      />
    </>
  );
}

export default AccountVisibilityToggler;
